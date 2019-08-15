(function () {
    'use strict';

    var widget = {
        name: 'user tracker',
        start: function () {
            document.body.addEventListener('click', this.handleEvent, false);
        },

        handleEvent: function (e) {
            var channel = util.$('.channel-name');

            if (!channel) {
                return;
            }

            channel = channel[0].innerText;

            if (e.target.parentElement.classList.contains('follow-button')) {
                if (e.target.parentElement.classList.contains('is-following')) {

                    chrome.runtime.sendMessage({
                        message: 'log_analytics',
                        data: {
                            hitType: 'event',
                            eventCategory: 'twitch-follow',
                            eventAction: 'click',
                            eventLabel: channel,
                            eventValue: -1
                        }
                    });
                }
                else {
                    chrome.runtime.sendMessage({
                        message: 'log_analytics',
                        data: {
                            hitType: 'event',
                            eventCategory: 'twitch-follow',
                            eventAction: 'click',
                            eventLabel: channel,
                            eventValue: 1
                        }
                    });
                }
            }
        }

    };

    widgets.push(widget);
})();

