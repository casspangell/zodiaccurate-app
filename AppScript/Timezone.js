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


