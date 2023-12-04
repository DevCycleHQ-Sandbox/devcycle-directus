const EleventyFetch = require("@11ty/eleventy-fetch");

const directusApiUrl = process.env.DIRECTUS_API_URL;

module.exports = async function() {
  let url = directusApiUrl;

  try {
    // Attempt to fetch data
    let response = await EleventyFetch(url, {
      duration: "60s", // save for 60 seconds
      type: "json"    // parse JSON
    });
    return response;
  } catch (error) {
    // Handle errors gracefully
    console.error("Fetch error:", error.message);
    // Return an empty object or some default data
    return {}; // or return some default/fallback data
  }
};
