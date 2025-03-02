function removeUUIDFromFirebase(uuid) {
    
    const tables = ["responses", "trial_campaign", "users", "zodiac"];

    tables.forEach(table => {
        let tableUrl = `${FIREBASE_URL}/${table}.json?auth=${FIREBASE_API_KEY}`;

        try {
            // Fetch all data from the table
            let response = UrlFetchApp.fetch(tableUrl, { method: "get" });
            let data = JSON.parse(response.getContentText());

            if (data) {
                Object.keys(data).forEach(recordKey => {
                    if (data[recordKey].uuid === uuid) {
                        // Delete the record with the matching UUID
                        let deleteUrl = `${FIREBASE_URL}/${table}/${recordKey}.json?auth=${FIREBASE_API_KEY}`;
                        UrlFetchApp.fetch(deleteUrl, { method: "delete" });
                        Logger.log(`Deleted UUID ${uuid} from ${table}/${recordKey}`);
                    }
                });
            }
        } catch (error) {
            Logger.log(`Error processing table ${table}: ${error.message}`);
        }
    });

    Logger.log(`Finished removing UUID: ${uuid} from all tables.`);
}
