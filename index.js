const express = require("express");
const scrapeTimetable = require("./scrapeTimetable");
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("iCampus timetable scraper API is running...");
});

app.post("/api/scrape_timetable", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("Username and password are required");
  }

  // Scrape the timetable here
  const timetable = await scrapeTimetable(username, password);

  res.send(timetable);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
