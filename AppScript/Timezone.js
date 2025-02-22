/**
 * Retrieves the timezone from a given location and saves it to Firebase.
 *
 * @param {string} location - The location to determine the timezone for.
 * @param {string} uuid - The unique identifier for the user.
 * @returns {string|null} - The formatted timezone string or null if an error occurs.
 */
function getTimeZoneFromLocation(location, uuid) {
    Logger.log(`🌍 Getting timezone from location: ${location} for UUID: ${uuid}`);

    // Authenticate & retrieve token
    const token = getFirebaseIdToken("appscript@zodiaccurate.com", FIREBASE_PASSWORD);
    if (!token) {
        Logger.log("❌ Firebase Authentication Failed.");
        return null;
    }
    Logger.log("✅ Firebase Token Retrieved");

    try {
        const geocoder = Maps.newGeocoder();
        const response = geocoder.geocode(location);
        
        // Log full geocoder response
        Logger.log(`🛰️ Geocoder API Response: ${JSON.stringify(response, null, 2)}`);

        if (response.status !== 'OK' || !response.results.length) {
            Logger.log(`❌ Geocoding failed for location '${location}' - Status: ${response.status}`);
            return "america_chicago";
        }

        const result = response.results[0];
        const lat = result.geometry.location.lat;
        const lng = result.geometry.location.lng;
        Logger.log(`📍 Geocoded Coordinates: Latitude=${lat}, Longitude=${lng}`);

        // Fetch timezone data
        const apiKey = GOOGLE_MAPS_API_KEY;
        const timestamp = Math.floor(Date.now() / 1000);
        const timezoneUrl = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${apiKey}`;
        Logger.log(`🕒 Fetching Timezone API: ${timezoneUrl}`);

        const timezoneResponse = UrlFetchApp.fetch(timezoneUrl);
        const timezoneData = JSON.parse(timezoneResponse.getContentText());

        // Log full timezone response
        Logger.log(`⏳ Timezone API Response: ${JSON.stringify(timezoneData, null, 2)}`);

        if (timezoneData.status !== 'OK') {
            Logger.log(`❌ Timezone fetch failed for coordinates (${lat}, ${lng}) - Status: ${timezoneData.status}`);
            return null;
        }

        let timezoneId = timezoneData.timeZoneId; // Example: "America/New_York"
        timezoneId = transformKeysToLowerCaseWithUnderscores(timezoneId);
        Logger.log(`✅ Retrieved Timezone ID: ${timezoneId}`);

        // Save timezone to Firebase
        saveTimezoneToTimezoneArrayList(timezoneId);

        return timezoneId;
    } catch (error) {
        Logger.log(`❌ Error in getTimeZoneFromLocation: ${error.message}`);
        return null;
    }
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

    // Convert stored format (underscores) back to valid IANA format (slashes)
    const validTimezones = timezones.map(tz => tz.replace(/_/g, "/"));

    // Ensure proper format for target hour
    const formattedTargetHour = String(targetHour).padStart(2, "0");

    // Filter timezones where the local hour matches the target hour
    const matchingTimezones = validTimezones.filter((timezone) => {
        try {
            const now = new Date();
            const localTime = new Intl.DateTimeFormat("en-US", {
                timeZone: timezone,
                hour: "2-digit",
                hour12: false
            }).format(now);

            return localTime === formattedTargetHour;
        } catch (error) {
            Logger.log(`Error processing timezone ${timezone}: ${error.message}`);
            return false;
        }
    });

    // Convert matching timezones back to Firebase format (underscores)
    const formattedTimezones = matchingTimezones.map(tz => tz.replace(/\//g, "_"));

    Logger.log(`Timezones where it is currently ${targetHour}:00 → ${JSON.stringify(formattedTimezones)}`);
    return formattedTimezones;
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


