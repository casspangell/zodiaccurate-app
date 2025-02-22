const express = require("express");
const { Logging } = require("@google-cloud/logging");
const cors = require("cors");

const app = express();
const logging = new Logging({ projectId: "zodiaccurate-e9aaf" });

// Enable CORS for frontend requests
app.use(cors({ origin: true }));

app.get("/", async (req, res) => {
    try {
        const logName = `projects/zodiaccurate-e9aaf/logs/cloudfunctions.googleapis.com`;
        const log = logging.log(logName);

        const [entries] = await log.getEntries({
            filter: "severity >= ERROR",
            orderBy: "timestamp desc",
            pageSize: 10,
        });

        let logs = entries.map((entry) => ({
            timestamp: entry.timestamp,
            message: entry.data?.message || JSON.stringify(entry.data),
            source: entry.resource?.labels?.function_name || "Unknown Source",
        }));

        res.status(200).json(logs);
    } catch (error) {
        console.error("Error fetching logs:", error);
        res.status(500).json({ error: "Failed to retrieve logs." });
    }
});

// Cloud Run requires listening on PORT 8080
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
