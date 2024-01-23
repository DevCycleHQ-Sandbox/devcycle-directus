// Import the Axios library for making HTTP requests.
const axios = require("axios");
// Import the EleventyFetch plugin from the Eleventy static site generator.
// This is used for caching and fetching data.
const EleventyFetch = require("@11ty/eleventy-fetch");
// Retrieve the Directus CMS content API endpoint from environment variables.
const directusApiEndpoint = process.env.DIRECTUS_CONTENT_API_ENDPOINT;
// Retrieve the webhook URL from environment variables, used to trigger an external service.
const webhookUrl = process.env.DIRECTUS_TRIGGER_WEBHOOK_ENDPOINT;

/**
 * Sends a webhook request to an external service with the user data.
 * @param {Object} user - The user data to send with the webhook request.
 */
async function sendWebhook(user) {
  try {
    // Use Axios to send a POST request to the webhook URL with the user data.
    const response = await axios.post(webhookUrl, { user });
    console.log("Success sending webhook request:");
  } catch (error) {
    // Log an error message if the request fails.
    console.error("Error sending webhook request:", error);
  }
}

/**
 * Fetches the latest news data from the Directus CMS content API.
 * @returns {Promise<Object>} - The news data as JSON, or an empty object on failure.
 */
async function getNews() {
  let url = directusApiEndpoint; // The URL to fetch news from, using the Directus API endpoint.
  try {
    // Use EleventyFetch to retrieve news data, with caching for 60 seconds.
    // This reduces the number of API requests by storing the results temporarily.
    let response = await EleventyFetch(url, {
      duration: "60s", // Cache the data for 60 seconds.
      type: "json", // Expect the response to be JSON.
      directory: "/tmp/.cache/", // Cache directory path.
    });
    console.log("Success Fetching News!");
    return response; // Return the fetched news data.
  } catch (error) {
    // Log an error message if fetching the news fails and return an empty object.
    console.error("News Fetch error:", error.message);
    return {}; 
  }
}

// Export the sendWebhook and getNews functions to make them available for import in other files.
module.exports = { sendWebhook, getNews };
