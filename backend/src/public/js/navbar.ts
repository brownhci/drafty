const navbarToggler = document.querySelector("button.navbar-toggler");
navbarToggler.addEventListener("click", function(event) {
  const activeClass = "active";
  if (navbarToggler.classList.contains(activeClass)) {
    navbarToggler.classList.remove(activeClass);
  } else {
    navbarToggler.classList.add(activeClass);
  }
});
