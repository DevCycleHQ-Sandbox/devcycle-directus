const {
  OAuth,
  getCookie,
  generateCsrfToken,
  github,
} = require("./util/oauth2.js");

/* Do initial auth redirect */
exports.handler = async (event, context) => {
  if (!event.queryStringParameters) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        error: "No token found",
      }),
    };
  }

  const csrfToken = generateCsrfToken();
  const provider = event.queryStringParameters.provider;
  const isSignupValue = event.queryStringParameters.signUp ? "true" : "false";

  let oauth = new OAuth(provider);
  let config = oauth.config;

  let redirectUrl;

  if (event.queryStringParameters.signUp) {
    const securePath = "/";
    redirectUrl = new URL(securePath, config.secureHost).toString();
  } else {
    const securePath = event.queryStringParameters.securePath || "/";
    redirectUrl = new URL(securePath, config.secureHost).toString();
  }

  /* Generate authorizationURI */
  const authorizationURI = oauth.authorizationCode.authorizeURL({
    redirect_uri: config.redirect_uri,
    /* Specify how your app needs to access the user’s account. */
    scope: github.scope || "",
    /* State helps mitigate CSRF attacks & Restore the previous state of your app */
    state: `url=${redirectUrl}&csrf=${csrfToken}&provider=${provider}&isSignup=${isSignupValue}`,
  });

  /* Redirect user to authorizationURI */
  return {
    statusCode: 302,
    headers: {
      "Set-Cookie": getCookie("_11ty_oauth_csrf", csrfToken, 60 * 2), // 2 minutes
      Location: authorizationURI,
      "Cache-Control": "no-cache", // Disable caching of this response
    },
    body: "", // return body for local dev
  };
};
