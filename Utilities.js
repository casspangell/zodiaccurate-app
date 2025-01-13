function formatKey(input) {
  return input
    .toLowerCase() // Convert to lowercase
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric characters with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading or trailing hyphens
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