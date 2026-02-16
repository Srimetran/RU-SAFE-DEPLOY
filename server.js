const express = require("express");
const app = express();

app.use(express.static("public"));

const SHEETS_API_KEY = process.env.SHEETS_API_KEY;
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const RANGE = process.env.SHEETS_RANGE || "outputdata!A:Z";

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
