function runZodiaccurate() {
  // Get the current hour
  const currHour = getCurrentHour();
  console.log(`Running Zodiaccurate for hour: ${currHour}`);

  var uuid = "";
  var email = "";
  var name = "";

  // Pull UUIDs from exec_time table for the current hour
  const timezones = getTimezonesAt6AM();
  const uuidArr = getUUIDDataFromExecTimeTable(timezones) || [];
  console.log("UUID Array:", uuidArr);

   uuidArr.forEach((entry) => {
        uuid = entry.uuid;
        email = entry.email;
        name = entry.name;

        Logger.log(`Processing UUID: ${entry.uuid}`);
        Logger.log(`Name: ${entry.name}, Email: ${entry.email}, Timezone: ${entry.timezone}`);

        // Grab the zodiac data for today
        const zodiacData = getZodiacDataForToday(uuid);
        if (zodiacData) {
          Logger.log(`Zodiac data for UUID ${uuid}: ${JSON.stringify(zodiacData)}`);
          sendDailyEmailWithMailerSend(name, email, zodiacData);
        }
    });
}


