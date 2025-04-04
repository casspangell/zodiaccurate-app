function testCheckForTrial() {
  setupTrialSystem("casspangell@gmail.com", "cass");
}

function setupTrialSystem(email, name, uuid) {
  console.log("Checking user trial status");
    // Check if the user already exists in the trial table
    const trialDate = getUserDataFromTrialUserTableFirebase(email);
    let emailMessage = "Trial has expired";

    if (trialDate != false) {
      const today = new Date();
      const trialEndDate = new Date(trialDate);

      // Check if the trial has not expired
      if (trialEndDate > today) {
        // Calculate the number of days left in the trial
        const daysLeft = Math.ceil((trialEndDate - today) / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
        emailMessage = `You have ${daysLeft} days left in your trial.`;
      }

      console.log(emailMessage);
      return true;

    } else if (trialDate === false) {
      console.log("User not found in database");

      return false;

    } else {
      console.log(emailMessage);
      return null;
    }
}

/**
 * Function to run daily that expires trials and emails the report
 * This will be called by the time-based trigger
 */
function runWeeklyTrialExpiration() {
  const results = expireTrialUsers();
  emailTrialExpirationReport(ADMIN_EMAIL, results);
}