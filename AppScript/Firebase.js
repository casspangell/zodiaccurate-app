
function getFirebaseIdToken(email, password) {
    console.log("=== Authenticating firebase");

  const url = `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=${FIREBASE_API_KEY}`;
  const config = {
    method: "post",
    contentType: "application/json",
    headers: {
      "Content-Type": "application/json",
      Accept: "*/*",
    },
    payload: JSON.stringify({email,password,returnSecureToken: true}),
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(url, config);
  const data = JSON.parse(response.getContentText());
  return data.idToken;
}

/**
 * Pushes a JSON entry to the Firebase responses table for a specific UUID.
 *
 * @param {Object} jsonData - The JSON data to be saved.
 * @param {string} uuid - The unique identifier for the entry.
 * @returns {boolean} - Returns true if the operation is successful, otherwise false.
 */
function pushEntryToFirebase(jsonData, uuid) {
    Logger.log("Sanitizing JSON before saving...");
    const sanitizedData = sanitizeJsonKeys(jsonData); // Clean keys before saving

    Logger.log("pushEntryToFirebase...", JSON.stringify(sanitizedData));
    const firebaseUrl = `${FIREBASE_URL}/responses/${uuid}.json?auth=${FIREBASE_API_KEY}`;

    const token = getFirebaseIdToken("appscript@zodiaccurate.com", FIREBASE_PASSWORD);
    console.log("=== token ", token);
    
    const options = {
        method: "put",
        contentType: "application/json",
        payload: JSON.stringify(sanitizedData),
        headers: {
            Authorization: `Bearer ${token}`
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

    Logger.log("saveUserToUserTableFirebase...", JSON.stringify(jsonData));
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
      Logger.log("saveEmailCampaignToFirebase...", JSON.stringify(jsonData));

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
      console.log("getEmailCampaignFromFirebase: ", uuid);
    const firebaseUrl = `${FIREBASE_URL}/trial_campaign/${uuid}.json?auth=${FIREBASE_API_KEY}`;

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
  timezone = transformKeysToLowerCaseWithUnderscores(timezone);

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
      tz = transformKeysToLowerCaseWithUnderscores(tz);

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
        saveTimezoneToTimezoneArrayList(updatedTimezone);

        Logger.log("Entry saved: " + response.getContentText());
        return true;
    } catch (e) {
        Logger.log("Error saving entry to Firebase: " + e.message);
        return false;
    }
}


/**
 * Adds new timezones to the existing list in Firebase, avoiding duplicates.
 *
 * @param {string[]} newTimezones - An array of new timezone strings to add.
 * @returns {boolean} - Returns true if the operation is successful, otherwise false.
 */
/**
 * Adds a single new timezone to the existing list in Firebase, avoiding duplicates.
 *
 * @param {string} newTimezone - A single timezone string to add (e.g., "America/Chicago").
 * @returns {boolean} - Returns true if the operation is successful, otherwise false.
 */
function saveTimezoneToTimezoneArrayList(newTimezone) {
    if (!newTimezone || typeof newTimezone !== "string") {
        Logger.log("Invalid timezone provided.");
        return false;
    }

    Logger.log(`Adding new timezone to Firebase: ${newTimezone}`);

    const firebaseUrl = `${FIREBASE_URL}/timezones.json?auth=${FIREBASE_API_KEY}`;

    try {
        // Fetch existing timezones
        const response = UrlFetchApp.fetch(firebaseUrl, { method: "get" });
        let existingTimezones = JSON.parse(response.getContentText());

        if (!Array.isArray(existingTimezones)) {
            existingTimezones = []; // If data is invalid or missing, initialize as an empty array
        }

        // Merge and remove duplicates (corrected to treat newTimezone as a single string)
        if (!existingTimezones.includes(newTimezone)) {
            if(newTimezone != null) {
                existingTimezones.push(newTimezone);
            }
        }

        Logger.log(`Updated timezones: ${JSON.stringify(existingTimezones)}`);

        // Save the updated array back to Firebase
        const options = {
            method: "put",
            contentType: "application/json",
            payload: JSON.stringify(existingTimezones), // Save the merged list
            headers: {
                Authorization: `Bearer ${FIREBASE_API_KEY}`
            }
        };

        const saveResponse = UrlFetchApp.fetch(firebaseUrl, options);
        Logger.log(`Timezones list updated successfully: ${saveResponse.getContentText()}`);
        return true;
    } catch (e) {
        Logger.log(`Error updating timezones in Firebase: ${e.message}`);
        return false;
    }
}

/**
 * Fetches the list of timezones from Firebase and removes null values.
 *
 * @returns {string[]} - An array of valid timezone strings.
 */
function getTimezonesArrayListFromFirebase() {
    Logger.log("Fetching timezones from Firebase...");

    const token = getFirebaseIdToken("appscript@zodiaccurate.com", FIREBASE_PASSWORD);
    console.log("=== token ", token);
    
    const firebaseUrl = `${FIREBASE_URL}/timezones.json?auth=${token}`;

    const options = {
        method: "get",
        contentType: "application/json",
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    try {
        const response = UrlFetchApp.fetch(firebaseUrl, options);
        let timezones = JSON.parse(response.getContentText());

        if (Array.isArray(timezones)) {
            // Remove `null` or `undefined` values
            timezones = timezones.filter(tz => tz !== null && tz !== undefined);
        
            // Convert all to lowercase and replace slashes with underscores
            timezones = timezones.map(tz => replaceSlashesWithDashes(tz));

            Logger.log(`Cleaned timezones: ${JSON.stringify(timezones)}`);
            return timezones;
        } else {
            Logger.log("Invalid or empty timezone data retrieved.");
            return [];
        }
    } catch (e) {
        Logger.log(`Error fetching timezones from Firebase: ${e.message}`);
        return [];
    }
}


/**
 * Saves a single timezone entry to the "timezones" table in Firebase.
 *
 * @param {string} timezone - The timezone string to save (e.g., "America/Chicago").
 * @returns {boolean} - Returns true if the operation is successful, otherwise false.
 */
// function saveTimezoneToTimezoneTable(timezone) {
//     if (!timezone || typeof timezone !== "string") {
//         Logger.log("Invalid timezone provided.");
//         return false;
//     }

//     Logger.log(`Saving single timezone to Firebase: ${timezone}`);

//     const formattedTimezone = timezone.replace(/\//g, '_'); // Convert slashes to dashes
//     const firebaseUrl = `${FIREBASE_URL}/timezones/${formattedTimezone}.json?auth=${FIREBASE_API_KEY}`;

//     const options = {
//         method: "put",
//         contentType: "application/json",
//         payload: JSON.stringify(timezone), // Save as a plain string
//         headers: {
//             Authorization: `Bearer ${FIREBASE_API_KEY}`
//         }
//     };

//     try {
//         const response = UrlFetchApp.fetch(firebaseUrl, options);
//         Logger.log(`Timezone ${timezone} saved successfully: ${response.getContentText()}`);
//         return true;
//     } catch (e) {
//         Logger.log(`Error saving timezone ${timezone} to Firebase: ${e.message}`);
//         return false;
//     }
// }



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

/**
 * Retrieves user data from the Firebase USERS table for a specific UUID.
 *
 * @param {string} uuid - The unique identifier for the user.
 * @returns {Object|null} - The user data if found, otherwise null.
 */
function getUserDataFromUserTableFirebase(uuid) {
    console.log("getUserDataFromUserTableFirebase: ", uuid);
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

function test()  {
    getUserDataFromTrialUserTableFirebase("casspangell@gmail.com");
}

function saveTrialUserToFirebase(email) {
    Logger.log("SAVING TRIAL USER ENTRY TO FIREBASE...", email);
    var encodedEmail = email.replace(/@/g, "_at_").replace(/\./g, "_dot_");

    const firebaseUrl = `${FIREBASE_URL}/trial_users/${encodedEmail}.json?auth=${FIREBASE_API_KEY}`;
    console.log(firebaseUrl);
    const today = new Date();

    const userData = {
        "date": today
    };

    const options = {
        method: "put",
        contentType: "application/json",
        payload: JSON.stringify(userData),
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

function getUserDataFromTrialUserTableFirebase(email) {
    console.log("getUserDataFromTrialUserTableFirebase:", email);

    const firebaseUrl = `${FIREBASE_URL}/users.json?auth=${FIREBASE_API_KEY}`;

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

        if (!userData || typeof userData !== "object") {
            Logger.log("No valid data returned for email:", email);
            return null;
        }

        for (const uuid in userData) {
            const user = userData[uuid];
            if (user.email === email) {
                Logger.log(`User found with email: ${email}`);
                return true;
            }
        }

        Logger.log(`No user found with email: ${email}`);
        return false;
    } catch (error) {
        Logger.log(`Error retrieving data for email ${email}: ${error.message}`);
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
    console.log("getUserDataFromFirebase: ", uuid);

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
 * Retrieves UUIDs and their associated data from the Firebase exec_time table for multiple timezones.
 *
 * @param {string[]} timezones - An array of timezones to retrieve UUIDs for.
 * @returns {string[]} - An array of unique UUIDs found for the specified timezones.
 */
function getUUIDDataFromExecTimeTable(timezones) {
    console.log(`getUUIDDataFromExecTimeTable(${timezones})`);

    var uuidSet = new Set(); // Use a Set to avoid duplicate UUIDs

    // Iterate over each timezone in the array
    timezones.forEach((timezone) => {
        const formattedTimezone = timezone.replace(/\//g, '-'); // Ensure Firebase format
        const firebaseUrl = `${FIREBASE_URL}/exec_time/${formattedTimezone}.json?auth=${FIREBASE_API_KEY}`;

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

            if (uuidData && typeof uuidData === "object") {
                Object.keys(uuidData).forEach((uuid) => uuidSet.add(uuid)); // Add UUIDs to Set
            }
        } catch (error) {
            Logger.log(`Error retrieving data for timezone ${timezone}: ${error.message}`);
        }
    });

    const uuidArr = Array.from(uuidSet); // Convert Set to array
    Logger.log(`UUIDs with data for timezones ${JSON.stringify(timezones)}: ${JSON.stringify(uuidArr)}`);

    return uuidArr;
}


function getUUIDDataFromTrialCampaignTable() {
    console.log(`getting UUIDs from TrialCampaignTable`);
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

function deleteUUIDFromTrialCampaignTable(uuid) {
  console.log(`Deleting UUID: ${uuid} from the trial_campaign table.`);

  const firebaseUrl = `${FIREBASE_URL}/trial_campaign/${uuid}.json?auth=${FIREBASE_API_KEY}`;

  const options = {
    method: "delete",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${FIREBASE_API_KEY}`,
    },
    muteHttpExceptions: true, // Avoid throwing errors for non-200 responses
  };

  try {
    const response = UrlFetchApp.fetch(firebaseUrl, options);
    if (response.getResponseCode() === 200) {
      console.log(`UUID ${uuid} successfully deleted.`);
    } else {
      console.error(`Failed to delete UUID ${uuid}: ${response.getContentText()}`);
    }
  } catch (error) {
    console.error(`Error deleting UUID ${uuid}: ${error.message}`);
  }
}


/**
 * Saves a sanitized horoscope entry to the Firebase zodiac table for a specific UUID and day of the week.
 *
 * @param {Object} jsonData - The horoscope data to save.
 * @param {string} uuid - The unique identifier for the user.
 * @returns {void}
 */
function saveHoroscopeToFirebase(jsonData, uuid, tomorrow) {
  const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const today = new Date();

  // Determine the day of the week
  const dayOfWeek = tomorrow || daysOfWeek[today.getDay()];

  // Early exit if `dayOfWeek` is undefined
  if (!dayOfWeek) {
    Logger.log("Invalid dayOfWeek. Skipping Firebase save.");
    return;
  }

  const sanitizedData = sanitizeKeys(jsonData);

  const firebaseUrl = `${FIREBASE_URL}/zodiac/${uuid}/${dayOfWeek}.json?auth=${FIREBASE_API_KEY}`;

  const options = {
    method: "put",
    contentType: "application/json",
    payload: JSON.stringify(sanitizedData[0]),
    muteHttpExceptions: true, // Moved here to make the options object self-contained
  };

  try {
    const response = UrlFetchApp.fetch(firebaseUrl, options);
    Logger.log(`Horoscope saved to Firebase at ${firebaseUrl}`);
  } catch (e) {
    Logger.log(`Error saving horoscope to Firebase: ${e.message}`);
  }
}


/**
 * Retrieves zodiac data for today from the Firebase zodiac table for a specific UUID.
 *
 * @param {string} uuid - The unique identifier for the user.
 * @returns {Object|null} - The zodiac data for today if found, otherwise null.
 */
function getZodiacDataForToday(uuid) {
    console.log("Getting zodiac data for today for uuid: ", uuid);
  // Firebase URL to the zodiac table using the provided UUID
  const url = `${FIREBASE_URL}/zodiac/${uuid}.json?auth=${FIREBASE_API_KEY}`;
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

function getZodiacDataForTomorrow(uuid) {
    uuid = TEST_USER;
  console.log("Getting zodiac data for tomorrow");
  // Firebase URL to the zodiac table using the provided UUID
  const url = `${FIREBASE_URL}/zodiac/${uuid}.json?auth=${FIREBASE_API_KEY}`;
  try {
    const response = UrlFetchApp.fetch(url);
    const data = JSON.parse(response.getContentText());

    // Get tomorrow's day of the week
    const tomorrow = getTomorrowDay();

    // Check if tomorrow's data exists in the response
    if (data && data[tomorrow]) {
      Logger.log(`Data for ${tomorrow}: ${JSON.stringify(data[tomorrow])}`);
      return data[tomorrow];
    } else {
      Logger.log(`No data found for ${tomorrow} for UUID: ${uuid}`);
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
    console.log("getThreeDaysDataFromFirebase");
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
            Logger.log("No three days days found for UUID: " + uuid);
            return null;
        }
    } catch (e) {
        Logger.log("Error retrieving data from Firebase: " + e.message);
        return null;
    }
}
