import { activeClass } from "../constants/css-classes.js";

// welcome screen
const welcomeScreenElement: HTMLElement = document.getElementById("welcome-screen");
function showWelcomeScreen() {
  welcomeScreenElement.classList.add(activeClass);
  welcomeScreenElement.setAttribute("aira-hidden", "false");
}
function hideWelcomeScreen() {
  welcomeScreenElement.classList.remove(activeClass);
  welcomeScreenElement.setAttribute("aira-hidden", "true");
}
function setWelcomeScreenCookie() {
  document.cookie = "usage-policy-accepted=true;max-age=3153600000;samesite=strict";
}
welcomeScreenElement.addEventListener("click", function(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (target.dataset.dismiss === "modal") {
    setWelcomeScreenCookie();
    hideWelcomeScreen();
  }
  event.stopPropagation();
  event.preventDefault();
}, true);

function showWelcomeScreenWhenCookieNotSet() {
  if (!document.cookie.includes("usage-policy-accepted=true")) {
    showWelcomeScreen();
  }
}

showWelcomeScreenWhenCookieNotSet();
