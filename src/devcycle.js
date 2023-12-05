const clientKey = document.querySelector('[data-sdk-key]').getAttribute('data-sdk-key');

const user = {
  user_id: "anonymous_user",
};
const dvcOptions = {
  enableEdgeDB: true,
};

const devcycleClient = DevCycle.initializeDevCycle(clientKey, user, dvcOptions);

function hideExclusiveElements() {
  const elements = document.querySelectorAll("[data-type]");

  elements.forEach((element) => {
    if (element.getAttribute("data-type") === "members") {
      element.style.display = "none"; // Hide the element
    }
  });
}

function showExclusiveWidgets() {
  const elements = document.querySelectorAll("[data-type]");

  elements.forEach((element) => {
    if (element.getAttribute("data-type") === "members") {
      element.style.display = "";
    }
  });
}

function handleExclusiveUser(isExclusive) {
  if (isExclusive) {
    showExclusiveElements();
  } else {
    hideExclusiveElements();
  }
}

devcycleClient.onClientInitialized().then(() => {
  const isExclusiveUser = devcycleClient.variableValue("exclusive-content", false);
  handleExclusiveUser(isExclusiveUser);
});


netlifyIdentity.on("login", (userObj) => {
  user.user_id = userObj.email;
  devcycleClient.identifyUser(user, (err, variables) => {
    const isExclusiveUser = devcycleClient.variableValue("exclusive-content", false);
    handleExclusiveUser(isExclusiveUser);
  });
});

netlifyIdentity.on("logout", () => {
  user.user_id = "anonymous_user";
  devcycleClient.identifyUser(user, (err, variables) => {
    const isExclusiveUser = devcycleClient.variableValue("exclusive-content", false);
    handleExclusiveUser(isExclusiveUser);
  });
});