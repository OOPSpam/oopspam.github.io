(function () {
    let burger = document.querySelector('#navbarBurger');
    let menu = document.querySelector('#navigation-bar');
    burger.addEventListener('click', function () {
        burger.classList.toggle('is-active');
        menu.classList.toggle('is-active');
    });

    // window.addEventListener('scroll', () => {
    //     setTimeout(()=> {
    //         //  Start of Async Drift Code
    //         "use strict";
            
    //         !function() {
    //           var t = window.driftt = window.drift = window.driftt || [];
    //           if (!t.init) {
    //             if (t.invoked) return void (window.console && console.error && console.error("Drift snippet included twice."));
    //             t.invoked = !0, t.methods = [ "identify", "config", "track", "reset", "debug", "show", "ping", "page", "hide", "off", "on" ], 
    //             t.factory = function(e) {
    //               return function() {
    //                 var n = Array.prototype.slice.call(arguments);
    //                 return n.unshift(e), t.push(n), t;
    //               };
    //             }, t.methods.forEach(function(e) {
    //               t[e] = t.factory(e);
    //             }), t.load = function(t) {
    //               var e = 3e5, n = Math.ceil(new Date() / e) * e, o = document.createElement("script");
    //               o.type = "text/javascript", o.async = !0, o.crossorigin = "anonymous", o.src = "https://js.driftt.com/include/" + n + "/" + t + ".js";
    //               var i = document.getElementsByTagName("script")[0];
    //               i.parentNode.insertBefore(o, i);
    //             };
    //           }
    //         }();
    //         drift.SNIPPET_VERSION = '0.3.1';
    //         drift.load('m57ine8eus26');
    //         // End of Async Drift Code
    //     },1000),
    //         { once: true }
    // });

    (function (i, s, o, g, r, a, m) {
        i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
          (i[r].q = i[r].q || []).push(arguments)
        }, i[r].l = 1 * new Date(); a = s.createElement(o),
          m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
      })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
      ga('create', 'UA-103050221-1', 'auto');
      ga('send', 'pageview');
})();

