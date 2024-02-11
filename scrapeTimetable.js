const puppeteer = require("puppeteer");
const HtmlTableToJson = require("html-table-to-json");
require("dotenv").config();

// URLS
const ICAMPUS_HOME_URL = "https://icampus.ueab.ac.ke/";
const ICAMPUS_TIMETABLE_URL =
  "https://icampus.ueab.ac.ke/iStudent/Auth/Classes/TimeTa";
const ICAMPUS_ACCOUNT_LOCKED_URL = "https://icampus.ueab.ac.ke/Account/Lockout";

// SELECTORS
const USERNAME_SELECTOR = "#txtuser";

const PASSWORD_SELECTOR = "#mainContent_txtPassword";

const AUTHENTICATE_BUTTON_SELECTOR = "#btnAuth";

const LOGIN_BUTTON_SELECTOR = "#mainContent_LoginButton";

const LOGOUT_BUTTON_SELECTOR = "#ucHeader_hyLog";

const ERROR_MESSAGE_SELECTOR = "#inform_lblMessage";

const INVALID_LOGIN_ERROR_SELECTOR =
  "#form1 > div:nth-child(8) > table > tbody > tr > td > table > tbody > tr:nth-child(5) > td";

const LOCKED_OUT_SELECTOR = `form[action='./Lockout']`;

//CONSTANTS
const USER_NOT_EXIST_ERROR_MESSAGE = "User ID Does Not Exist";
const INVALID_LOGIN_ERROR_MESSAGE = "Invalid login attempt";
const CANT_VERIFY_USERNAME_ERROR_MESSAGE =
  "User name or password could not be verified";

async function scrapeTimetable(username, password) {
  const browserLaunchStartTime = Date.now();
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });
  const browserLaunchEndTime = Date.now();

  const loginStartTime = Date.now();
  const page = await browser.newPage();

  await page.goto(ICAMPUS_HOME_URL);

  await page.type(USERNAME_SELECTOR, username);
  await page.click(AUTHENTICATE_BUTTON_SELECTOR);

  // handle user does not exist here, done!
  const errorMessage = await page.evaluate((ERROR_MESSAGE_SELECTOR) => {
    return document.querySelector(ERROR_MESSAGE_SELECTOR)?.innerText;
  }, ERROR_MESSAGE_SELECTOR);

  console.log("Error message: ", errorMessage);

  if (errorMessage) {
    await browser.close();
    return {
      error: {
        code: errorMessage === USER_NOT_EXIST_ERROR_MESSAGE ? 404 : 500,
        exists: true,
        message: errorMessage,
        possible_cause:
          "The username you entered does not exist or is incorrect.",
      },
    };
  }

  const lockedOut = await page.evaluate((LOCKED_OUT_SELECTOR) => {
    return document.querySelector(LOCKED_OUT_SELECTOR)?.innerText;
  }, LOCKED_OUT_SELECTOR);

  console.log("Locked out: ", lockedOut);
  const currentUrl = page.url();
  console.log("Current URL: ", currentUrl);

  // Check if the account is locked

  //   await page.waitForNavigation();
  await page.waitForSelector(PASSWORD_SELECTOR);
  await page.type(PASSWORD_SELECTOR, password);
  await page.click(LOGIN_BUTTON_SELECTOR);

  // await page.waitForSelector(INVALID_LOGIN_ERROR_SELECTOR);
  await page.waitForNetworkIdle();

  //   TODO: handle wrong password here
  const invalidLoginError = await page.evaluate(
    (INVALID_LOGIN_ERROR_SELECTOR) => {
      return document.querySelector(INVALID_LOGIN_ERROR_SELECTOR)?.innerText;
    },
    INVALID_LOGIN_ERROR_SELECTOR
  );

  console.log("Invalid login error: ", invalidLoginError);
  if (invalidLoginError) {
    await browser.close();
    return {
      error: {
        code: invalidLoginError
          .trim()
          .includes(INVALID_LOGIN_ERROR_MESSAGE.trim())
          ? 401
          : invalidLoginError
              .trim()
              .includes(CANT_VERIFY_USERNAME_ERROR_MESSAGE.trim())
          ? 401
          : 500,
        exists: true,
        message: invalidLoginError.replace("Go Home", ""),
        possible_cause: invalidLoginError
          .trim()
          .includes(INVALID_LOGIN_ERROR_MESSAGE.trim())
          ? "The password you entered is incorrect."
          : invalidLoginError
              .trim()
              .includes(CANT_VERIFY_USERNAME_ERROR_MESSAGE.trim())
          ? "You tried too many times."
          : "The server might be experiencing some issues.",
      },
    };
  }

  // await page.waitForSelector(LOGOUT_BUTTON_SELECTOR); //This is to confirm that the user has logged in successfully
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
  console.log("All tables: ", allTables.results.length);

  //noticed the last table is the actual timetable
  const timetable = allTables.results[allTables.results.length - 1];

  //   console.log(JSON.stringify(timetable, null, 2));

  // Verify the shape of the timetable
  const isTimetableValid = timetable.every(verifyCourseShape);

  console.log("Is timetable valid: ", isTimetableValid);

  if (!isTimetableValid) {
    return {
      error: {
        exists: true,
        code: 500,
        message: "The timetable could not be scraped.",
        possible_cause:
          "Incorrect password or the server might be experiencing some issues.",
      },
    };
  }

  const result = {
    timetable,
    time_taken: {
      browser_launch: browserLaunchEndTime - browserLaunchStartTime,
      login: loginEndTime - loginStartTime,
      fetch_timetable: fetchTimetableEndTime - fetchTimetableStartTime,
    },
    error: {
      exists: false,
    },
  };

  //   console.log(JSON.stringify(result, null, 2));

  //CLOSE BROWSER
  await browser.close();

  return result;
}

function verifyCourseShape(course) {
  // Define the expected shape
  const expectedShape = {
    "SR. No": "string",
    "Course Code": "string",
    "Course Title": "string",
    Credit: "string", // You can change this to "number" if Credit should be a number
    Lecturer: "string",
    Room: "string",
    Days: "string",
    Start: "string", // You can change this to "number" if Start should be a number
    End: "string", // You can change this to "number" if End should be a number
  };

  // Check if all keys in expectedShape are present in obj
  for (let key in expectedShape) {
    if (!(key in course)) {
      return false;
    }
  }

  // Check if the types of values match the expected types
  for (let key in expectedShape) {
    if (typeof course[key] !== expectedShape[key]) {
      return false;
    }
  }

  // If all checks pass, return true
  return true;
}

module.exports = scrapeTimetable;
