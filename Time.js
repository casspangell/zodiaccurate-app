function getTimeZoneFromLocation(location) {
  console.log("Getting timezone from location: ", location);
  try {
    const geocoder = Maps.newGeocoder();
    const response = geocoder.geocode(location);
    
    if (response.status === 'OK' && response.results.length > 0) {
      const result = response.results[0];
      const lat = result.geometry.location.lat;
      const lng = result.geometry.location.lng;
      
      const apiKey = GOOGLE_MAPS_API_KEY;
      const timestamp = Math.floor(Date.now() / 1000); // Current timestamp in seconds
      const timezoneUrl = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${apiKey}`;
      const timezoneResponse = UrlFetchApp.fetch(timezoneUrl);
      const timezoneData = JSON.parse(timezoneResponse.getContentText());
      
      if (timezoneData.status === 'OK') {
        return timezoneData.timeZoneId; // Returns the time zone ID (e.g., "America/New_York")
      } else {
        throw new Error('Error fetching timezone: ' + timezoneData.errorMessage);
      }
    } else {
      throw new Error('Error geocoding location: ' + response.status);
    }
  } catch (error) {
    Logger.log('An error occurred: ' + error.message);
    return null;
  }
}

function calculateExecutionTimeInChicago(location) {
  console.log("Calculating time from chicago ", location);
  try {
    // Get the latitude and longitude of the location
    const geocoder = Maps.newGeocoder();
    const response = geocoder.geocode(location);
    
    if (response.status === 'OK' && response.results.length > 0) {
      const result = response.results[0];
      const lat = result.geometry.location.lat;
      const lng = result.geometry.location.lng;

      // Use the Google Maps Time Zone API
      const apiKey = GOOGLE_MAPS_API_KEY;
      const timestamp = Math.floor(Date.now() / 1000); // Current timestamp in seconds
      const timezoneUrl = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${apiKey}`;
      const timezoneResponse = UrlFetchApp.fetch(timezoneUrl);
      const timezoneData = JSON.parse(timezoneResponse.getContentText());
      
      if (timezoneData.status === 'OK') {
        const rawOffset = timezoneData.rawOffset; // Offset in seconds from UTC
        const dstOffset = timezoneData.dstOffset; // Daylight savings offset in seconds
        const totalOffset = rawOffset + dstOffset; // Total offset in seconds

        // Calculate 6 AM in the target timezone relative to Chicago time
        const targetHour = 6; // 6 AM in the target timezone
        const chicagoOffset = -6 * 3600; // Chicago is GMT-6 (in seconds)
        const offsetDifference = totalOffset - chicagoOffset; // Difference between target and Chicago offsets (in seconds)
        const chicagoTime = targetHour - offsetDifference / 3600; // Adjust by offset difference (convert seconds to hours)
        const chicagoExecutionHour = (chicagoTime + 24) % 24; // Handle negative hours by adding 24 and modulo 24

        return chicagoExecutionHour;
      } else {
        throw new Error('Error fetching timezone: ' + timezoneData.errorMessage);
      }
    } else {
      throw new Error('Error geocoding location: ' + response.status);
    }
  } catch (error) {
    Logger.log('An error occurred: ' + error.message);
    return null;
  }
}

// Returns the hour in 24-hour format (0-23)
function getCurrentHour() {
  const now = new Date();
  const hour = now.getHours(); 
  return hour;
}

// Returns the day of the week for today
function getCurrentDayOfWeek() {
  const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const today = new Date();
  const dayOfWeek = daysOfWeek[today.getDay()]; // getDay() returns 0 for Sunday, 1 for Monday, etc.
  return dayOfWeek;
}