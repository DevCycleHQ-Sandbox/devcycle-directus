const EleventyFetch = require("@11ty/eleventy-fetch");

const directusApiUrl = process.env.DIRECTUS_API_URL;

module.exports = async function() {
  let url = directusApiUrl;

  /* This returns a promise */
  return EleventyFetch(url, {
    duration: "60s", // save for 60 seconds
    type: "json"    // we’ll parse JSON for you
  });
};