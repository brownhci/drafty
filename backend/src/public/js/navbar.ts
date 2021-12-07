const navElement = document.querySelector('nav');
function setMainPaddingTop() {
  const paddingTop = navElement.offsetHeight;
  const mainElement = document.querySelector('main');
  if (mainElement) {
    mainElement.style.paddingTop = `${paddingTop}px`;
  }
}

const navbarTogglerElement = navElement.querySelector('button.navbar-toggler');
navbarTogglerElement.addEventListener('click', function() {
  const activeClass = 'active';
  if (navbarTogglerElement.classList.contains(activeClass)) {
    // hide menu
    navbarTogglerElement.classList.remove(activeClass);
    setMainPaddingTop();
  } else {
    // show menu
    navbarTogglerElement.classList.add(activeClass);
    setMainPaddingTop();
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
