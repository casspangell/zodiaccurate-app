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

function transformKeysToLowerCaseWithUnderscores(inputJson) {
  console.log("Original Input Data:", JSON.stringify(inputJson, null, 2));

  if (Array.isArray(inputJson)) {
    // Transform each object in the array
    const transformedArray = inputJson.map(item => {
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
  } else if (typeof inputJson === 'object' && inputJson !== null) {
    // Transform a single object
    const transformedObject = {};
    for (const key in inputJson) {
      const transformedKey = key
        .toLowerCase()
        .replace(/\s+/g, '_')   // Replace spaces with underscores
        .replace(/[^a-z0-9_]/g, ''); // Remove non-alphanumeric characters except underscores

      transformedObject[transformedKey] = inputJson[key];
    }
    console.log("Transformed Object Data:", JSON.stringify(transformedObject, null, 2));
    return transformedObject;
  } else {
    // Return the input as-is for unsupported types
    return inputJson;
  }
}



function trimWhitespace(input) {
  if (typeof input === "string") {
    return input.trim();
  }
  return input;
}

function replaceSlashesWithDashes(input) {
    return input.replace(/\//g, "_");
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



