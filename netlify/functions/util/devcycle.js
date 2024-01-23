// Import the DevCycle server SDK to interact with DevCycle's feature management platform.
const DVC = require("@devcycle/nodejs-server-sdk");

// Initialize a variable to hold the DevCycle client instance. This will be set when the runDevCycle function is called.
let devcycleClient = null;

/**
 * Initializes the DevCycle client and checks if the "early-access" feature is enabled for a given user.
 * @param {Object} authUser - The authenticated user object, expected to contain a login attribute.
 * @returns {Promise<boolean>} - A promise that resolves to the boolean value indicating whether the "early-access" feature is enabled.
 */
async function runDevCycle(authUser) {
  // Initialize the DevCycle client with your server SDK key and configuration options.
  // The SDK key is read from an environment variable for security.
  // enableCloudBucketing and enableEdgeDB are set to true for enhanced feature flag evaluation.
  devcycleClient = DVC.initializeDevCycle(process.env.DEVCYCLE_SERVER_SDK_KEY, {
    enableCloudBucketing: true,
    enableEdgeDB: true,
  });

  // Define a user object for the DevCycle SDK to identify the current user.
  // Here, the user's ID is set to the login attribute of the authUser object.
  const user = {
    user_id: `${authUser.login}`,
  };

  // Retrieve the value of the "early-access" feature flag for the defined user.
  // The third argument (false) is the default value if the flag's value can't be determined.
  const earlyAccess = await devcycleClient.variable(
    user,
    "early-access",
    false
  );

  // Return the actual value of the "early-access" feature flag for the user.
  return earlyAccess.value;
}

// Export the runDevCycle function to make it available for import in other files.
module.exports = { runDevCycle };
