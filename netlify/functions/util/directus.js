const axios = require("axios");
const EleventyFetch = require("@11ty/eleventy-fetch");

const directusApiEndpoint = process.env.DIRECTUS_CONTENT_API_ENDPOINT;
const webhookUrl = process.env.DIRECTUS_TRIGGER_WEBHOOK_ENDPOINT;

async function sendWebhook(user) {
  try {
    const response = await axios.post(webhookUrl, { user });
    console.log("Success sending webhook request:");
  } catch (error) {
    console.error("Error sending webhook request:", error);
  }
}

async function getNews() {
  let url = directusApiEndpoint;

  try {
    // Attempt to fetch data
    let response = await EleventyFetch(url, {
      duration: "60s", // save for 60 seconds
      type: "json", // parse JSON
      directory: "/tmp/.cache/", // save to this directory
    });

    console.log("Success Fetching News!");
    return response;
  } catch (error) {
    // Handle errors gracefully
    console.error("News Fetch error:", error.message);
    // Return an empty object or some default data
    return {}; // or return some default/fallback data
  }
}

module.exports = { sendWebhook, getNews };
