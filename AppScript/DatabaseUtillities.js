function removeUUIDFromFirebase(uuid) {
    if (!uuid) {
        uuid = "e7fcdfb8-e231-4332-a2d4-d38f9d50a7ec"; // Default test value
    }

    const token = getFirebaseIdToken("appscript@zodiaccurate.com", FIREBASE_PASSWORD);
    if (!token) {
        Logger.log("❌ Firebase Authentication Failed.");
        return false;
    }

    // List of tables to check
    const tables = ["trial_campaign", "users", "zodiac", "responses"];
    let deletedCount = 0;

    tables.forEach(table => {
        const firebaseUrl = `${FIREBASE_URL}/${table}.json?auth=${token}`;

        try {
            // Step 1: Fetch table data
            const response = UrlFetchApp.fetch(firebaseUrl, { method: "get", muteHttpExceptions: true });
            const data = JSON.parse(response.getContentText());

            if (!data || typeof data !== "object") {
                Logger.log(`⚠️ No data found in table: ${table}`);
                return;
            }

            // Step 2: Check if UUID exists as a key
            if (!(uuid in data)) {
                Logger.log(`❌ UUID ${uuid} not found in table: ${table}`);
                return;
            }

            // Step 3: Delete the record
            const deleteUrl = `${FIREBASE_URL}/${table}/${uuid}.json?auth=${token}`;
            const deleteResponse = UrlFetchApp.fetch(deleteUrl, { method: "delete", muteHttpExceptions: true });

            if (deleteResponse.getResponseCode() === 200) {
                Logger.log(`✅ UUID ${uuid} successfully deleted from table: ${table}`);
                deletedCount++;
            } else {
                Logger.log(`❌ Failed to delete UUID ${uuid} from table: ${table}: ${deleteResponse.getContentText()}`);
            }
        } catch (error) {
            Logger.log(`❌ Error processing table ${table}: ${error.message}`);
        }
    });

    // **Handling exec_time (Nested Timezones)**
    const execTimeUrl = `${FIREBASE_URL}/exec_time.json?auth=${token}`;

    try {
        const response = UrlFetchApp.fetch(execTimeUrl, { method: "get", muteHttpExceptions: true });
        const execData = JSON.parse(response.getContentText());

        if (!execData || typeof execData !== "object") {
            Logger.log("⚠️ No exec_time data found.");
            return deletedCount > 0;
        }

        let deletedFromExecTime = false;

        Object.keys(execData).forEach(timezone => {
            if (uuid in execData[timezone]) {
                // Construct the delete URL for the specific UUID inside the timezone
                const deleteUrl = `${FIREBASE_URL}/exec_time/${timezone}/${uuid}.json?auth=${token}`;
                const deleteResponse = UrlFetchApp.fetch(deleteUrl, { method: "delete", muteHttpExceptions: true });

                if (deleteResponse.getResponseCode() === 200) {
                    Logger.log(`✅ UUID ${uuid} successfully deleted from exec_time -> ${timezone}`);
                    deletedFromExecTime = true;
                } else {
                    Logger.log(`❌ Failed to delete UUID ${uuid} from exec_time -> ${timezone}: ${deleteResponse.getContentText()}`);
                }
            }
        });

        if (!deletedFromExecTime) {
            Logger.log(`❌ UUID ${uuid} not found in any exec_time timezone.`);
        }

    } catch (error) {
        Logger.log(`❌ Error processing exec_time: ${error.message}`);
    }

    Logger.log(`🏁 Finished removing UUID: ${uuid}. Total tables updated: ${deletedCount}`);
    return deletedCount > 0;
}

function syncTimezonesWithExecTime() {
    const token = getFirebaseIdToken("appscript@zodiaccurate.com", FIREBASE_PASSWORD);
    if (!token) {
        Logger.log("❌ Firebase Authentication Failed.");
        return false;
    }

    const execTimeUrl = `${FIREBASE_URL}/exec_time.json?auth=${token}`;
    const timezonesUrl = `${FIREBASE_URL}/timezones.json?auth=${token}`;

    try {
        // Step 1: Fetch `exec_time` timezones
        const execResponse = UrlFetchApp.fetch(execTimeUrl, { method: "get", muteHttpExceptions: true });
        const execData = JSON.parse(execResponse.getContentText());

        if (!execData || typeof execData !== "object") {
            Logger.log("⚠️ No data found in exec_time.");
            return false;
        }

        const execTimezones = Object.keys(execData); // Get all timezones from exec_time

        // Step 2: Fetch `timezones` data
        const timezonesResponse = UrlFetchApp.fetch(timezonesUrl, { method: "get", muteHttpExceptions: true });
        const timezonesData = JSON.parse(timezonesResponse.getContentText()) || {}; // Default to empty object if null
        const existingTimezones = Object.keys(timezonesData); // Get all timezones from timezones table

        // Step 3: Determine updates needed
        let updates = {};
        let deletions = [];

        // Add missing timezones from `exec_time` to `timezones`
        execTimezones.forEach(timezone => {
            if (!existingTimezones.includes(timezone)) {
                updates[timezone] = { active: true }; // You can set a default value if needed
                Logger.log(`✅ Adding timezone: ${timezone} to timezones`);
            }
        });

        // Remove extra timezones from `timezones` that are not in `exec_time`
        existingTimezones.forEach(timezone => {
            if (!execTimezones.includes(timezone)) {
                deletions.push(timezone);
                Logger.log(`❌ Deleting timezone: ${timezone} from timezones`);
            }
        });

        // Step 4: Apply updates
        if (Object.keys(updates).length > 0) {
            const updateUrl = `${FIREBASE_URL}/timezones.json?auth=${token}`;
            UrlFetchApp.fetch(updateUrl, {
                method: "patch",
                contentType: "application/json",
                payload: JSON.stringify(updates),
                muteHttpExceptions: true
            });
            Logger.log("✅ Timezones updated successfully.");
        }

        // Step 5: Apply deletions
        deletions.forEach(timezone => {
            const deleteUrl = `${FIREBASE_URL}/timezones/${timezone}.json?auth=${token}`;
            UrlFetchApp.fetch(deleteUrl, { method: "delete", muteHttpExceptions: true });
        });

        Logger.log("🏁 Timezone sync completed.");
        return true;

    } catch (error) {
        Logger.log(`❌ Error syncing timezones: ${error.message}`);
        return false;
    }
}





function clearFirebaseDatabase() {
  // var apiKey = FIREBASE_API_KEY;

  // const token = getFirebaseIdToken("appscript@zodiaccurate.com", FIREBASE_PASSWORD);

  //   if (!token) {
  //       Logger.log("❌ Firebase authentication failed. No token received.");
  //       return false;
  //   }
  
  // const tables = ["zodiac", "exec_time", "timezones", "trial_campaign", "trial_users", "users", "responses"];
  // var emptyData = {}; // Empty JSON object to overwrite database


  // for(let i=0; i<tables.length; i++) {
  // const firebaseUrl = `${FIREBASE_URL}/${tables[i]}/.json?auth=${token}`;
  //     var options = {
  //     method: "PUT",  // Overwrites the entire database
  //     contentType: "application/json",
  //     payload: JSON.stringify(emptyData),
  //     muteHttpExceptions: true
  //   };

  //     try {
  //         const response = UrlFetchApp.fetch(firebaseUrl, options);
  //         Logger.log(tables[i]+" successfully cleared.");
  //         Logger.log("Response: " + response.getContentText());
  //         // return true;
  //     } catch (e) {
  //         Logger.log("Error clearing table: " +tables[i] +" "+ e.message);
  //         // return false;
  //     }

  // }

}