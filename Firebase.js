// PUSH to Firebase
function pushEntryToFirebase(jsonData, uuid) {
    Logger.log("PUSHING ENTRY TO FIREBASE...", JSON.stringify(jsonData));
    const firebaseUrl = `${FIREBASE_URL}/responses/${uuid}.json?auth=${FIREBASE_API_KEY}`;
    const options = {
        method: "put",
        contentType: "application/json",
        payload: JSON.stringify(jsonData),
        headers: {
            Authorization: `Bearer ${FIREBASE_API_KEY}`
        }
    };

    try {
        const response = UrlFetchApp.fetch(firebaseUrl, options);
        Logger.log("Entry successfully saved to Firebase.");
        Logger.log("Response: " + response.getContentText());
        return true;
    } catch (e) {
        Logger.log("Error saving entry to Firebase: " + e.message);
        return false;
    }
}

function saveUserToUserTableFirebase(uuid, jsonData) {
    Logger.log("PUSHING USER TO FIREBASE...", JSON.stringify(jsonData));
    const firebaseUrl = `${FIREBASE_URL}/users/${uuid}.json?auth=${FIREBASE_API_KEY}`;
    const options = {
        method: "patch",
        contentType: "application/json",
        payload: JSON.stringify(jsonData),
        headers: {
            Authorization: `Bearer ${FIREBASE_API_KEY}`
        }
    };

    try {
        const response = UrlFetchApp.fetch(firebaseUrl, options);
        Logger.log("Entry successfully saved to Firebase.");
        Logger.log("Response: " + response.getContentText());
        return true;
    } catch (e) {
        Logger.log("Error saving entry to Firebase: " + e.message);
        return false;
    }
}

function updateExecTimeTable(uuid, timezone) {
  const execTimeUrl = `${FIREBASE_URL}/exec_time.json?auth=${FIREBASE_API_KEY}`;

  try {
    // Fetch the entire exec_time table
    const response = UrlFetchApp.fetch(execTimeUrl, {
      method: "get",
      headers: {
        "Content-Type": "application/json"
      }
    });
    const execTimeData = JSON.parse(response.getContentText());

    // Check all timezones for the UUID
    let uuidFound = false;
    Object.keys(execTimeData || {}).forEach((tz) => {
      if (execTimeData[tz] && execTimeData[tz][uuid]) {
        uuidFound = true;

        // Delete the UUID from the timezone
        const deleteUrl = `${FIREBASE_URL}/exec_time/${tz}/${uuid}.json?auth=${FIREBASE_API_KEY}`;
        UrlFetchApp.fetch(deleteUrl, {
          method: "delete",
          headers: {
            "Content-Type": "application/json"
          }
        });
        Logger.log(`Deleted UUID: ${uuid} from timezone: ${tz}`);
      }
    });

    if (!uuidFound) {
      Logger.log(`UUID: ${uuid} not found in any timezone column.`);
    }

    // Add the UUID to the specified timezone column
    const addUrl = `${FIREBASE_URL}/exec_time/${timezone}/${uuid}.json?auth=${FIREBASE_API_KEY}`;
    UrlFetchApp.fetch(addUrl, {
      method: "put",
      contentType: "application/json",
      payload: JSON.stringify(timezone),
      headers: {
        "Content-Type": "application/json"
      }
    });
    Logger.log(`Added UUID: ${uuid} to timezone: ${timezone}`);

  } catch (error) {
    Logger.log(`Error updating exec_time table: ${error.message}`);
  }
}

function saveTimezoneToFirebase(timezone, uuid, jsonData) {
    Logger.log("SAVING TIMEZONE ENTRY TO FIREBASE...", timezone);
    const updatedTimezone = replaceSlashesWithDashes(timezone); 
    const firebaseUrl = `${FIREBASE_URL}/exec_time/${updatedTimezone}/${uuid}.json?auth=${FIREBASE_API_KEY}`;
    const options = {
        method: "put",
        contentType: "application/json",
        payload: JSON.stringify(jsonData),
        headers: {
            Authorization: `Bearer ${FIREBASE_API_KEY}`
        }
    };

    try {
        const response = UrlFetchApp.fetch(firebaseUrl, options);
        Logger.log("Entry saved: " + response.getContentText());
        return true;
    } catch (e) {
        Logger.log("Error saving entry to Firebase: " + e.message);
        return false;
    }
}

function doesUserExist(uuid) {
    console.log("CHECKING IF USER EXISTS: ", uuid);
    const firebaseUrl = `${FIREBASE_URL}/responses/${uuid}.json?auth=${FIREBASE_API_KEY}`;

    const options = {
        method: "get",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${FIREBASE_API_KEY}`
        }
    };

    try {
        const response = UrlFetchApp.fetch(firebaseUrl, { ...options, muteHttpExceptions: true });
        const userData = JSON.parse(response.getContentText());
        if (!userData || typeof userData !== 'object') {
            Logger.log("No data found or data is invalid for UUID: " + uuid);
            return false;
        }
        return true;
    } catch (e) {
        Logger.log("Error retrieving data for UUID " + uuid + ": " + e.message);
        return false;
    }
}

// Retrieve single user data from Firebase
function getUserDataFromUserTableFirebase(uuid) {
    console.log("GETTING USER DATA FROM FIREBASE: ", uuid);
    const firebaseUrl = `${FIREBASE_URL}/users/${uuid}.json?auth=${FIREBASE_API_KEY}`;

    const options = {
        method: "get",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${FIREBASE_API_KEY}`
        }
    };

    try {
        const response = UrlFetchApp.fetch(firebaseUrl, { ...options, muteHttpExceptions: true });
        const userData = JSON.parse(response.getContentText());
        if (!userData || typeof userData !== 'object') {
            Logger.log("No data found or data is invalid for UUID: " + uuid);
            return null;
        }
        Logger.log(userData);
        return userData;
    } catch (e) {
        Logger.log("Error retrieving data for UUID " + uuid + ": " + e.message);
        return null;
    }
}


// Retrieve single user data from Firebase
function getUserDataFromFirebase(uuid) {
    console.log("GETTING USER DATA FROM FIREBASE: ", uuid);
    const firebaseUrl = `${FIREBASE_URL}/responses/${uuid}.json?auth=${FIREBASE_API_KEY}`;

    const options = {
        method: "get",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${FIREBASE_API_KEY}`
        }
    };

    try {
        const response = UrlFetchApp.fetch(firebaseUrl, { ...options, muteHttpExceptions: true });
        const userData = JSON.parse(response.getContentText());
        if (!userData || typeof userData !== 'object') {
            Logger.log("No data found or data is invalid for UUID: " + uuid);
            return null;
        }
        Logger.log(userData);
        return userData;
    } catch (e) {
        Logger.log("Error retrieving data for UUID " + uuid + ": " + e.message);
        return null;
    }
}

// Retrieve UUIDs and their nested data from Firebase for exec_time
function getUUIDDataFromExecTimeTable(timezone) {
    console.log(`getUUIDDataFromExecTimeTable(${timezone})`);
    const firebaseUrl = `${FIREBASE_URL}/exec_time/${timezone}.json?auth=${FIREBASE_API_KEY}`;

    const options = {
        method: "get",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${FIREBASE_API_KEY}`
        },
        muteHttpExceptions: true // Avoid throwing errors for non-200 responses
    };

    try {
        const response = UrlFetchApp.fetch(firebaseUrl, options);
        const uuidData = JSON.parse(response.getContentText());

        if (!uuidData || typeof uuidData !== 'object') {
            Logger.log(`No valid data found for timezone: ${timezone}`);
            return []; // Return an empty array if no valid data exists
        }

        // Map each UUID to its data (email, name, timezone)
        const uuidWithData = Object.keys(uuidData).map((uuid) => ({
            uuid: uuid,
            email: uuidData[uuid].email || "",
            name: uuidData[uuid].name || "",
            timezone: uuidData[uuid].timezone || ""
        }));

        Logger.log(`UUIDs with data for timezone ${timezone}: ${JSON.stringify(uuidWithData)}`);
        return uuidWithData;

    } catch (error) {
        Logger.log(`Error retrieving data for timezone ${timezone}: ${error.message}`);
        return []; // Return an empty array on error
    }
}

function saveHoroscopeToFirebase(jsonData, uuid) {

    const sanitizedData = sanitizeKeys(jsonData);

    Logger.log("SAVING HOROSCROPE TO FIREBASE: " + JSON.stringify(sanitizedData));

    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const today = new Date();
    const dayOfWeek = daysOfWeek[today.getDay()];
    const firebaseUrl = `${FIREBASE_URL}/zodiac/${uuid}/${dayOfWeek}.json?auth=${FIREBASE_API_KEY}`;

    Logger.log("Saving horoscope for " + dayOfWeek + " to URL: " + firebaseUrl);

    const options = {
        method: "put",
        contentType: "application/json",
        payload: JSON.stringify(sanitizedData[0])
    };

    try {
        const response = UrlFetchApp.fetch(firebaseUrl, { ...options, muteHttpExceptions: true });
        Logger.log("Horoscope saved to Firebase: " + response.getContentText());
    } catch (e) {
        Logger.log("Error saving horoscope to Firebase: " + e.message);
    }
}

function getZodiacDataForToday(uuid) {
  // Firebase URL to the zodiac table using the provided UUID
  const url = `${FIREBASE_URL}/zodiac/${uuid}.json?auth=${FIREBASE_API_KEY}`;
  console.log(url);
  try {

    const response = UrlFetchApp.fetch(url);
    const data = JSON.parse(response.getContentText());

    // Get the current day of the week
    const today = getCurrentDayOfWeek();
    
    // Check if today's data exists in the response
    if (data && data[today]) {
      Logger.log(`Data for ${today}: ${JSON.stringify(data[today])}`);
      return data[today];
    } else {
      Logger.log(`No data found for ${today} for UUID: ${uuid}`);
      return null;
    }
  } catch (error) {
    Logger.log(`Error fetching data for UUID ${uuid}: ${error}`);
    return null;
  }
}

function getThreeDaysDataFromFirebase(uuid) {
    console.log("getThreeDaysDataFromFirebase: " + uuid);
    console.log(`${FIREBASE_URL}/zodiac/${uuid}.json`);
    const firebaseUrl = `${FIREBASE_URL}/zodiac/${uuid}.json?auth=${FIREBASE_API_KEY}`;

    const options = {
        method: "GET",
        contentType: "application/json",
        headers: {
            Authorization: `Bearer ${FIREBASE_API_KEY}`
        }
    };

    try {
        const response = UrlFetchApp.fetch(firebaseUrl, options);
        const data = JSON.parse(response.getContentText());
        const daysOfTheWeekData = {};

        if (data) {
            Logger.log("Data retrieved for UUID: " + uuid);

            const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
            const today = new Date();
            let dayIndex = today.getDay();

            // Get the last 3 days' data
            for (let i = 1; i <= 3; i++) {
                dayIndex = (dayIndex - 1 + 7) % 7; // Calculate previous day index
                const day = daysOfWeek[dayIndex];
                if (data.hasOwnProperty(day)) {
                    daysOfTheWeekData[day] = data[day];
                    Logger.log(day + ": " + JSON.stringify(data[day]));
                } else {
                    Logger.log(day + ": No data available.");
                }
            }

            return daysOfTheWeekData;
        } else {
            Logger.log("No data found for UUID: " + uuid);
            return null;
        }
    } catch (e) {
        Logger.log("Error retrieving data from Firebase: " + e.message);
        return null;
    }
}
