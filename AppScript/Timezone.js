/**
 * Retrieves timezones from Firebase and filters them based on the target hour.
 *
 * @param {number} targetHour - The target hour (0-23) to match timezones against.
 * @returns {string[]} - An array of matching timezones where the local hour matches the target hour.
 */
function getTimezonesAtTime(targetHour) {
    Logger.log(`Fetching timezones from Firebase to filter by target hour: ${targetHour}`);

    const timezones = getTimezonesArrayListFromFirebase(); // Retrieve the timezone list
    if (!Array.isArray(timezones) || timezones.length === 0) {
        Logger.log("No valid timezones found in Firebase.");
        return [];
    }

    // Convert stored format to proper IANA format using the existing normalizeTimezone function
    const validTimezones = timezones.map(tz => normalizeTimezone(tz));
    Logger.log(`Processing ${validTimezones.length} timezones in IANA format`);

    // Ensure proper format for target hour
    const formattedTargetHour = String(targetHour).padStart(2, "0");

    // Filter timezones where the local hour matches the target hour
    const matchingTimezones = [];
    
    for (let i = 0; i < validTimezones.length; i++) {
        const timezone = validTimezones[i];
        try {
            const now = new Date();
            const localTime = new Intl.DateTimeFormat("en-US", {
                timeZone: timezone,
                hour: "2-digit",
                hour12: false
            }).format(now);

            if (localTime === formattedTargetHour) {
                // Use the original Firebase format timezone
                matchingTimezones.push(timezones[i]);
                Logger.log(`✅ Timezone ${timezone} matched target hour ${targetHour}`);
            }
        } catch (error) {
            Logger.log(`❌ Error processing timezone ${timezone}: ${error.message}`);
            // Continue with the next timezone
        }
    }

    Logger.log(`Timezones where it is currently ${targetHour}:00 → ${JSON.stringify(matchingTimezones)}`);
    return matchingTimezones;
}


/**
 * Retrieves timezones from Firebase and filters them based on the target hour.
 *
 * @param {number} targetHour - The target hour (0-23) to match timezones against.
 * @returns {string[]} - An array of matching timezones where the local hour matches the target hour.
 */
function getTimezonesAtTime(targetHour) {
    Logger.log(`Fetching timezones from Firebase to filter by target hour: ${targetHour}`);

    const timezones = getTimezonesArrayListFromFirebase(); // Retrieve the timezone list
    if (!Array.isArray(timezones) || timezones.length === 0) {
        Logger.log("No valid timezones found in Firebase.");
        return [];
    }

    // Convert stored format to proper IANA format using our new function
    const validTimezones = timezones.map(tz => transformTimezoneToIANAFormat(tz));
    Logger.log(`Processing ${validTimezones.length} timezones in IANA format`);

    // Ensure proper format for target hour
    const formattedTargetHour = String(targetHour).padStart(2, "0");

    // Filter timezones where the local hour matches the target hour
    const matchingTimezones = [];
    for (const timezone of validTimezones) {
        try {
            const now = new Date();
            const localTime = new Intl.DateTimeFormat("en-US", {
                timeZone: timezone,
                hour: "2-digit",
                hour12: false
            }).format(now);

            if (localTime === formattedTargetHour) {
                // Find the original Firebase format for this timezone
                const index = validTimezones.indexOf(timezone);
                if (index !== -1) {
                    matchingTimezones.push(timezones[index]);
                    Logger.log(`✅ Timezone ${timezone} matched target hour ${targetHour}`);
                }
            }
        } catch (error) {
            Logger.log(`❌ Error processing timezone ${timezone}: ${error.message}`);
            // Continue with the next timezone
        }
    }

    Logger.log(`Timezones where it is currently ${targetHour}:00 → ${JSON.stringify(matchingTimezones)}`);
    return matchingTimezones;
}

/**
 * Retrieves the timezone ID for a given location using Google Maps APIs.
 * Uses Geocoding API to convert location to coordinates, then Timezone API to get the timezone.
 *
 * @param {string} location - The location string (e.g., "denver, co" or "Australia Brisbane").
 * @param {string} uuid - The user's UUID (for logging purposes).
 * @returns {string|null} - The IANA timezone ID (e.g., "America/Denver"), or null if an error occurs.
 */
function getTimeZoneFromLocation(location, uuid) {
    Logger.log(`🌍 Getting timezone for location: ${location} (UUID: ${uuid})`);
    
    try {
        // Step 1: Use Geocoding API to convert location to coordinates
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${GOOGLE_MAPS_API_KEY}`;
        
        const geocodeResponse = UrlFetchApp.fetch(geocodeUrl, { muteHttpExceptions: true });
        const geocodeData = JSON.parse(geocodeResponse.getContentText());
        
        if (geocodeData.status !== "OK" || !geocodeData.results || geocodeData.results.length === 0) {
            Logger.log(`❌ Geocoding failed for location: ${location}. Status: ${geocodeData.status}`);
            return null;
        }
        
        // Extract latitude and longitude
        const lat = geocodeData.results[0].geometry.location.lat;
        const lng = geocodeData.results[0].geometry.location.lng;
        Logger.log(`📍 Coordinates found: ${lat}, ${lng}`);
        
        // Step 2: Use Timezone API to get timezone for coordinates
        const timestamp = Math.floor(Date.now() / 1000); // Current Unix timestamp
        const timezoneUrl = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${GOOGLE_MAPS_API_KEY}`;
        
        const timezoneResponse = UrlFetchApp.fetch(timezoneUrl, { muteHttpExceptions: true });
        const timezoneData = JSON.parse(timezoneResponse.getContentText());
        
        if (timezoneData.status !== "OK" || !timezoneData.timeZoneId) {
            Logger.log(`❌ Timezone lookup failed. Status: ${timezoneData.status}`);
            return null;
        }
        
        const timezoneId = timezoneData.timeZoneId;
        Logger.log(`✅ Timezone found: ${timezoneId}`);
        
        return timezoneId;
        
    } catch (error) {
        Logger.log(`❌ Error getting timezone from location: ${error.message}`);
        Logger.log(error.stack);
        return null;
    }
}

/**
 * Normalizes a timezone string to IANA format.
 * Handles both Firebase format (america_los_angeles) and IANA format (America/Los_Angeles).
 *
 * @param {string} timezone - The timezone string to normalize.
 * @returns {string} - The normalized IANA timezone ID.
 */
function normalizeTimezone(timezone) {
    if (!timezone) return null;
    
    // If it already has a slash, assume it's IANA format
    if (timezone.includes('/')) {
        return timezone;
    }
    
    // Otherwise, convert from Firebase format to IANA format
    return transformTimezoneToIANAFormat(timezone);
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
    console.log("fetchUUIDsForTimezone: ", time);
    const timezones = getTimezonesAtTime(time);
    console.log("Timezones at " + time + " AM:", JSON.stringify(timezones, null, 2));

    if (!Array.isArray(timezones) || timezones.length === 0) {
        console.log("No matching timezones found.");
        return null;
    }

    // Fetch user UUIDs from Firebase for these timezones
    const uuids = getUUIDDataFromExecTimeTable(timezones);
    console.log("UUIDs for Timezone:", JSON.stringify(uuids, null, 2));

    if (!Array.isArray(uuids) || uuids.length === 0) {
        console.log("No users found for the given timezones.");
        return null;
    }

    const jsonData = {};
    uuids.forEach((uuid) => {
        console.log("Processing UUID " + uuid + " for user data");
        
        // Fetch user data for this specific UUID
        const userData = getUserDataFromUserTableFirebase(uuid);

        if (userData && userData.email) {
            jsonData[uuid] = userData;
        } else {
            console.log("Skipping UUID " + uuid + " due to missing email.");
        }
    });

    return jsonData;
}


