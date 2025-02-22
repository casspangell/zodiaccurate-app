// Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Function to save form data to Firebase
async function saveFormDataToFirebase(formData) {
    try {
        const userRef = db.ref("users").push(); // Generate a unique ID
        await userRef.set(formData);
        console.log("✅ Data successfully saved to Firebase:", formData);
        alert("✅ Form submitted successfully!");
    } catch (error) {
        console.error("❌ Error saving data:", error);
    }
}
