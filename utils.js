const ownerUsername = "gerison376";

async function saveCookies(username, cookies) {
  const url = `https://jsonbin.org/${ownerUsername}/icampus-cookies/${username}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `token ${process.env.JSONBIN_API_KEY}`,
    },
    body: JSON.stringify({ cookies }),
  });

  const resJson = await res.json();

  console.log("jsonbin response", resJson);

  return resJson;
}

async function retrieveCookies(username) {
  const url = `https://jsonbin.org/${ownerUsername}/icampus-cookies/${username}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `token ${process.env.JSONBIN_API_KEY}`,
    },
  });

  const resJson = await res.json();

  console.log("jsonbin response retrieving", resJson);

  return resJson.cookies;
}

async function deleteCookies(username) {
  const url = `https://jsonbin.org/${ownerUsername}/icampus-cookies/${username}`;

  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `token ${process.env.JSONBIN_API_KEY}`,
    },
  });

  const resJson = await res.json();

  console.log("jsonbin response deleting", resJson);

  return resJson;
}

module.exports = {
  saveCookies,
  retrieveCookies,
  deleteCookies,
};
