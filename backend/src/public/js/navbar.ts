const navElement = document.querySelector('nav');

const navbarTogglerElement = navElement.querySelector('button.navbar-toggler');
navbarTogglerElement.addEventListener('click', function() {
  const activeClass = 'active';
  if (navbarTogglerElement.classList.contains(activeClass)) {
    // hide menu
    navbarTogglerElement.classList.remove(activeClass);
  } else {
    // show menu
    navbarTogglerElement.classList.add(activeClass);
  }
});
const NavbarNavSmallElement = navElement.querySelector('.navbar-nav-sm');
NavbarNavSmallElement.addEventListener('click', function(event) {
  const target = event.target as HTMLElement;
  const href = target.dataset.href;
  if (href) {
    window.location.href = href;
  }
});
