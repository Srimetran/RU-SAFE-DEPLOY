const express = require("express");

// Only load .env locally (Railway provides env vars automatically)
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const app = express();

const SHEETS_API_KEY = process.env.SHEETS_API_KEY;
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const RANGE = process.env.SHEETS_RANGE || "outputdata!A:Z";

// Serve your frontend
app.use(express.static("public"));

// Health check (so you can hit / and see it’s alive)
app.get("/health", (req, res) => res.send("ok"));

app.get("/api/incidents", async (req, res) => {
  try {
    if (!SHEETS_API_KEY || !SPREADSHEET_ID) {
      return res.status(500).json({ error: "Missing env vars" });
    }

    const url =
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/` +
      `${encodeURIComponent(RANGE)}?key=${encodeURIComponent(SHEETS_API_KEY)}`;

    const response = await fetch(url);
    const text = await response.text();

    if (!response.ok) return res.status(response.status).send(text);

    res.setHeader("Content-Type", "application/json");
    res.send(text);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Proxy failed" });
  }
});

// IMPORTANT: Railway uses PORT env var
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server listening on", PORT);
});
