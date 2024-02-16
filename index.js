const express = require("express");
const scrapeTimetable = require("./scrapeTimetable");
const cors = require("cors");
const errorMessages = require("./errorMessages");
const app = express();
app.use(express.json());

app.use(cors());
const PORT = process.env.PORT || 4000;

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
    const result = await scrapeTimetable(username, password);

    res.status(result?.error?.code || 200).send(result);
  } catch (error) {
    console.error(error);
    //TODO: fix how this error handling is done
    return res.status(500).send({
      error: {
        exists: true,
        code: 500,
        message:
          "An error occurred while trying to scrape the timetable." +
          error?.message,
        possible_cause: "The server might be experiencing some issues.",
      },
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
