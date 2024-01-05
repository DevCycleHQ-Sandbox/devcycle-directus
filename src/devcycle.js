document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const signupSuccess = urlParams.get("signupSuccess");
  if (signupSuccess) {
    document.getElementById("signup-message").style.display = "block";
  }
});
