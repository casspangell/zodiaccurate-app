function clearFirebaseDatabase() {
  var apiKey = FIREBASE_API_KEY;

  const token = getFirebaseIdToken("appscript@zodiaccurate.com", FIREBASE_PASSWORD);

    if (!token) {
        Logger.log("❌ Firebase authentication failed. No token received.");
        return false;
    }
  
  const tables = ["zodiac", "exec_time", "timezones", "trial_campaign", "trial_users", "users", "responses"];
  var emptyData = {}; // Empty JSON object to overwrite database


  for(let i=0; i<tables.length; i++) {
  const firebaseUrl = `${FIREBASE_URL}/${tables[i]}/.json?auth=${token}`;
      var options = {
      method: "PUT",  // Overwrites the entire database
      contentType: "application/json",
      payload: JSON.stringify(emptyData),
      muteHttpExceptions: true
    };

      try {
          const response = UrlFetchApp.fetch(firebaseUrl, options);
          Logger.log(tables[i]+" successfully cleared.");
          Logger.log("Response: " + response.getContentText());
          // return true;
      } catch (e) {
          Logger.log("Error clearing table: " +tables[i] +" "+ e.message);
          // return false;
      }

  }

}

function removeUUIDFromFirebase(uuid) {
    // Authenticate and retrieve token
    const token = getFirebaseIdToken("appscript@zodiaccurate.com", FIREBASE_PASSWORD);
    if (!token) {
        Logger.log("❌ Firebase Authentication Failed.");
        return false;
    }
    
    const tables = ["responses", "trial_campaign", "users", "zodiac"];

    tables.forEach(table => {
        let tableUrl = `${FIREBASE_URL}/${table}.json?auth=${token}`;

        try {
            // Fetch all data from the table
            let response = UrlFetchApp.fetch(tableUrl, { method: "get" });
            let data = JSON.parse(response.getContentText());

            if (data) {
                Object.keys(data).forEach(recordKey => {
                    if (data[recordKey].uuid === uuid) {
                        // Delete the record with the matching UUID
                        let deleteUrl = `${FIREBASE_URL}/${table}/${recordKey}.json?auth=${token}`;
                        UrlFetchApp.fetch(deleteUrl, { method: "delete" });
                        Logger.log(`Deleted UUID ${uuid} from ${table}/${recordKey}`);
                    }
                });
            }
        } catch (error) {
            Logger.log(`Error processing table ${table}: ${error.message}`);
        }
    });

    Logger.log(`Finished removing UUID: ${uuid} from all tables.`);
}