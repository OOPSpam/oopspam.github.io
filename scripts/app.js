(function () {
    let burger = document.querySelector('#navbarBurger');
    let menu = document.querySelector('#navigation-bar');
    let navbarItems = document.getElementsByClassName('navbar-item');
    let planIntervalMonthly = document.querySelector('.plan-interval .monthly');
    let planIntervalYearly = document.querySelector('.plan-interval .yearly');

    if (planIntervalMonthly != null & planIntervalYearly != null) {
    planIntervalMonthly.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      planIntervalMonthly.classList.toggle("is-warning", "is-selected");
      planIntervalYearly.classList.remove("is-warning", "is-selected", "is-bg-orange");
      updatePricing("month");
    });

    planIntervalYearly.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      planIntervalYearly.classList.toggle("is-warning", "is-selected", "is-bg-orange");
      planIntervalMonthly.classList.remove("is-warning", "is-selected");
      updatePricing("year");
    });
  }



    burger.addEventListener('click', function () {
        burger.classList.toggle('is-active');
        menu.classList.toggle('is-active');
    });

    for (let item of navbarItems) {
      item.addEventListener('click', function () {
        burger.classList.toggle('is-active');
        menu.classList.toggle('is-active');
    });
  }
})();

function updatePricing(interval) {
  if (interval === "month" & !document.querySelector('.yearly-price').classList.contains("is-hidden")) {
    document.querySelectorAll('.yearly-price').forEach( f => f.classList.toggle("is-hidden"));
    document.querySelectorAll('.monthly-price .plan-price-amount').forEach( f => f.classList.remove("has-text-grey", "has-text-strike"));
  } else if (interval === "year" & document.querySelector('.yearly-price').classList.contains("is-hidden")) {
    document.querySelectorAll('.yearly-price').forEach( f => f.classList.remove("is-hidden"));
    document.querySelectorAll('.monthly-price .plan-price-amount').forEach( f => f.classList.add("has-text-strike", "has-text-grey"));

  }
}

