/**
 * Retrieves the time zone ID for a given location using the Google Maps Geocoding and Time Zone APIs.
 * - Geocodes the location to retrieve latitude and longitude.
 * - Fetches the time zone ID for the geocoded coordinates.
 *
 * @param {string} location - The location name or address to resolve.
 * @returns {string|null} - The time zone ID (e.g., "America/New_York") if successful, or null if an error occurs.
 */
function getTimeZoneFromLocation(location) {
  console.log("Getting timezone from location: ", location);
  try {
    const geocoder = Maps.newGeocoder();
    const response = geocoder.geocode(location);
    
    if (response.status === 'OK' && response.results.length > 0) {
      const result = response.results[0];
      const lat = result.geometry.location.lat;
      const lng = result.geometry.location.lng;
      
      const apiKey = GOOGLE_MAPS_API_KEY;
      const timestamp = Math.floor(Date.now() / 1000); // Current timestamp in seconds
      const timezoneUrl = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${apiKey}`;
      const timezoneResponse = UrlFetchApp.fetch(timezoneUrl);
      const timezoneData = JSON.parse(timezoneResponse.getContentText());
      
      if (timezoneData.status === 'OK') {
        return timezoneData.timeZoneId; // Returns the time zone ID (e.g., "America/New_York")
      } else {
        throw new Error('Error fetching timezone: ' + timezoneData.errorMessage);
      }
    } else {
      throw new Error('Error geocoding location: ' + response.status);
    }
  } catch (error) {
    Logger.log('An error occurred: ' + error.message);
    return null;
  }
}

/**
 * Returns a list of time zone IDs for English-speaking countries and regions.
 * - Includes major English-speaking countries like the United States, United Kingdom, Canada, Australia, and others.
 * - Provides coverage for additional regions with English as an official language.
 *
 * @returns {string[]} - An array of time zone IDs (e.g., "America/New_York").
 */
function getEnglishSpeakingCountryTimezones() {
  return [
    // United States
    "America/New_York",      // Eastern Time
    "America/Chicago",       // Central Time
    "America/Denver",        // Mountain Time
    "America/Los_Angeles",   // Pacific Time
    "America/Anchorage",     // Alaska Time
    "Pacific/Honolulu",      // Hawaii Time

    // Canada
    "America/Toronto",       // Eastern Time
    "America/Winnipeg",      // Central Time
    "America/Edmonton",      // Mountain Time
    "America/Vancouver",     // Pacific Time
    "America/St_Johns",      // Newfoundland Time

    // United Kingdom
    "Europe/London",         // Greenwich Mean Time (GMT)

    // Australia
    "Australia/Sydney",      // Eastern Standard Time
    "Australia/Brisbane",    // Eastern Standard Time (no DST)
    "Australia/Adelaide",    // Central Standard Time
    "Australia/Perth",       // Western Standard Time

    // Ireland
    "Europe/Dublin",         // GMT or Irish Standard Time (DST)

    // New Zealand
    "Pacific/Auckland",      // New Zealand Standard Time
    "Pacific/Chatham",       // Chatham Island Time

    // South Africa
    "Africa/Johannesburg",   // South Africa Standard Time

    // Other English-Speaking Regions
    "Pacific/Fiji",          // Fiji Time
    "Pacific/Port_Moresby",  // Papua New Guinea Time
    "America/Jamaica",       // Jamaica Standard Time
    "Atlantic/Bermuda",      // Atlantic Standard Time
    "America/Nassau",        // Bahamas
    "Indian/Mauritius",      // Mauritius Time
    "Pacific/Guam",          // Guam Standard Time
    "Pacific/Saipan",        // Northern Mariana Islands
    "America/Barbados",      // Barbados Time

    // Caribbean (British Overseas Territories)
    "America/Grand_Turk",    // Turks and Caicos Islands
    "America/Cayman",        // Cayman Islands

    // Hong Kong (former British colony)
    "Asia/Hong_Kong",        // Hong Kong Time

    // Singapore (English as one of the official languages)
    "Asia/Singapore"         // Singapore Time
  ];
}

function getTimezonesAtTime(time) {
  const timezones = getEnglishSpeakingCountryTimezones();
  const now = new Date();

  targetHour = time;
  // Ensure the target hour is a valid 24-hour format string
  const formattedTargetHour = String(targetHour).padStart(2, "0");

  // Filter timezones where the local hour matches the targeted hour
  const matchingTimezones = timezones.filter((timezone) => {
    const localHour = Utilities.formatDate(now, timezone, "HH");
    return localHour === formattedTargetHour;
  });

  formattedTimezones = matchingTimezones.map((timezone) => replaceSlashesWithDashes(timezone)); //match db formatting

  Logger.log(`Timezones with local hour ${formattedTargetHour}: ${JSON.stringify(formattedTimezones)}`);
  return "Australia_Brisbane"; //TODO REMOVE
  // return formattedTimezones;
}

/**
 * Fetches UUIDs and their associated user data for the specified timezones.
 * - Retrieves timezones from integer time.
 * - Fetches UUIDs from the exec_time table for those timezones.
 * - Retrieves user data for each UUID and organizes it into a JSON object.
 *
 * @returns {Object|null} - An object containing UUIDs as keys and user data as values, or null if no data is found.
 */
function fetchUUIDsForTimezone(time) {
  const timezones = getTimezonesAtTime(time);
  console.log("Timezones at 6 AM:", JSON.stringify(timezones, null, 2));

  if (Object.keys(timezones).length !== 0) {
  // Fetch user data for these timezones
  const uuids = getUUIDDataFromExecTimeTable(timezones);
  console.log("UUIDs for Timezone:", JSON.stringify(uuids, null, 2));

    // Process and store user UUIDs if data exists
    if (uuids) {
      const jsonData = {};
      uuids.forEach((uuid) => {
          const userData = getUserDataFromFirebase(uuids);
          jsonData[uuid] = userData; 
      });

      return jsonData;
    } else {
      console.log("No users found for the given timezones.");
      return null;
    }
  }

}


