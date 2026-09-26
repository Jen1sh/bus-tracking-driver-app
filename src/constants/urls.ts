export const Urls = {
  auth: {
    login: 'auth/login',
    refreshToken: 'auth/refresh',
  },
  trip: {
    // Neither takes a request body. `endTrip` takes an optional `tripId` *query* param.
    startTrip: 'trips/start',
    endTrip: 'trips/end',
  },
  location: {
    updateLocation: 'location/update',
  },
  driver: {
    // The one writing GET: it materialises today's `trips` rows, which `trips/start` requires.
    assignment: 'driver/assignment',
    // Read-only. Answers for future dates, so it never creates a row.
    schedule: 'driver/schedule',
    currentTrip: 'driver/trip/current',
    rollSheet: 'driver/trip/current/roll-sheet',
  },
};
