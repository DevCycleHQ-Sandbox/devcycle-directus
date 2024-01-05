// To use the DevCycle Server SDK in your project, require the NodeJS Server SDK
const DVC = require("@devcycle/nodejs-server-sdk");

let devcycleClient = null;

async function runDevCycle(authUser) {
  devcycleClient = DVC.initializeDevCycle(process.env.DEVCYCLE_SERVER_SDK_KEY, {
    enableCloudBucketing: true,
    enableEdgeDB: true,
  });

  const user = {
    user_id: `${authUser.login}`,
  };

  const earlyAccess = await devcycleClient.variable(
    user,
    "early-access",
    false
  );

  return earlyAccess.value;
}

// Make example executable
module.exports = { runDevCycle };
