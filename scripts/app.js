(function() {
    let burger = document.querySelector('#navbarBurger');
    let menu = document.querySelector('#navigation-bar');
    burger.addEventListener('click', function() {
        burger.classList.toggle('is-active');
        menu.classList.toggle('is-active');
    });
})();

