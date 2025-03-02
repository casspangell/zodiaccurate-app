function removeUUIDFromFirebase(uuid) {
    if (!uuid) {
        uuid = "f05b4502-cbc9-41f6-8abf-c41dc91f7e52"; // Default test value
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