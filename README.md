# iCampus UEAB Timetable Scraper API

This API allows users to scrape their class timetable from the iCampus UEAB website. It accepts POST requests to `/api/scrape_timetable` with JSON containing the user's iCampus UEAB credentials:

```json
{
  "username": "your_username",
  "password": "your_password"
}
```

The API will respond with the scraped timetable data in JSON format along with information on the time taken for various operations:

```json
{
  "timetable": [
    {
      "SR. No": "1",
      "Course Code": "COSC241",
      "Course Title": "Software Architecture and Design",
      "Credit": "3",
      "Lecturer": "Mr. MBATA KEVIN MAYAKA",
      "Room": "L105A (Computer Lab A) - Library",
      "Days": "tue,thu",
      "Start": "06:30",
      "End": "08:00"
    },
    {
      "SR. No": "2",
      "Course Code": "COSC272",
      "Course Title": "OBJECT ORIENTED DESIGN AND PROGRAMMING",
      "Credit": "3",
      "Lecturer": "Mr. MBATA KEVIN MAYAKA",
      "Room": "Humanities Lab - Humanities",
      "Days": "mon,wed",
      "Start": "06:30",
      "End": "08:00"
    },
    // More timetable entries...
  ],
  "time_taken": {
    "browser_launch": 1058,
    "login": 3884,
    "fetch_timetable": 1164
  }
}
```

## How to Use

1. Clone this repository.
2. Install dependencies by running `npm install`.
3. Run the application with `node index.js`.
4. Send a POST request to `/api/scrape_timetable` with your iCampus UEAB credentials as outlined above.

## Technologies Used

- Puppeteer
- Express.js

