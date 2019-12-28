const navbarToggler = document.querySelector("button.navbar-toggler");
navbarToggler.addEventListener("click", function() {
  const activeClass = "active";
  if (navbarToggler.classList.contains(activeClass)) {
    navbarToggler.classList.remove(activeClass);
  } else {
    navbarToggler.classList.add(activeClass);
  }
});
const navbarNavSmall = document.querySelector(".navbar-nav-sm");
navbarNavSmall.addEventListener("click", function(event) {
  const target = event.target as HTMLElement;
  const href = target.dataset.href;
  if (href) {
    window.location.href = href;
  }
});
