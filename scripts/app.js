(function() {
    // var burger = document.querySelector('.nav-toggle');
    let burger = document.querySelector('#navbarBurger');
    var menu = document.querySelector('#navigation-bar');
    burger.addEventListener('click', function() {
        burger.classList.toggle('is-active');
        menu.classList.toggle('is-active');
    });
})();

