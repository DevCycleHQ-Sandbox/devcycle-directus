const cookie = require("cookie");
const { EleventyServerless } = require("@11ty/eleventy");
const { OAuth, tokens, getCookie } = require("../util/oauth2.js");
const { runDevCycle } = require("../util/devcycle.js");
const { getNews } = require("../util/directus.js");

require("./eleventy-bundler-modules.js");

async function handler(event) {
  let authToken;
  let provider;

  if (event.headers && event.headers.cookie) {
    let cookies = cookie.parse(event.headers.cookie);
    if (cookies._11ty_oauth_token) {
      authToken = tokens.decode(cookies._11ty_oauth_token);
    }
    if (cookies._11ty_oauth_provider) {
      provider = cookies._11ty_oauth_provider;
    }
  }
  let user;
  let authError;
  try {
    let oauth = new OAuth(provider);
    user = await oauth.getUser(authToken);
  } catch (e) {
    authError = e;
  }

  let earlyAccess;

  try {
    earlyAccess = await runDevCycle(user);
    console.log("Signed up for early access?", earlyAccess);
  } catch (e) {
    console.log("Early Access Check Error", e);
  }

  let news;

  try {
    news = await getNews();
  } catch (e) {
    console.log("Get News Error", e);
  }

  let elev = new EleventyServerless("dynamic", {
    path: event.path,
    query: event.queryStringParameters,
    functionsDir: "./netlify/functions/",
    config: function (eleventyConfig) {
      if (user) {
        eleventyConfig.addGlobalData("user", user);
      }
      if (news) {
        eleventyConfig.addGlobalData("news", news);
      }
      // Adds `secure` data to JSON output
      eleventyConfig.dataFilterSelectors.add("secure");
    },
  });

  try {
    let [page] = await elev.getOutput();

    if ("logout" in event.queryStringParameters) {
      let redirectTarget = page.url; // default redirect to self
      if (page.data.secure && page.data.secure.unauthenticatedRedirect) {
        redirectTarget = page.data.secure.unauthenticatedRedirect;
      }

      console.log("Logging out");
      return {
        statusCode: 302,
        headers: {
          Location: redirectTarget,
          "Cache-Control": "no-cache", // Disable caching of this response
        },
        multiValueHeaders: {
          "Set-Cookie": [
            getCookie("_11ty_oauth_token", "", -1),
            getCookie("_11ty_oauth_provider", "", -1),
          ],
        },
        body: "",
      };
    } else if (earlyAccess == false && page.data.secure) {
      // Define the base URL for unauthenticated redirect
      let redirectUrl = "/";

      // unauthenticated redirect with parameter
      return {
        statusCode: 302,
        headers: {
          Location: redirectUrl,
          "Set-Cookie": `flashMessage=accessRestricted; Max-Age=300; Path=/;`, // Expires in 5 minutes
          "Cache-Control": "no-cache", // Disable caching of this response
        },
        body: "Redirecting...",
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/html; charset=UTF-8",
      },
      body: page.content,
    };
  } catch (error) {
    // Only console log for matching serverless paths
    // (otherwise you’ll see a bunch of BrowserSync 404s for non-dynamic URLs during --serve)
    if (elev.isServerlessUrl(event.path)) {
      console.log("Serverless Error:", error);
    }

    return {
      statusCode: error.httpStatusCode || 500,
      body: JSON.stringify(
        {
          error: error.message,
        },
        null,
        2
      ),
    };
  }
}

exports.handler = handler;
