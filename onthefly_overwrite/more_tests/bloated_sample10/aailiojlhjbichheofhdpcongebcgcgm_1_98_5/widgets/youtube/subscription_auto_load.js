(function () {
    'use strict';

    var widget = {
        name: 'Subscriptions auto load',

        start: function () {
            if (data.page !== 'feed' || location.pathname.split('/')[2] !== 'subscriptions') return;

            var timer = null;

            window.addEventListener('scroll', function () {
                clearTimeout(timer);
                timer = setTimeout(function() {
                    if (window.pageYOffset + window.innerHeight > util.$('#content').clientHeight) {
                        util.$('.yt-uix-load-more')[0].click();
                    }
                }, 300);
            });
        }
    };

    // widgets.push(widget);
})();
