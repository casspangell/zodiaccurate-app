
let cachedToken = null;
let tokenExpirationTime = null;

function getFirebaseIdToken(email, password) {
    const now = new Date().getTime();
    
    // Use cached token if still valid
    if (cachedToken && tokenExpirationTime > now) {
        return cachedToken;
    }

    const url = `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=${FIREBASE_API_KEY}`;
    const config = {
        method: "post",
        contentType: "application/json",
        headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
        },
        payload: JSON.stringify({ email, password, returnSecureToken: true }),
    };

    const response = UrlFetchApp.fetch(url, config);
    const data = JSON.parse(response.getContentText());

    if (!data.idToken) {
        Logger.log(`Firebase Authentication Error: ${JSON.stringify(data)}`);
        return null;
    }

    // Cache the token and set expiration time
    cachedToken = data.idToken;
    tokenExpirationTime = now + (data.expiresIn * 1000) - 60000; // Refresh 1 minute before expiry

    return cachedToken;
}


/**
 * Pushes a JSON entry to the Firebase responses table for a specific UUID.
 *
 * @param {Object} jsonData - The JSON data to be saved.
 * @param {string} uuid - The unique identifier for the entry.
 * @returns {boolean} - Returns true if the operation is successful, otherwise false.
 */
function pushEntryToFirebase(jsonData, uuid) {
    Logger.log("pushEntryToFirebase Sanitizing JSON before saving...");
    const sanitizedData = sanitizeJsonKeys(jsonData); // Clean keys before saving

    Logger.log("pushEntryToFirebase...", JSON.stringify(sanitizedData));

    const token = getFirebaseIdToken("appscript@zodiaccurate.com", FIREBASE_PASSWORD);

    if (!token) {
        Logger.log("❌ Firebase authentication failed. No token received.");
        return false;
    }

    const firebaseUrl = `${FIREBASE_URL}/responses/${uuid}.json?auth=${token}`;
    
    const options = {
        method: "put",
        contentType: "application/json",
        payload: JSON.stringify(sanitizedData),
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
    Logger.log("🚀 saveUserToUserTableFirebase...");
    
    // Validate input
    if (!uuid || typeof uuid !== "string") {
        Logger.log("❌ Invalid UUID provided.");
        return false;
    }
    
    if (!jsonData || typeof jsonData !== "object") {
        Logger.log("❌ Invalid user data provided.");
        return false;
    }
    
    // Authenticate and retrieve token
    const token = getFirebaseIdToken("appscript@zodiaccurate.com", FIREBASE_PASSWORD);
    if (!token) {
        Logger.log("❌ Firebase Authentication Failed.");
        return false;
    }

    // Construct Firebase URL
    const firebaseUrl = `${FIREBASE_URL}/users/${uuid}.json?auth=${token}`;

    // Request Options
    const options = {
        method: "patch",
        contentType: "application/json",
        payload: JSON.stringify(jsonData),
        headers: {
            Authorization: `Bearer ${token}`
        },
        muteHttpExceptions: true
    };

    try {
        // Send PATCH request
        const response = UrlFetchApp.fetch(firebaseUrl, options);
        const statusCode = response.getResponseCode();
        const responseBody = response.getContentText();

        if (statusCode === 200) {
            Logger.log("✅ Entry successfully saved to Firebase.");
            Logger.log("🔥 Response: " + responseBody);
            return true;
        } else {
            Logger.log(`❌ Firebase PATCH Failed. HTTP ${statusCode}: ${responseBody}`);
            return false;
        }
    } catch (error) {
        Logger.log(`❌ Error saving entry to Firebase: ${error.message}`);
        return false;
    }
}


function saveEmailCampaignToFirebase(jsonData, uuid) {
  Logger.log("saveEmailCampaignToFirebase...");
  
  // Validate UUID
  if (!uuid || typeof uuid !== 'string') {
    Logger.log("❌ Invalid UUID provided");
    return false;
  }
  
  try {
    // Handle array result (common from CSV parsers)
    let dataToSave;
    
    if (Array.isArray(jsonData)) {
      // If we have an array, use the first item (assuming it's the data row)
      if (jsonData.length > 0) {
        dataToSave = jsonData[0];
        Logger.log("📊 Converting array result to object (using first item)");
      } else {
        Logger.log("❌ Empty array provided as jsonData");
        return false;
      }
    } else if (typeof jsonData === 'object') {
      // If it's already an object, use it directly
      dataToSave = jsonData;
    } else {
      Logger.log(`❌ Invalid data type: ${typeof jsonData}`);
      return false;
    }
    
    // Additional data validation
    if (!dataToSave || typeof dataToSave !== 'object') {
      Logger.log("❌ Invalid data object after conversion");
      return false;
    }
    
    // Sanitize keys and values for Firebase
    const sanitizedData = sanitizeFirebaseData(dataToSave);
    
    // Log the data we're about to save
    Logger.log("📦 Data to save to Firebase (preview): " + 
               JSON.stringify(sanitizedData).substring(0, 500) + "...");
    
    // Get Firebase token
    const token = getFirebaseIdToken("appscript@zodiaccurate.com", FIREBASE_PASSWORD);
    if (!token) {
      Logger.log("❌ Firebase Authentication Failed.");
      return false;
    }
    
    // Construct Firebase URL
    const firebaseUrl = `${FIREBASE_URL}/trial_campaign/${uuid}.json?auth=${token}`;
    
    // Set request options
    const options = {
      method: "patch",
      contentType: "application/json",
      payload: JSON.stringify(sanitizedData), // This should now be a valid object, not an array
      headers: {
        Authorization: `Bearer ${token}`
      },
      muteHttpExceptions: true
    };
    
    // Send the request to Firebase
    const response = UrlFetchApp.fetch(firebaseUrl, options);
    const statusCode = response.getResponseCode();
    const responseBody = response.getContentText();
    
    // Check if the request was successful
    if (statusCode >= 200 && statusCode < 300) {
      Logger.log(`✅ Data successfully saved to Firebase. Status: ${statusCode}`);
      return true;
    } else {
      Logger.log(`❌ Error saving to Firebase. Status: ${statusCode}`);
      Logger.log(`Full response: ${responseBody}`);
      return false;
    }
  } catch (error) {
    Logger.log(`❌ Error saving entry to Firebase: ${error.message}`);
    if (error.stack) {
      Logger.log(`Stack trace: ${error.stack}`);
    }
    return false;
  }
}

function getEmailCampaignFromFirebase(uuid) {
      console.log("getEmailCampaignFromFirebase: ", uuid);
    const firebaseUrl = `${FIREBASE_URL}/trial_campaign/${uuid}.json?auth=${FIREBASE_API_KEY}`;

    const token = getFirebaseIdToken("appscript@zodiaccurate.com", FIREBASE_PASSWORD);

    const options = {
        method: "get",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
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
 * Retrieves zodiac data for the last three days from the Firebase zodiac table for a specific UUID.
 *
 * @param {string} uuid - The unique identifier for the user.
 * @returns {Object|null} - An object containing data for the last three days if found, otherwise null.
 */
function getThreeDaysDataFromFirebase(uuid) {
    console.log("getThreeDaysDataFromFirebase");
  const token = getFirebaseIdToken("appscript@zodiaccurate.com", FIREBASE_PASSWORD);
    const firebaseUrl = `${FIREBASE_URL}/zodiac/${uuid}.json?auth=${token}`;

    const options = {
        method: "GET",
        contentType: "application/json",
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    try {
        const response = UrlFetchApp.fetch(firebaseUrl, options);
        const data = JSON.parse(response.getContentText());
        const daysOfTheWeekData = {};

        if (data) {
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
    console.log("updateExecTimeTable started for UUID:", uuid, "Timezone:", timezone);
    
    const token = getFirebaseIdToken("appscript@zodiaccurate.com", FIREBASE_PASSWORD);
    if (!token) {
        Logger.log("Firebase Authentication Failed. Token is null or undefined.");
        return;
    }

    console.log("Firebase Token Retrieved");
    const execTimeUrl = `${FIREBASE_URL}/exec_time.json?auth=${token}`;

    timezone = transformKeysToLowerCaseWithUnderscores(timezone);
    Logger.log(`Transformed Timezone: ${timezone}`);

    try {
        Logger.log("Fetching existing timezones from Firebase...");
        const execTimeData = getTimezonesArrayListFromFirebase();
        
        if (!execTimeData || typeof execTimeData !== "object") {
            Logger.log("Error: Retrieved invalid exec_time data.");
            return;
        }

        Logger.log(`Fetched Exec Time Data: ${JSON.stringify(execTimeData, null, 2)}`);

        // Check all timezones for the UUID and remove if exists
        let uuidFound = false;
        Object.keys(execTimeData).forEach((tz) => {
            if (execTimeData[tz] && execTimeData[tz][uuid]) {
                uuidFound = true;
                const deleteUrl = `${FIREBASE_URL}/exec_time/${tz}/${uuid}.json?auth=${token}`;
                
                Logger.log(`Deleting UUID ${uuid} from timezone ${tz}`);
                
                const deleteResponse = UrlFetchApp.fetch(deleteUrl, {
                    method: "delete",
                    headers: { "Content-Type": "application/json" }
                });

                Logger.log(`Delete Response (${tz}): ${deleteResponse.getResponseCode()} - ${deleteResponse.getContentText()}`);
            }
        });

        if (!uuidFound) {
            Logger.log(`UUID: ${uuid} not found in any existing timezone.`);
        }

        // Add the UUID to the specified timezone column
        const addUrl = `${FIREBASE_URL}/exec_time/${timezone}/${uuid}.json?auth=${token}`;
        Logger.log(`Adding UUID ${uuid} to timezone ${timezone}`);

        const addResponse = UrlFetchApp.fetch(addUrl, {
            method: "put",
            contentType: "application/json",
            payload: JSON.stringify({ timezone }), // Save as an object
        });

        Logger.log(`Add Response: ${addResponse.getResponseCode()} - ${addResponse.getContentText()}`);

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
    Logger.log("saveTimezoneToFirebase timezone: ", timezone," uuid: ", uuid, " data: ", jsonData);
    const updatedTimezone = transformKeysToLowerCaseWithUnderscores(timezone); 
    const token = getFirebaseIdToken("appscript@zodiaccurate.com", FIREBASE_PASSWORD);
    const firebaseUrl = `${FIREBASE_URL}/exec_time/${updatedTimezone}/${uuid}.json?auth=${token}`;

    const options = {
        method: "put",
        contentType: "application/json",
        payload: JSON.stringify(timezone),
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    try {
        const response = UrlFetchApp.fetch(firebaseUrl, options);
        saveTimezoneToTimezoneArrayList(updatedTimezone);

        Logger.log("Timezone Entry saved: " + response.getContentText());
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
    console.log("saveTimezoneToTimezoneArrayList");

    if (!newTimezone || typeof newTimezone !== "string") {
        Logger.log("Invalid timezone provided.");
        return false;
    }

    const token = getFirebaseIdToken("appscript@zodiaccurate.com", FIREBASE_PASSWORD);
    if (!token) {
        Logger.log("Failed to authenticate with Firebase.");
        return false;
    }

    const firebaseUrl = `${FIREBASE_URL}/timezones.json?auth=${token}`;

    try {
        // Fetch existing timezones with authentication
        const getOptions = {
            method: "get",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            muteHttpExceptions: true // Prevents throwing an error for non-200 responses
        };

        const response = UrlFetchApp.fetch(firebaseUrl, getOptions);
        const statusCode = response.getResponseCode();

        if (statusCode !== 200) {
            Logger.log(`Failed to fetch existing timezones: HTTP ${statusCode}`);
            return false;
        }

        let existingTimezones = JSON.parse(response.getContentText());

        // Ensure it's an array; otherwise, initialize as an empty array
        if (!Array.isArray(existingTimezones)) {
            existingTimezones = [];
        }

        // Remove all null and undefined values
        existingTimezones = existingTimezones.filter(tz => tz !== null && tz !== undefined);

        // Ensure newTimezone is added only if it's not already in the array
        if (newTimezone && !existingTimezones.includes(newTimezone)) {
            existingTimezones.push(newTimezone);
        }

        // Save the updated array back to Firebase with authentication
        const putOptions = {
            method: "put",
            contentType: "application/json",
            payload: JSON.stringify(existingTimezones),
            headers: {
                Authorization: `Bearer ${token}`
            }
        };

        const saveResponse = UrlFetchApp.fetch(firebaseUrl, putOptions);
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
    Logger.log("getTimezonesArrayListFromFirebase");

    const token = getFirebaseIdToken("appscript@zodiaccurate.com", FIREBASE_PASSWORD);
    
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
    Logger.log("🌍 Fetching timezone for UUID: " + uuid);

    // Validate input
    if (!uuid || typeof uuid !== "string") {
        Logger.log("❌ Invalid UUID provided.");
        return null;
    }

    // Authenticate and retrieve token
    const token = getFirebaseIdToken("appscript@zodiaccurate.com", FIREBASE_PASSWORD);
    if (!token) {
        Logger.log("❌ Firebase Authentication Failed.");
        return null;
    }

    // Construct Firebase URL
    const firebaseUrl = `${FIREBASE_URL}/users/${uuid}/timezone.json?auth=${token}`;
    // Logger.log(`🔥 Firebase GET Request URL: ${firebaseUrl}`);

    // Request Options
    const options = {
        method: "get",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        muteHttpExceptions: true
    };

    try {
        // Send GET request
        const response = UrlFetchApp.fetch(firebaseUrl, options);
        const statusCode = response.getResponseCode();
        const responseBody = response.getContentText();

        if (statusCode !== 200) {
            Logger.log(`❌ Firebase GET Failed. HTTP ${statusCode}: ${responseBody}`);
            return null;
        }

        // Parse response
        const timezone = JSON.parse(responseBody);
        if (!timezone || typeof timezone !== "string") {
            Logger.log(`⚠️ No valid timezone found for UUID: ${uuid}`);
            return null;
        }

        Logger.log(`✅ User's timezone retrieved: ${timezone}`);
        return timezone;
    } catch (error) {
        Logger.log(`❌ Error retrieving timezone for UUID ${uuid}: ${error.message}`);
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
    console.log("doesUserExist: ", uuid);
    
    const token = getFirebaseIdToken("appscript@zodiaccurate.com", FIREBASE_PASSWORD);
    const firebaseUrl = `${FIREBASE_URL}/users/${uuid}.json?auth=${token}`;

    const options = {
        method: "get",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
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
    const token = getFirebaseIdToken("appscript@zodiaccurate.com", FIREBASE_PASSWORD);

     const firebaseUrl = `${FIREBASE_URL}/users/${uuid}.json?auth=${token}`;

    const options = {
        method: "get",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
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
    Logger.log("saveTrialUserToFirebase: ", email);
    var encodedEmail = email.replace(/@/g, "_at_").replace(/\./g, "_dot_");

    const token = getFirebaseIdToken("appscript@zodiaccurate.com", FIREBASE_PASSWORD);
    const firebaseUrl = `${FIREBASE_URL}/trial_users/${encodedEmail}.json?auth=${token}`;

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
            Authorization: `Bearer ${token}`
        }
    };

    try {
        const response = UrlFetchApp.fetch(firebaseUrl, options);
        Logger.log("Trial User Entry saved: " + response.getContentText());
        return true;
    } catch (e) {
        Logger.log("Error saving entry to Firebase: " + e.message);
        return false;
    }
}

function getUserDataFromTrialUserTableFirebase(email) {
    console.log("getUserDataFromTrialUserTableFirebase:", email);
    const token = getFirebaseIdToken("appscript@zodiaccurate.com", FIREBASE_PASSWORD);
    const firebaseUrl = `${FIREBASE_URL}/users.json?auth=${token}`;

    const options = {
        method: "get",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
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

    const token = getFirebaseIdToken("appscript@zodiaccurate.com", FIREBASE_PASSWORD);
    const firebaseUrl = `${FIREBASE_URL}/responses/${uuid}.json?auth=${token}`;

    const options = {
        method: "get",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
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
    console.log(`getUUIDDataFromExecTimeTable(${JSON.stringify(timezones)})`);
    
    const token = getFirebaseIdToken("appscript@zodiaccurate.com", FIREBASE_PASSWORD);
    if (!token) {
        Logger.log("❌ Failed to authenticate with Firebase. Token is null.");
        return [];
    }

    Logger.log("✅ Using Firebase Token: ");  // Log full token for debugging

    var uuidSet = new Set();

    timezones.forEach((timezone) => {
        const formattedTimezone = timezone.toLowerCase().replace(/\//g, '_');
        console.log(`Fetching UUIDs for timezone: ${formattedTimezone}`);

        const firebaseUrl = `${FIREBASE_URL}/exec_time/${formattedTimezone}.json?auth=${token}`;

        const options = {
            method: "get",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            muteHttpExceptions: true
        };

        try {
            const response = UrlFetchApp.fetch(firebaseUrl, options);
            const statusCode = response.getResponseCode();

            if (statusCode !== 200) {
                Logger.log(`🚨 Error fetching data for timezone ${formattedTimezone}: HTTP ${statusCode}`);
                Logger.log(`🚨 Response Body: ${response.getContentText()}`);
                return;
            }

            let uuidData;
            try {
                uuidData = JSON.parse(response.getContentText());
            } catch (jsonError) {
                Logger.log(`🚨 JSON Parse Error for ${formattedTimezone}: ${jsonError.message}`);
                Logger.log(`🚨 Malformed JSON Response: ${response.getContentText()}`);
                return;
            }

            if (uuidData && typeof uuidData === "object") {
                Object.keys(uuidData).forEach((uuid) => uuidSet.add(uuid));
            }
        } catch (error) {
            Logger.log(`❌ Error retrieving data for timezone ${formattedTimezone}: ${error.message}`);
        }
    });

    const uuidArr = Array.from(uuidSet);
    Logger.log(`✅ UUIDs with data for timezones ${JSON.stringify(timezones)}: ${JSON.stringify(uuidArr)}`);

    return uuidArr;
}



function getUUIDDataFromTrialCampaignTable() {
    console.log(`getUUIDDataFromTrialCampaignTable`);
    const token = getFirebaseIdToken("appscript@zodiaccurate.com", FIREBASE_PASSWORD);
    const firebaseUrl = `${FIREBASE_URL}/trial_campaign/.json?auth=${token}`;

    const options = {
        method: "get",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        muteHttpExceptions: true // Avoid throwing errors for non-200 responses
    };

    try {
        const response = UrlFetchApp.fetch(firebaseUrl, options);
        console.log(response);
        const uuidData = JSON.parse(response.getContentText());
        console.log(uuidData);
        Logger.log(`UUIDs with data: ${Object.keys(uuidData)}`);
        return uuidData;

    } catch (error) {
        Logger.log(`Error retrieving data for timezone ${error.message}`);
        return []; // Return an empty array on error
    }
}

function deleteUUIDFromTrialCampaignTable(uuid) {
  console.log(`deleteUUIDFromTrialCampaignTable: ${uuid}`);
  const token = getFirebaseIdToken("appscript@zodiaccurate.com", FIREBASE_PASSWORD);
  const firebaseUrl = `${FIREBASE_URL}/trial_campaign/${uuid}.json?auth=${token}`;

  const options = {
    method: "delete",
    headers: {
      "Content-Type": "application/json"
    },
    headers: {
        Authorization: `Bearer ${token}`
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
 * Saves horoscope data to Firebase using category names as keys.
 * This function bypasses the sanitizeKeys function and directly structures the data.
 * 
 * @param {Array|Object} jsonData - The horoscope data from ChatGPT, array of category/content objects
 * @param {string} uuid - The user's UUID
 * @param {string} dayOfWeek - The day of the week to save the data for (e.g. "monday")
 * @returns {boolean} - Whether the save was successful
 */
function saveHoroscopeWithCategoryKeys(jsonData, uuid, dayOfWeek) {
  console.log("saveHoroscopeWithCategoryKeys - Saving data with category keys");
  
  // Prepare the data object with category names as keys
  const categoryData = {};
  
  try {
    // Check if jsonData is an array (multiple categories)
    if (Array.isArray(jsonData)) {
      console.log(`Processing ${jsonData.length} categories`);
      
      // Loop through each category and add it to our object
      jsonData.forEach((item, index) => {
        if (item && item.Category && item.Content) {
          // Clean the category name if needed
          const categoryKey = item.Category.trim();
          categoryData[categoryKey] = item.Content;
          console.log(`Added category: ${categoryKey}`);
        } else {
          console.warn(`Skipping item ${index} - missing Category or Content`);
        }
      });
    } 
    // Handle case where it's a single object
    else if (jsonData && typeof jsonData === 'object' && jsonData.Category && jsonData.Content) {
      const categoryKey = jsonData.Category.trim();
      categoryData[categoryKey] = jsonData.Content;
      console.log(`Added single category: ${categoryKey}`);
    }
    else {
      console.error("Invalid data format provided:", jsonData);
      return false;
    }
    
    // Check if we have any categories to save
    const categoryCount = Object.keys(categoryData).length;
    if (categoryCount === 0) {
      console.error("No valid categories found to save");
      return false;
    }
    
    console.log(`Prepared ${categoryCount} categories for saving`);
    
    // Get Firebase authentication token
    const token = getFirebaseIdToken("appscript@zodiaccurate.com", FIREBASE_PASSWORD);
    if (!token) {
      console.error("Failed to get Firebase authentication token");
      return false;
    }
    
    // Firebase URL
    const firebaseUrl = `${FIREBASE_URL}/zodiac/${uuid}/${dayOfWeek}.json?auth=${token}`;
    
    // Save to Firebase
    const options = {
      method: "put",
      contentType: "application/json",
      payload: JSON.stringify(categoryData),
      headers: {
        Authorization: `Bearer ${token}`
      },
      muteHttpExceptions: true
    };
    
    // Execute the request
    const response = UrlFetchApp.fetch(firebaseUrl, options);
    const statusCode = response.getResponseCode();
    
    if (statusCode >= 200 && statusCode < 300) {
      console.log(`✅ Successfully saved ${categoryCount} categories to Firebase with category keys`);
      return true;
    } else {
      console.error(`❌ Firebase error: HTTP ${statusCode} - ${response.getContentText()}`);
      return false;
    }
  } catch (error) {
    console.error("Error saving horoscope with category keys:", error.message);
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }
    return false;
  }
}

/**
 * Saves horoscope data to Firebase using category names as keys.
 * Uses your existing sanitizeJsonKeys function for key formatting.
 * 
 * @param {Array|Object} jsonData - The horoscope data from ChatGPT
 * @param {string} uuid - The user's UUID
 * @param {string} dayOfWeek - The day of the week (e.g., "monday")
 * @returns {boolean} - Whether the save was successful
 */
function saveHoroscopeToFirebase(jsonData, uuid, dayOfWeek) {
  console.log("saveHoroscopeToSpecificDateFirebase - Using category names as keys");
  
  try {
    // Format the data with category names as keys
    const categoryData = {};
    
    // Check if data is an array (multiple categories)
    if (Array.isArray(jsonData)) {
      console.log(`Processing ${jsonData.length} categories`);
      
      jsonData.forEach((item, index) => {
        if (item && item.Category && item.Content) {
          // Create a safe key from the category
          const safeKey = formatCategoryKey(item.Category);
          
          // Store both original category name and content
          categoryData[safeKey] = {
            Category: item.Category,
            Content: item.Content
          };
          
          console.log(`Added category: ${item.Category} (key: ${safeKey})`);
        } else {
          console.warn(`Invalid category at index ${index}`);
        }
      });
    } 
    // Handle single object case
    else if (jsonData && typeof jsonData === 'object' && jsonData.Category && jsonData.Content) {
      const safeKey = formatCategoryKey(jsonData.Category);
      categoryData[safeKey] = {
        Category: jsonData.Category,
        Content: jsonData.Content
      };
      console.log(`Added single category: ${jsonData.Category} (key: ${safeKey})`);
    }
    
    // Get Firebase authentication token
    const token = getFirebaseIdToken("appscript@zodiaccurate.com", FIREBASE_PASSWORD);
    const firebaseUrl = `${FIREBASE_URL}/zodiac/${uuid}/${dayOfWeek}.json?auth=${token}`;
    
    // Prepare options for Firebase
    const options = {
      method: "put",
      contentType: "application/json",
      payload: JSON.stringify(categoryData),
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    
    // Save to Firebase
    const response = UrlFetchApp.fetch(firebaseUrl, options);
    Logger.log(`Horoscope saved to Firebase with ${Object.keys(categoryData).length} categories`);
    return true;
  } catch (e) {
    Logger.log(`Error saving horoscope to Firebase: ${e.message}`);
    return false;
  }
}


/**
 * Retrieves zodiac data for today from the Firebase zodiac table for a specific UUID.
 *
 * @param {string} uuid - The unique identifier for the user.
 * @returns {Object|null} - The zodiac data for today if found, otherwise null.
 */
function getZodiacDataForToday(uuid) {
    console.log("getZodiacDataForToday: ", uuid);
    const token = getFirebaseIdToken("appscript@zodiaccurate.com", FIREBASE_PASSWORD);

  // Firebase URL to the zodiac table using the provided UUID
  const url = `${FIREBASE_URL}/zodiac/${uuid}.json?auth=${token}`;

  const options = {
        method: "GET",
        contentType: "application/json",
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

  try {

    const response = UrlFetchApp.fetch(url, options);
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
  console.log("getZodiacDataForTomorrow");
  // Firebase URL to the zodiac table using the provided UUID
      const token = getFirebaseIdToken("appscript@zodiaccurate.com", FIREBASE_PASSWORD);
  const url = `${FIREBASE_URL}/zodiac/${uuid}.json?auth=${token}`;


    const options = {
        method: "get",
        contentType: "application/json",
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

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
 * Main function to list users with trial=true who have been on trial for 30+ days
 * This function doesn't modify any user data
 */
/**
 * Gets users who have trial="true" and have been on trial for 30+ days
 * This is a synchronous function that directly returns the users array
 * 
 * @returns {Array} Array of users with trial="true" who have been on trial for 30+ days
 */
function getTrialUsersOverThirtyDays() {
  Logger.log("🔍 Finding users with trial=true for 30+ days...");
  
  try {
    const token = getFirebaseIdToken("appscript@zodiaccurate.com", FIREBASE_PASSWORD);
    
    if (!token) {
      Logger.log("❌ Firebase Authentication Failed. No token received.");
      return [];
    }
    
    // Fetch all users
    const firebaseUrl = `${FIREBASE_URL}/users.json?auth=${token}`;
    
    const options = {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(firebaseUrl, options);
    const statusCode = response.getResponseCode();
    
    if (statusCode !== 200) {
      Logger.log(`❌ Failed to retrieve users. HTTP Status: ${statusCode}`);
      return [];
    }
    
    const usersData = JSON.parse(response.getContentText());
    
    if (!usersData || typeof usersData !== 'object') {
      Logger.log("❌ No users found or invalid data structure");
      return [];
    }
    
    const trialUsersOverThirtyDays = [];
    
    // Check each user
    for (const userId in usersData) {
      const userData = usersData[userId];
      
      // Check if user has trial="true" and a trial-date-start
      if (userData.trial === "true" && userData['trial-date-start']) {
        const startDate = new Date(userData['trial-date-start']);
        const currentDate = new Date();
        const timeDiff = currentDate - startDate;
        const daysDiff = Math.floor(timeDiff / 86400000);
        
        // If trial period is 30+ days
        if (daysDiff >= 30) {
          Logger.log(`🔍 Found trial user ${userId} who has been on trial for ${daysDiff} days`);
          
          // Add user ID and details to the list
          trialUsersOverThirtyDays.push({
            userId: userId,
            email: userData.email || "Unknown",
            name: userData.name || "Unknown",
            trialStartDate: userData['trial-date-start'],
            daysOnTrial: daysDiff
          });
        }
      }
    }
    
    Logger.log(`✅ Found ${trialUsersOverThirtyDays.length} users with trial=true for 30+ days`);
    
    // Log details of each user
    trialUsersOverThirtyDays.forEach((user, index) => {
      Logger.log(`${index + 1}. User: ${user.email} (${user.userId})`);
      Logger.log(`   Name: ${user.name}`);
      Logger.log(`   Trial Start Date: ${user.trialStartDate}`);
      Logger.log(`   Days on Trial: ${user.daysOnTrial}`);
      Logger.log(`   -----`);
    });
    
    return trialUsersOverThirtyDays;
    
  } catch (error) {
    Logger.log(`❌ Error finding trial users: ${error.message}`);
    return [];
  }
}

/**
 * Updates trial status from "true" to "expired" for users who have exceeded the trial period
 * Can be run on a schedule (e.g., daily) to keep trial statuses up to date
 * 
 * @param {number} trialDays - Number of days a trial should last (default: 10)
 * @returns {Object} - Summary of processed users and results
 */
function expireTrialUsers(trialDays = 10) {
  Logger.log(`🔍 Finding users with trial=true who have exceeded ${trialDays} days`);
  
  try {
    // Get authentication token
    const token = getFirebaseIdToken("appscript@zodiaccurate.com", FIREBASE_PASSWORD);
    if (!token) {
      Logger.log("❌ Firebase Authentication Failed.");
      return { success: false, error: "Authentication failed" };
    }
    
    // Fetch all users
    const firebaseUrl = `${FIREBASE_URL}/users.json?auth=${token}`;
    const options = {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(firebaseUrl, options);
    const statusCode = response.getResponseCode();
    
    if (statusCode !== 200) {
      Logger.log(`❌ Failed to retrieve users. HTTP Status: ${statusCode}`);
      return { success: false, error: `HTTP Error ${statusCode}` };
    }
    
    const usersData = JSON.parse(response.getContentText());
    
    if (!usersData || typeof usersData !== 'object') {
      Logger.log("❌ No users found or invalid data structure");
      return { success: false, error: "No valid users found" };
    }
    
    // Tracking variables
    const results = {
      total: 0,
      expiredCount: 0,
      errors: 0,
      expiredUsers: []
    };
    
    // Process each user
    for (const userId in usersData) {
      const userData = usersData[userId];
      results.total++;
      
      // Check if user has trial="true" and a trial-date-start
      if (userData.trial === "true" && userData['trial-date-start']) {
        const startDate = new Date(userData['trial-date-start']);
        const currentDate = new Date();
        const timeDiff = currentDate - startDate;
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        
        // If trial period has been exceeded
        if (daysDiff > trialDays) {
          Logger.log(`Found user ${userId} on day ${daysDiff} of trial (exceeds ${trialDays}-day limit)`);
          
          // Update trial status to "expired"
          const updateUrl = `${FIREBASE_URL}/users/${userId}.json?auth=${token}`;
          const updateData = {
            trial: "expired",
            trialExpiredDate: new Date().toISOString()
          };
          
          const updateOptions = {
            method: "patch",
            contentType: "application/json",
            payload: JSON.stringify(updateData),
            headers: {
              Authorization: `Bearer ${token}`
            },
            muteHttpExceptions: true
          };
          
          try {
            const updateResponse = UrlFetchApp.fetch(updateUrl, updateOptions);
            const updateStatus = updateResponse.getResponseCode();
            
            if (updateStatus >= 200 && updateStatus < 300) {
              Logger.log(`✅ Updated trial status to "expired" for user ${userId}`);
              results.expiredCount++;
              results.expiredUsers.push({
                userId: userId,
                email: userData.email || "Unknown",
                name: userData.name || "Unknown",
                trialDays: daysDiff
              });
            } else {
              Logger.log(`❌ Failed to update user ${userId}. Status: ${updateStatus}`);
              results.errors++;
            }
          } catch (updateError) {
            Logger.log(`❌ Error updating user ${userId}: ${updateError.message}`);
            results.errors++;
          }
        }
      }
    }
    
    // Log summary
    Logger.log(`📊 Processed ${results.total} users. Expired ${results.expiredCount} trials. Errors: ${results.errors}`);
    return {
      success: true,
      processed: results.total,
      expired: results.expiredCount,
      errors: results.errors,
      expiredUsers: results.expiredUsers
    };
    
  } catch (error) {
    Logger.log(`❌ Error processing trial users: ${error.message}`);
    return { success: false, error: error.message };
  }
}