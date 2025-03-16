function doGet(e) {
  console.log("GETTING API KEY FROM APPSCRIPT");
  var apiKey = PropertiesService.getScriptProperties().getProperty("STRIPE_API_KEY");

  if (!apiKey) {
    return ContentService.createTextOutput("Error: API key not found")
      .setMimeType(ContentService.MimeType.TEXT);
  }

  var response = { stripeApiKey: apiKey };
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}