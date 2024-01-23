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

  // Declare a variable to store the early access status.
  let earlyAccess;

  try {
    // Attempt to run the runDevCycle function with the user object.
    // This function checks if the user is signed up for early access by interacting
    // with the DevCycle feature management platform.
    earlyAccess = await runDevCycle(user);

    // Log the result to the console. If earlyAccess is true, it means the user
    // has access to early features. Otherwise, they do not.
    console.log("Signed up for early access?", earlyAccess);
  } catch (e) {
    // If there's an error during the check (e.g., network issues, incorrect setup),
    // log the error message to the console. This helps in diagnosing what went wrong.
    console.log("Early Access Check Error", e);
  }
  // Declare a variable to hold the fetched news data.
  let news;

  try {
    // Attempt to fetch news data using the getNews function.
    // This function is designed to retrieve news from a specified source,
    // such as an API endpoint defined in the getNews function.
    // The await keyword is used to wait for the asynchronous operation to complete,
    // meaning the next line of code won't execute until getNews has returned a result.
    news = await getNews();
    // If successful, the news variable will contain the fetched news data.
  } catch (e) {
    // If an error occurs during the fetching process, it is caught here.
    // This could be due to network issues, the endpoint not responding,
    // or any other error thrown by the getNews function.
    // The error is logged to the console to help with debugging.
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
      // Define the URL to redirect users without early access.
      let redirectUrl = "/";
      // Return a response object to redirect the user to the homepage.
      // This uses a 302 status code, which indicates a temporary redirect.
      return {
        statusCode: 302, // HTTP status code for temporary redirect.
        headers: {
          Location: redirectUrl, // URL to redirect the user to.
          // Set a cookie to display a flash message about access restriction.
          // The cookie expires in 300 seconds (5 minutes) and is available site-wide.
          "Set-Cookie": `flashMessage=accessRestricted; Max-Age=300; Path=/;`,
          "Cache-Control": "no-cache", // Ensures the redirect response is not cached by the browser.
        },
        body: "Redirecting...", // Message displayed during the redirection process.
      };
    }
    // If the user has access or the page is not secure, return the page content.
    return {
      statusCode: 200, // HTTP status code for OK.
      headers: {
        "Content-Type": "text/html; charset=UTF-8", // Specify the content type of the response.
      },
      body: page.content, // The HTML content of the page to be displayed.
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
