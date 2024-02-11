const express = require("express");
const scrapeTimetable = require("./scrapeTimetable");
const errorMessages = require("./errorMessages");
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("iCampus timetable scraper API is running...");
});

app.post("/api/scrape_timetable", async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).send(errorMessages.noUsernameOrPassword);
  }

  // Scrape the timetable here
  try {
    const timetable = await scrapeTimetable(username, password);

    res.send(timetable);
  } catch (error) {
    //TODO: fix how this error handling is done
    return res.status(500).send(error.message || errorMessages.serverError);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
