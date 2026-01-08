/**
 * Test functions for simulating HTML form submissions.
 * These functions mimic the behavior of the web form without actually submitting through HTTP.
 */

/**
 * Test function that mimics an HTML form submission with full user data (partner + child).
 * Uses TEST_USER_DATA from Constants.js.
 *
 * @returns {void}
 */
function testHTMLFormSubmission() {
  Logger.log("🚀 Starting HTML Form Submission Test (Full Data)...");
  
  try {
    // Generate a unique UUID for this test submission
    const testUUID = Utilities.getUuid();
    Logger.log(`📋 Generated Test UUID: ${testUUID}`);
    
    // Create the payload structure that mimics HTML form POST request
    const mockFormData = {
      formData: {
        ...TEST_USER_DATA,
        uuid: testUUID,
        location: TEST_USER_DATA.current_location || "Australia Brisbane"
      },
      source: "intakeForm",
      uuid: testUUID,
      email: TEST_USER_DATA.email,
      name: TEST_USER_DATA.name
    };
    
    Logger.log("📦 Mock Form Data Created:");
    Logger.log(JSON.stringify(mockFormData, null, 2));
    
    // Call the form submission handler directly
    const result = onWebFormSubmitHandler(mockFormData);
    
    Logger.log("✅ Test Form Submission Complete");
    Logger.log(`📄 Result: ${result}`);
    
    return testUUID;
    
  } catch (error) {
    Logger.log(`❌ Error in test form submission: ${error.message}`);
    Logger.log(error.stack);
    throw error;
  }
}

/**
 * Test function that mimics an HTML form submission without partner or child data.
 * Uses TEST_USER_DATA_NO_CHILD_NO_PARTNER from Constants.js.
 *
 * @returns {string} - Returns the UUID of the test submission.
 */
function testHTMLFormSubmissionNoPartnerNoChild() {
  Logger.log("🚀 Starting HTML Form Submission Test (No Partner/Child)...");
  
  try {
    // Generate a unique UUID for this test submission
    const testUUID = Utilities.getUuid();
    Logger.log(`📋 Generated Test UUID: ${testUUID}`);
    
    // Create the payload structure that mimics HTML form POST request
    const mockFormData = {
      formData: {
        ...TEST_USER_DATA_NO_CHILD_NO_PARTNER,
        uuid: testUUID,
        location: TEST_USER_DATA_NO_CHILD_NO_PARTNER.current_location || "Australia Brisbane"
      },
      source: "intakeForm",
      uuid: testUUID,
      email: TEST_USER_DATA_NO_CHILD_NO_PARTNER.email,
      name: TEST_USER_DATA_NO_CHILD_NO_PARTNER.name
    };
    
    Logger.log("📦 Mock Form Data Created:");
    Logger.log(JSON.stringify(mockFormData, null, 2));
    
    // Call the form submission handler directly
    const result = onWebFormSubmitHandler(mockFormData);
    
    Logger.log("✅ Test Form Submission Complete");
    Logger.log(`📄 Result: ${result}`);
    
    return testUUID;
    
  } catch (error) {
    Logger.log(`❌ Error in test form submission: ${error.message}`);
    Logger.log(error.stack);
    throw error;
  }
}

/**
 * Test function that mimics an HTML form submission using existing TEST_FORM_DATA constant.
 * This uses the pre-defined JSON string from Constants.js.
 *
 * @returns {string} - Returns the UUID of the test submission.
 */
function testHTMLFormSubmissionFromConstant() {
  Logger.log("🚀 Starting HTML Form Submission Test (From TEST_FORM_DATA)...");
  
  try {
    // Parse the TEST_FORM_DATA string
    const parsedData = JSON.parse(TEST_FORM_DATA);
    
    // Generate new UUID to avoid conflicts
    const testUUID = Utilities.getUuid();
    Logger.log(`📋 Generated Test UUID: ${testUUID}`);
    
    // Update the UUID in the parsed data
    parsedData.uuid = testUUID;
    parsedData.formData.uuid = testUUID;
    parsedData.formData.submissionId = testUUID;
    
    Logger.log("📦 Mock Form Data Created:");
    Logger.log(JSON.stringify(parsedData, null, 2));
    
    // Call the form submission handler directly
    const result = onWebFormSubmitHandler(parsedData);
    
    Logger.log("✅ Test Form Submission Complete");
    Logger.log(`📄 Result: ${result}`);
    
    return testUUID;
    
  } catch (error) {
    Logger.log(`❌ Error in test form submission: ${error.message}`);
    Logger.log(error.stack);
    throw error;
  }
}

/**
 * Test function that mimics an HTML form submission with custom data.
 * Allows you to pass in your own form data for testing.
 *
 * @param {Object} customFormData - Custom form data object to submit.
 * @param {string} customFormData.name - User's name (required).
 * @param {string} customFormData.email - User's email (required).
 * @param {string} customFormData.location - User's location (optional).
 * @returns {string} - Returns the UUID of the test submission.
 */
function testHTMLFormSubmissionWithCustomData(customFormData) {
  Logger.log("🚀 Starting HTML Form Submission Test (Custom Data)...");
  
  try {
    // Validate required fields
    if (!customFormData.name || !customFormData.email) {
      throw new Error("Custom form data must include 'name' and 'email' fields");
    }
    
    // Generate a unique UUID for this test submission
    const testUUID = Utilities.getUuid();
    Logger.log(`📋 Generated Test UUID: ${testUUID}`);
    
    // Create the payload structure that mimics HTML form POST request
    const mockFormData = {
      formData: {
        ...customFormData,
        uuid: testUUID
      },
      source: "intakeForm",
      uuid: testUUID,
      email: customFormData.email,
      name: customFormData.name
    };
    
    Logger.log("📦 Mock Form Data Created:");
    Logger.log(JSON.stringify(mockFormData, null, 2));
    
    // Call the form submission handler directly
    const result = onWebFormSubmitHandler(mockFormData);
    
    Logger.log("✅ Test Form Submission Complete");
    Logger.log(`📄 Result: ${result}`);
    
    return testUUID;
    
  } catch (error) {
    Logger.log(`❌ Error in test form submission: ${error.message}`);
    Logger.log(error.stack);
    throw error;
  }
}

/**
 * Test function that simulates the full doPost flow including JSON parsing.
 * This mimics exactly what happens when the web app receives a POST request.
 *
 * @param {Object} [customData=null] - Optional custom data to use, defaults to TEST_USER_DATA.
 * @returns {Object} - Returns the ContentService response object.
 */
function testFullDoPostFlow(customData = null) {
  Logger.log("🚀 Starting Full doPost Flow Test...");
  
  try {
    // Use custom data if provided, otherwise use TEST_USER_DATA
    const userData = customData || TEST_USER_DATA;
    const testUUID = Utilities.getUuid();
    
    Logger.log(`📋 Generated Test UUID: ${testUUID}`);
    
    // Create the complete POST payload
    const postPayload = {
      formData: {
        ...userData,
        uuid: testUUID,
        location: userData.current_location || userData.location || "Australia Brisbane"
      },
      source: "intakeForm",
      uuid: testUUID,
      email: userData.email,
      name: userData.name
    };
    
    // Convert to JSON string (mimicking HTTP POST body)
    const jsonString = JSON.stringify(postPayload);
    Logger.log("📤 JSON Payload String:");
    Logger.log(jsonString);
    
    // Create mock event object that mimics Apps Script's doPost event
    const mockEvent = {
      postData: {
        contents: jsonString,
        type: "application/json"
      }
    };
    
    // Call doPost directly with the mock event
    Logger.log("📬 Calling doPost handler...");
    const response = doPost(mockEvent);
    
    Logger.log("✅ Full doPost Flow Test Complete");
    Logger.log(`📄 Response: ${response.getContent()}`);
    
    return {
      uuid: testUUID,
      response: response.getContent()
    };
    
  } catch (error) {
    Logger.log(`❌ Error in full doPost flow test: ${error.message}`);
    Logger.log(error.stack);
    throw error;
  }
}

/**
 * Helper function to verify a test submission was saved correctly in Firebase.
 * Call this after running a test to verify the data was saved.
 *
 * @param {string} uuid - The UUID of the test submission to verify.
 * @returns {boolean} - Returns true if the user exists in Firebase, false otherwise.
 */
function verifyTestSubmission(uuid) {
  Logger.log(`🔍 Verifying test submission for UUID: ${uuid}`);
  
  try {
    // Check if user exists in Firebase
    const userExists = doesUserExist(uuid);
    
    if (userExists) {
      Logger.log("✅ Test submission verified - User exists in Firebase");
      
      // Try to retrieve the user data
      const userData = getUserDataFromFirebase(uuid);
      if (userData) {
        Logger.log("📊 Retrieved User Data:");
        Logger.log(JSON.stringify(userData, null, 2));
        return true;
      }
    } else {
      Logger.log("❌ Test submission not found in Firebase");
      return false;
    }
    
  } catch (error) {
    Logger.log(`❌ Error verifying test submission: ${error.message}`);
    return false;
  }
}

/**
 * Comprehensive test runner that runs all test scenarios.
 * Use this to test all form submission variations at once.
 *
 * @returns {Object} - Returns an object with all test UUIDs for verification.
 */
function runAllFormTests() {
  Logger.log("🧪 ========================================");
  Logger.log("🧪 Running All Form Submission Tests");
  Logger.log("🧪 ========================================");
  
  const results = {
    fullData: null,
    noPartnerNoChild: null,
    fromConstant: null,
    fullDoPost: null
  };
  
  try {
    // Test 1: Full user data
    Logger.log("\n📋 TEST 1: Full User Data (Partner + Child)");
    Logger.log("------------------------------------------");
    results.fullData = testHTMLFormSubmission();
    
    // Wait a bit between tests
    Utilities.sleep(2000);
    
    // Test 2: No partner/child data
    Logger.log("\n📋 TEST 2: No Partner/Child Data");
    Logger.log("------------------------------------------");
    results.noPartnerNoChild = testHTMLFormSubmissionNoPartnerNoChild();
    
    // Wait a bit between tests
    Utilities.sleep(2000);
    
    // Test 3: From constant
    Logger.log("\n📋 TEST 3: Using TEST_FORM_DATA Constant");
    Logger.log("------------------------------------------");
    results.fromConstant = testHTMLFormSubmissionFromConstant();
    
    // Wait a bit between tests
    Utilities.sleep(2000);
    
    // Test 4: Full doPost flow
    Logger.log("\n📋 TEST 4: Full doPost Flow");
    Logger.log("------------------------------------------");
    const doPostResult = testFullDoPostFlow();
    results.fullDoPost = doPostResult.uuid;
    
    Logger.log("\n🎉 ========================================");
    Logger.log("🎉 All Tests Completed!");
    Logger.log("🎉 ========================================");
    Logger.log("\n📝 Test Results Summary:");
    Logger.log(`  - Full Data UUID: ${results.fullData}`);
    Logger.log(`  - No Partner/Child UUID: ${results.noPartnerNoChild}`);
    Logger.log(`  - From Constant UUID: ${results.fromConstant}`);
    Logger.log(`  - Full doPost UUID: ${results.fullDoPost}`);
    Logger.log("\n💡 Use verifyTestSubmission(uuid) to check if data was saved correctly");
    
    return results;
    
  } catch (error) {
    Logger.log(`\n❌ Test suite failed: ${error.message}`);
    Logger.log(error.stack);
    return results;
  }
}

