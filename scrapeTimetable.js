const puppeteer = require("puppeteer");
const HtmlTableToJson = require("html-table-to-json");

// URLS
const ICAMPUS_HOME_URL = "https://icampus.ueab.ac.ke/";
const ICAMPUS_TIMETABLE_URL =
  "https://icampus.ueab.ac.ke/iStudent/Auth/Classes/TimeTa";

// SELECTORS
const USERNAME_SELECTOR = "#txtuser";

const PASSWORD_SELECTOR = "#mainContent_txtPassword";

const AUTHENTICATE_BUTTON_SELECTOR = "#btnAuth";

const LOGIN_BUTTON_SELECTOR = "#mainContent_LoginButton";

const LOGOUT_BUTTON_SELECTOR = "#ucHeader_hyLog";

async function scrapeTimetable(username, password) {
  const browserLaunchStartTime = Date.now();
  const browser = await puppeteer.launch({ headless: true });
  const browserLaunchEndTime = Date.now();

  const loginStartTime = Date.now();
  const page = await browser.newPage();

  await page.goto(ICAMPUS_HOME_URL);

  await page.type(USERNAME_SELECTOR, username);
  await page.click(AUTHENTICATE_BUTTON_SELECTOR);

  //TODO: handle user does not exist here

  //   await page.waitForNavigation();
  await page.waitForSelector(PASSWORD_SELECTOR);
  await page.type(PASSWORD_SELECTOR, password);
  await page.click(LOGIN_BUTTON_SELECTOR);

  //   TODO: handle wrong password here

  await page.waitForSelector(LOGOUT_BUTTON_SELECTOR); //This is to confirm that the user has logged in successfully
  const loginEndTime = Date.now();
  console.log("Logged in successfully");

  const fetchTimetableStartTime = Date.now();
  const timetablePageHtml = await page.evaluate(
    async (ICAMPUS_TIMETABLE_URL) => {
      const response = await fetch(ICAMPUS_TIMETABLE_URL);

      return response.text();
    },
    ICAMPUS_TIMETABLE_URL
  );
  const fetchTimetableEndTime = Date.now();

  const allTables = HtmlTableToJson.parse(timetablePageHtml);

  //noticed the last table is the actual timetable
  const timetable = allTables.results[allTables.results.length - 1];

  //   console.log(JSON.stringify(timetable, null, 2));

  const result = {
    timetable,
    time_taken: {
      browser_launch: browserLaunchEndTime - browserLaunchStartTime,
      login: loginEndTime - loginStartTime,
      fetch_timetable: fetchTimetableEndTime - fetchTimetableStartTime,
    },
  };

  //   console.log(JSON.stringify(result, null, 2));

  //CLOSE BROWSER
  await browser.close();

  return result;
}

module.exports = scrapeTimetable;
