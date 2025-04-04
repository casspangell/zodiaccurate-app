function formatKey(input) {
  return input
    .toLowerCase() // Convert to lowercase
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric characters with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading or trailing hyphens
}

function normalizeKeys(inputJson) {
  const normalizedJson = {};

  for (const key in inputJson) {
    // Normalize the key: lowercase, replace spaces with underscores, trim
    const normalizedKey = key.toLowerCase().replace(/\s+/g, '_').trim();
    // Assign the value to the normalized key in the new object
    normalizedJson[normalizedKey] = inputJson[key];
  }

  return normalizedJson;
}

function sanitizeKeys(data) {
  const sanitizedObject = {};
  Object.keys(data).forEach(key => {
    // Replace invalid characters (e.g., spaces) with underscores
    const sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, "_");
    sanitizedObject[sanitizedKey] = data[key];
  });
  return sanitizedObject;
}

/**
 * Sanitizes JSON keys before saving to Firebase.
 * - Converts keys to lowercase.
 * - Replaces spaces with underscores.
 * - Removes special characters that Firebase does not allow.
 * - Ensures values are valid JSON objects/strings.
 *
 * @param {Object} jsonData - The raw user data to be sanitized.
 * @returns {Object} - The sanitized JSON object.
 */
function sanitizeJsonKeys(jsonData) {
    const sanitizedData = {};

    Object.keys(jsonData).forEach((key) => {
        // Convert key to lowercase
        let sanitizedKey = key.toLowerCase();

        // Remove leading/trailing spaces
        sanitizedKey = sanitizedKey.trim();

        // Replace spaces with underscores
        sanitizedKey = sanitizedKey.replace(/\s+/g, "_");

        // Remove disallowed characters ($ # [ ] / or .)
        sanitizedKey = sanitizedKey.replace(/[$#\[\]\/.]/g, "");

        // Store value with sanitized key
        sanitizedData[sanitizedKey] = jsonData[key];
    });

    return sanitizedData;
}

/**
 * Sanitizes data for Firebase by ensuring keys and values are valid
 * 
 * @param {Object} data - The data object to sanitize
 * @returns {Object} - The sanitized data object
 */
function sanitizeFirebaseData(data) {
  // Create a new object for sanitized data
  const sanitized = {};
  
  // Process each property in the data object
  for (const key in data) {
    if (!data.hasOwnProperty(key)) continue;
    
    // Skip null or undefined values
    if (data[key] === null || data[key] === undefined) continue;
    
    // Create a Firebase-safe key (no '.', '$', '#', '[', ']', '/')
    const safeKey = key.replace(/[.#$\[\]\/]/g, '_');
    
    // Process the value based on its type
    let value = data[key];
    
    if (typeof value === 'string') {
      // Strings are fine, but make sure they're not too long
      if (value.length > 100000) {
        value = value.substring(0, 100000) + "... [truncated]";
      }
      sanitized[safeKey] = value;
    } 
    else if (typeof value === 'number' || typeof value === 'boolean') {
      // Numbers and booleans are fine as is
      sanitized[safeKey] = value;
    }
    else if (typeof value === 'object') {
      // Convert objects to JSON strings
      try {
        sanitized[safeKey] = JSON.stringify(value);
      } catch (e) {
        sanitized[safeKey] = String(value);
      }
    }
    else {
      // Convert any other types to strings
      sanitized[safeKey] = String(value);
    }
  }
  
  return sanitized;
}

/**
 * Sanitizes data for Firebase by ensuring keys and values are valid
 * 
 * @param {Object} data - The data object to sanitize
 * @returns {Object} - The sanitized data object
 */
function sanitizeForFirebase(data) {
  // Create a deep copy to avoid modifying the original
  const sanitized = JSON.parse(JSON.stringify(data));
  
  // Loop through all properties
  for (const key in sanitized) {
    // Skip if not own property
    if (!sanitized.hasOwnProperty(key)) continue;
    
    // Check for invalid key names (Firebase doesn't allow '.', '$', '#', '[', ']', '/')
    if (/[.#$\[\]\/]/.test(key)) {
      // Create a new sanitized key
      const newKey = key.replace(/[.#$\[\]\/]/g, '_');
      sanitized[newKey] = sanitized[key];
      delete sanitized[key];
    }
    
    // Check value type and convert if necessary
    const value = sanitized[key];
    
    // If value is undefined or null, set to empty string
    if (value === undefined || value === null) {
      sanitized[key] = "";
    }
    // If value is an object or array, stringify it
    else if (typeof value === 'object') {
      sanitized[key] = JSON.stringify(value);
    }
    // If value is not a string, convert it to string
    else if (typeof value !== 'string') {
      sanitized[key] = value.toString();
    }
    
    // Ensure value is not too long for Firebase (Firebase has limits on string size)
    if (typeof sanitized[key] === 'string' && sanitized[key].length > 100000) {
      sanitized[key] = sanitized[key].substring(0, 100000) + "... [truncated]";
    }
  }
  
  return sanitized;
}

/**
 * Sanitizes the campaign data before saving to Firebase
 * @param {Object} campaignData - The campaign data to sanitize
 * @returns {Object} - Sanitized campaign data
 */
function sanitizeCampaignData(campaignData) {
  // Create a deep copy of the object
  const sanitized = JSON.parse(JSON.stringify(campaignData));
  
  // Ensure all field names are valid Firebase keys
  const validFieldRegex = /^[a-zA-Z0-9_]+$/;
  
  for (const key in sanitized) {
    // Check if key is valid
    if (!validFieldRegex.test(key)) {
      const newKey = key.replace(/[^a-zA-Z0-9_]/g, '_');
      sanitized[newKey] = sanitized[key];
      delete sanitized[key];
    }
    
    // Ensure value is a string or can be converted to a string
    if (sanitized[key] !== null && sanitized[key] !== undefined) {
      if (typeof sanitized[key] !== 'string') {
        sanitized[key] = String(sanitized[key]);
      }
    }
  }
  
  return sanitized;
}

/**
 * Creates a Firebase-safe key from a category name
 * Uses your existing formatting utilities
 * 
 * @param {string} category - The category name
 * @returns {string} - Firebase-safe key
 */
function formatCategoryKey(category) {
  if (!category) return "unknown_category";
  
  // Use your existing formatKey function to sanitize
  // or create a more specific format for categories
  return category
    .trim()
    .toLowerCase()
    .replace(/\//g, "_")         // Replace slashes with underscores
    .replace(/[\.\#\$\[\]]/g, "_") // Replace other Firebase-forbidden chars
    .replace(/\s+/g, "_")        // Replace spaces with underscores
    .replace(/^-+|-+$/g, "");    // Remove leading or trailing hyphens
}

/**
 * Transforms object keys to lowercase with underscores, and replaces slashes in strings.
 *
 * @param {Object|Array|string} inputJson - The data to transform.
 * @returns {Object|Array|string} - Transformed data with corrected keys or strings.
 */
function transformKeysToLowerCaseWithUnderscores(inputJson) {

    if (typeof inputJson === "string") {
        // Handle strings like "Asia/Calcutta" → "Asia_Calcutta"
        const transformedString = inputJson.toLowerCase().replace(/\//g, "_");
        return transformedString;
    } 
    
    else if (Array.isArray(inputJson)) {
        // Transform each object in the array
        const transformedArray = inputJson.map(item => {
            if (typeof item === "string") {
                return item.toLowerCase().replace(/\//g, "_"); // Transform strings in arrays
            }
            const transformedItem = {};
            for (const key in item) {
                const transformedKey = key
                    .toLowerCase()
                    .replace(/\s+/g, '_')   // Replace spaces with underscores
                    .replace(/[^a-z0-9_]/g, ''); // Remove non-alphanumeric characters except underscores

                transformedItem[transformedKey] = item[key];
            }
            return transformedItem;
        });
        console.log("Transformed Array Data:", JSON.stringify(transformedArray, null, 2));
        return transformedArray;
    } 
    
    else if (typeof inputJson === "object" && inputJson !== null) {
        // Transform a single object
        const transformedObject = {};
        for (const key in inputJson) {
            const transformedKey = key
                .toLowerCase()
                .replace(/\s+/g, '_')   // Replace spaces with underscores
                .replace(/[^a-z0-9_]/g, ''); // Remove non-alphanumeric characters except underscores

            transformedObject[transformedKey] = inputJson[key];
        }
        return transformedObject;
    } 
    
    else {
        // Return the input as-is for unsupported types
        console.log("No transformation applied. Returning input as is.");
        return inputJson;
    }
}


function getObjectFromData(data) {
  if (Array.isArray(data) && data.length > 0) {
    return data[0];
  } else if (typeof data === "object" && data !== null) {
    return data;
  } else {
    return null;
  }
}

function trimWhitespace(input) {
  if (typeof input === "string") {
    return input.trim();
  }
  return input;
}

/**
 * Replaces slashes ("/") with underscores ("_") in a given string.
 *
 * @param {string|null|undefined} input - The string to process.
 * @returns {string} - The modified string with slashes replaced, or an empty string if input is invalid.
 */
function replaceSlashesWithDashes(input) {
    if (!input || typeof input !== "string") {
        Logger.log("Invalid input received in replaceSlashesWithDashes: " + input);
        return input;
    }
    return input.toLowerCase().replace(/\//g, "_");
}

function getCurrentHour() {
  const now = new Date();
  return now.getHours(); // Returns the hour (0-23) in 24-hour format
}

// Returns the day of the week for today
function getCurrentDayOfWeek() {
  const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const today = new Date();
  const dayOfWeek = daysOfWeek[today.getDay()]; // getDay() returns 0 for Sunday, 1 for Monday, etc.
  return dayOfWeek;
}

function findKeyValue(obj, targetKey) {
  let result = null;

  function traverse(currentObj) {
    for (const key in currentObj) {
      if (key === targetKey) {
        result = currentObj[key];
        return;
      }
      if (typeof currentObj[key] === 'object' && currentObj[key] !== null) {
        traverse(currentObj[key]);
      }
    }
  }

  traverse(obj);
  return result;
}

function getTomorrowDay() {
  const today = new Date();
  const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  
  const tomorrowDay = daysOfWeek[(today.getDay() + 1) % 7];
  
  return tomorrowDay;
}

function getTodayDay() {
  const today = new Date();
  const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  
  const todayDay = daysOfWeek[(today.getDay()) % 7];
  
  return todayDay;
}


function getCopyright() {
  const currentYear = new Date().getFullYear();
  return `&copy; ${currentYear} Zodiaccurate. All rights reserved.`;
}

/**
 * Formats the current date based on the user's timezone and locale preferences for English-speaking regions.
 *
 * @param {string} uuid - The user's UUID to fetch the timezone from Firebase.
 * @returns {string} - A formatted date string based on the user's timezone and locale.
 */
function formatDateForUser(uuid) {

  // Retrieve the user's timezone from Firebase
  let timeZoneId = getUserTimezone(uuid);

  if (!timeZoneId) {
    throw new Error("Could not retrieve timezone for user with UUID: " + uuid);
  }

  // Replace underscores with slashes to ensure compatibility with Intl.DateTimeFormat
  timeZoneId = timeZoneId.replace(/_/g, "/");

  console.log("Formatted User's timezone: ", timeZoneId);

  // Map of typical date formats for English-speaking regions
  const regionFormats = {
    "US": { locale: "en-US", format: "MM/DD/YYYY" }, // United States
    "CA": { locale: "en-CA", format: "YYYY-MM-DD" }, // Canada
    "GB": { locale: "en-GB", format: "DD/MM/YYYY" }, // United Kingdom
    "AU": { locale: "en-AU", format: "DD/MM/YYYY" }, // Australia
    "NZ": { locale: "en-NZ", format: "DD/MM/YYYY" }, // New Zealand
    "ZA": { locale: "en-ZA", format: "YYYY/MM/DD" }, // South Africa
    "IN": { locale: "en-IN", format: "DD-MM-YYYY" }, // India
  };

  // Infer the region based on the timezone ID
  const region = Object.keys(regionFormats).find((key) => timeZoneId.includes(key)) || "US";

  // Get the locale for the matched region
  const { locale } = regionFormats[region];

  // Create a Date object for the current time in the user's timezone
  const now = new Date();

  // Format the date string
  const formatter = new Intl.DateTimeFormat(locale, {
    timeZone: timeZoneId,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const formattedDate = formatter.format(now);

  return formattedDate;
}

function getTomorrowDay() {
  const today = new Date();
  const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const tomorrowDay = daysOfWeek[(today.getDay() + 1) % 7];
  console.log("Returning tomorrow: ", tomorrowDay);
  return tomorrowDay;
}

/**
 * Extracts user, partner, and children information from the user data.
 * Specifically designed to work with the actual data structure.
 * 
 * @param {Object} jsonSinglePersonData - User data object from your form
 * @returns {Object} - Object containing extracted user information
 */
function getUserNames(jsonSinglePersonData) {
    // Initialize with default values
    let userNames = {
        firstName: "User",
        partnerName: "",
        childrenNames: [],
        importantPersonNames: []
    };
    
    // Safety check
    if (!jsonSinglePersonData) {
        console.log("WARNING: jsonSinglePersonData is null or undefined");
        return userNames;
    }
    
    try {
        // Extract user's first name
        if (jsonSinglePersonData.name && typeof jsonSinglePersonData.name === 'string') {
            const nameParts = jsonSinglePersonData.name.split(' ');
            userNames.firstName = nameParts[0] || "User";
        }
        
        // Extract partner name
        if (jsonSinglePersonData.partner_name && jsonSinglePersonData.partner_name.trim() !== "") {
            userNames.partnerName = jsonSinglePersonData.partner_name.trim();
        }
        
        // Extract children names
        let childrenNames = [];
        
        // Get number of children (if available)
        let numChildren = 0;
        if (jsonSinglePersonData.number_of_children) {
            const match = jsonSinglePersonData.number_of_children.match(/(\d+)/);
            if (match) {
                numChildren = parseInt(match[1], 10);
            }
        }
        
        // Look for child_X_first_name pattern (where X might be "one", "two", etc.)
        const childPatterns = [
            { prefix: "child_one_", numeral: "1" },
            { prefix: "child_two_", numeral: "2" },
            { prefix: "child_three_", numeral: "3" },
            { prefix: "child_four_", numeral: "4" },
            { prefix: "child_five_", numeral: "5" }
        ];
        
        // Also check numeric patterns (child_1_first_name)
        const numericPatterns = [
            { prefix: "child_1_", numeral: "1" },
            { prefix: "child_2_", numeral: "2" },
            { prefix: "child_3_", numeral: "3" },
            { prefix: "child_4_", numeral: "4" },
            { prefix: "child_5_", numeral: "5" }
        ];
        
        // Combine all patterns
        const allPatterns = [...childPatterns, ...numericPatterns];
        
        // Check each pattern
        for (const pattern of allPatterns) {
            const nameKey = `${pattern.prefix}first_name`;
            if (jsonSinglePersonData[nameKey] && jsonSinglePersonData[nameKey].trim() !== "") {
                const childName = jsonSinglePersonData[nameKey].trim();
                childrenNames.push(childName);
            }
        }
        
        // If we found no children but the user indicated they have children,
        // check for other indicators and add a generic placeholder
        if (childrenNames.length === 0 && 
            (numChildren > 0 || jsonSinglePersonData.areas_of_improvement?.includes("daughter") || 
             jsonSinglePersonData.areas_of_improvement?.includes("son") ||
             jsonSinglePersonData.areas_of_improvement?.includes("child") ||
             jsonSinglePersonData.important_goals?.includes("father"))) {
            childrenNames.push("your child");
        }
        
        userNames.childrenNames = childrenNames;
        
        return userNames;
    } catch (error) {
        console.log("Error in getUserNames:", error);
        return {
            firstName: userNames.firstName || "User",
            partnerName: userNames.partnerName || "",
            childrenNames: userNames.childrenNames || [],
            importantPersonNames: userNames.importantPersonNames || []
        };
    }
}



