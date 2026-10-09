// Node applies a runtime change to process.env.TZ immediately, so this pins
// the zone for every test file regardless of how the worker was started.
process.env.TZ = 'America/Chicago';
