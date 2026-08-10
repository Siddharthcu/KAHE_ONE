const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// How fast the simulated bus moves, in "stops per minute".
// (Placeholder for a real GPS feed - swap the position update logic below
// for real coordinates/ETA from a GPS provider later.)
const SIM_SPEED_STOPS_PER_MIN = 0.28;

let lastTick = Date.now();

function advanceBuses() {
  const now = Date.now();
  const elapsedMinutes = (now - lastTick) / 60000;
  lastTick = now;
  if (elapsedMinutes <= 0) return;

  const buses = db.prepare('SELECT * FROM buses').all();
  for (const bus of buses) {
    const stops = db
      .prepare('SELECT * FROM bus_stops WHERE bus_id = ? ORDER BY stop_order')
      .all(bus.id);
    if (stops.length === 0) continue;

    const maxIndex = stops.length - 1;
    let pos = bus.current_position + elapsedMinutes * SIM_SPEED_STOPS_PER_MIN;

    // Loop back to the start once it reaches the last stop (campus),
    // simulating the bus starting its route again.
    if (pos > maxIndex) pos = pos % maxIndex;

    db.prepare('UPDATE buses SET current_position = ? WHERE id = ?').run(pos, bus.id);
  }
}

function formatTime(date) {
  return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
}

router.get('/', requireAuth, (req, res) => {
  advanceBuses();

  const buses = db.prepare('SELECT * FROM buses').all();
  const result = buses.map(bus => {
    const stops = db
      .prepare('SELECT stop_name, stop_order, distance_km FROM bus_stops WHERE bus_id = ? ORDER BY stop_order')
      .all(bus.id);
    const maxIndex = stops.length - 1;
    const pos = Math.min(bus.current_position, maxIndex);

    const currentStopIndex = Math.floor(pos);
    const progressToNextStop = pos - currentStopIndex;
    const nextStop = stops[Math.min(currentStopIndex + 1, maxIndex)];
    const remainingStops = maxIndex - pos;
    const etaMinutes = Math.max(0, Math.round(remainingStops * bus.minutes_per_stop));

    let statusText;
    if (pos >= maxIndex - 0.02) {
      statusText = `At ${stops[maxIndex].stop_name}`;
    } else if (progressToNextStop < 0.05) {
      statusText = `At ${stops[currentStopIndex].stop_name}`;
    } else {
      statusText = `Between ${stops[currentStopIndex].stop_name} and ${nextStop.stop_name}`;
    }

    // Anchor time = the moment the bus would have been at stop 0, worked
    // backwards from its current live position. Every stop's scheduled time
    // is built from that anchor, so the timetable stays consistent as the
    // bus moves and stays in sync with "now".
    const anchorMs = Date.now() - pos * bus.minutes_per_stop * 60000;

    const stopTimes = stops.map(stop => {
      const scheduledMs = anchorMs + stop.stop_order * bus.minutes_per_stop * 60000;
      const liveMs = scheduledMs + bus.delay_minutes * 60000;
      return {
        stopName: stop.stop_name,
        distanceKm: stop.distance_km,
        scheduledTime: formatTime(new Date(scheduledMs)),
        liveTime: formatTime(new Date(liveMs)),
        passed: stop.stop_order <= pos + 0.001
      };
    });

    return {
      id: bus.id,
      busNumber: bus.bus_number,
      routeName: bus.route_name,
      stops: stopTimes,
      position: pos,
      currentStopIndex,
      status: statusText,
      etaMinutes,
      delayMinutes: bus.delay_minutes
    };
  });

  res.json({ buses: result, serverTime: Date.now() });
});

module.exports = router;
