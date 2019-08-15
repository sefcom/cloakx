(function () {
    'use strict';

    var widget = {
        name: 'user tracker',

        start: function () {
            document.body.addEventListener('click', this.handleEvent, false);
        },

        handleEvent: function (e) {
            var channel = util.$('.name')[0].innerText,
                target;

            e = e || window.event;
            target = e.target || e.srcElement;

            if (target.classList.contains('btn-follow') && !target.classList.contains('btn-following')) {
                chrome.runtime.sendMessage({
                    message: 'log_analytics',
                    data: {
                        hitType: 'event',
                        eventCategory: 'hitbox-follow',
                        eventAction: 'click',
                        eventLabel: channel,
                        eventValue: 1
                    }
                });
            }
            else if (target.classList.contains('menu-item') && target.innerText === 'Unfollow') {
                chrome.runtime.sendMessage({
                    message: 'log_analytics',
                    data: {
                        hitType: 'event',
                        eventCategory: 'hitbox-follow',
                        eventAction: 'click',
                        eventLabel: channel,
                        eventValue: -1
                    }
                });
            }
        }
    };

    widgets.push(widget);
})();

