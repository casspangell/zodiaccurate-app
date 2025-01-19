/**
 * Pushes a JSON entry to the Firebase responses table for a specific UUID.
 *
 * @param {Object} jsonData - The JSON data to be saved.
 * @param {string} uuid - The unique identifier for the entry.
 * @returns {boolean} - Returns true if the operation is successful, otherwise false.
 */
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

/**
 * Saves or updates a user entry in the Firebase users table for a specific UUID.
 *
 * @param {string} uuid - The unique identifier for the user.
 * @param {Object} jsonData - The user data to be saved.
 * @returns {boolean} - Returns true if the operation is successful, otherwise false.
 */
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

function saveEmailCampaignToFirebase(jsonData, uuid) {
      Logger.log("PUSHING EMAIL CAMPAIGN TO FIREBASE...", JSON.stringify(jsonData));
    const firebaseUrl = `${FIREBASE_URL}/trial_campaign/${uuid}.json?auth=${FIREBASE_API_KEY}`;
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

function getEmailCampaignFromFirebase(uuid) {
      console.log("GETTING USER DATA FROM FIREBASE: ", uuid);
    const firebaseUrl = `${FIREBASE_URL}/trial_campaign/${uuid}.json?auth=${FIREBASE_API_KEY}`;
    console.log("Firebase URL: ", firebaseUrl);

    const options = {
        method: "get",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${FIREBASE_API_KEY}`
        }
    };

    try {
        const response = UrlFetchApp.fetch(firebaseUrl, { ...options, muteHttpExceptions: true });
        const statusCode = response.getResponseCode();
        if (statusCode !== 200) {
            Logger.log(`Failed to retrieve data. HTTP Status: ${statusCode}`);
            Logger.log("Response Content: " + response.getContentText());
            return null;
        }

        const userData = JSON.parse(response.getContentText());
        if (!userData || typeof userData !== 'object') {
            Logger.log("No data found or data is invalid for UUID: " + uuid);
            return null;
        }

        // Logger.log("USER DATA: " + JSON.stringify(userData, null, 2));
        return userData;
    } catch (e) {
        Logger.log("Error retrieving data for UUID " + uuid + ": " + e.message);
        return null;
    }
}


/**
 * Updates the exec_time table in Firebase by moving a UUID to the specified timezone.
 * - Removes the UUID from all existing timezone entries.
 * - Adds the UUID to the specified timezone.
 *
 * @param {string} uuid - The unique identifier to update.
 * @param {string} timezone - The new timezone for the UUID.
 * @returns {void}
 */
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

/**
 * Saves a timezone entry to the Firebase exec_time table for a specific UUID.
 *
 * @param {string} timezone - The timezone to associate with the UUID.
 * @param {string} uuid - The unique identifier for the entry.
 * @param {Object} jsonData - Additional data to be saved.
 * @returns {boolean} - Returns true if the operation is successful, otherwise false.
 */
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

/**
 * Checks if a user exists in the Firebase responses table for a specific UUID.
 *
 * @param {string} uuid - The unique identifier for the user.
 * @returns {boolean} - Returns true if the user exists, otherwise false.
 */
function doesUserExist(uuid) {
    console.log("CHECKING IF USER EXISTS: ", uuid);
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
            return false;
        }
        return true;
    } catch (e) {
        Logger.log("Error retrieving data for UUID " + uuid + ": " + e.message);
        return false;
    }
}

function getUserTimezone(uuid) {
    console.log("FETCHING USER TIMEZONE FOR UUID: ", uuid);
    const firebaseUrl = `${FIREBASE_URL}/users/${uuid}/timezone.json?auth=${FIREBASE_API_KEY}`;

    const options = {
        method: "get",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${FIREBASE_API_KEY}`
        }
    };

    try {
        const response = UrlFetchApp.fetch(firebaseUrl, { ...options, muteHttpExceptions: true });
        const timezone = JSON.parse(response.getContentText());

        if (!timezone) {
            Logger.log("No timezone found for UUID: " + uuid);
            return null;
        }

        console.log("User's timezone: ", timezone);
        return timezone; // Return the timezone
    } catch (e) {
        Logger.log("Error retrieving timezone for UUID " + uuid + ": " + e.message);
        return null;
    }
}

/**
 * Retrieves user data from the Firebase USERS table for a specific UUID.
 *
 * @param {string} uuid - The unique identifier for the user.
 * @returns {Object|null} - The user data if found, otherwise null.
 */
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


/**
 * Retrieves single user data from the Firebase RESPONSES table for a specific UUID.
 *
 * @param {string} uuid - The unique identifier for the user.
 * @returns {Object|null} - The user data if found, otherwise null.
 */
function getUserDataFromFirebase(uuid) {
    console.log("GETTING USER DATA FROM FIREBASE: ", uuid);

    const firebaseUrl = `${FIREBASE_URL}/responses/${uuid}.json?auth=${FIREBASE_API_KEY}`;
    console.log("Firebase URL: ", firebaseUrl);

    const options = {
        method: "get",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${FIREBASE_API_KEY}`
        }
    };

    try {
        const response = UrlFetchApp.fetch(firebaseUrl, { ...options, muteHttpExceptions: true });
        const statusCode = response.getResponseCode();
        if (statusCode !== 200) {
            Logger.log(`Failed to retrieve data. HTTP Status: ${statusCode}`);
            Logger.log("Response Content: " + response.getContentText());
            return null;
        }

        const userData = JSON.parse(response.getContentText());
        if (!userData || typeof userData !== 'object') {
            Logger.log("No data found or data is invalid for UUID: " + uuid);
            return null;
        }

        Logger.log("USER DATA: " + JSON.stringify(userData, null, 2));
        return userData;
    } catch (e) {
        Logger.log("Error retrieving data for UUID " + uuid + ": " + e.message);
        return null;
    }
}


/**
 * Retrieves UUIDs and their associated data from the Firebase exec_time table for a specific timezone.
 *
 * @param {string} timezone - The timezone to retrieve UUIDs for.
 * @returns {string[]} - An array of UUIDs found for the specified timezone.
 */
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

    var uuidArr = [];
    try {
        const response = UrlFetchApp.fetch(firebaseUrl, options);
        const uuidData = JSON.parse(response.getContentText());

        for (let uuid in uuidData) {
            if (uuidData.hasOwnProperty(uuid)) {
                uuidArr.push(uuid); // Add each UUID to the array
            }
        }

        Logger.log(`UUIDs with data for timezone ${timezone}: ${JSON.stringify(uuidArr)}`);
        return uuidArr;

    } catch (error) {
        Logger.log(`Error retrieving data for timezone ${timezone}: ${error.message}`);
        return []; // Return an empty array on error
    }
}

function getUUIDDataFromTrialCampaignTable() {
    console.log(`getUUIDDataFromTrialCampaignTable`);
    const firebaseUrl = `${FIREBASE_URL}/trial_campaign/.json?auth=${FIREBASE_API_KEY}`;

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
        Logger.log(`UUIDs with data: ${JSON.stringify(uuidData)}`);
        return uuidData;

    } catch (error) {
        Logger.log(`Error retrieving data for timezone ${timezone}: ${error.message}`);
        return []; // Return an empty array on error
    }
}

/**
 * Saves a sanitized horoscope entry to the Firebase zodiac table for a specific UUID and day of the week.
 *
 * @param {Object} jsonData - The horoscope data to save.
 * @param {string} uuid - The unique identifier for the user.
 * @returns {void}
 */
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

/**
 * Retrieves zodiac data for today from the Firebase zodiac table for a specific UUID.
 *
 * @param {string} uuid - The unique identifier for the user.
 * @returns {Object|null} - The zodiac data for today if found, otherwise null.
 */
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

/**
 * Retrieves zodiac data for the last three days from the Firebase zodiac table for a specific UUID.
 *
 * @param {string} uuid - The unique identifier for the user.
 * @returns {Object|null} - An object containing data for the last three days if found, otherwise null.
 */
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
