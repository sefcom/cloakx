(function () {
    'use strict';

    var widget = {
        name: 'user tracker',

        start: function () {
            document.body.addEventListener('click', this.handleEvent, false);
        },

        handleEvent: function (e) {
            var channel;

            if (location.hostname === 'www.dailymotion.com') {
                channel = util.$('.author')[0].innerText.substring(3).trim();
                if (e.target.innerText === 'Follow') {
                    chrome.runtime.sendMessage({
                        message: 'log_analytics',
                        data: {
                            hitType: 'event',
                            eventCategory: 'dailymotion-follow',
                            eventAction: 'click',
                            eventLabel: channel,
                            eventValue: 1
                        }
                    });
                }
                else {
                    chrome.runtime.sendMessage({
                        message: 'log_analytics',
                        data: {
                            hitType: 'event',
                            eventCategory: 'dailymotion-follow',
                            eventAction: 'click',
                            eventLabel: channel,
                            eventValue: -1
                        }
                    });
                }
            }
            else {
                channel = util.$('.channel-avatar-media__content')[0].innerText.split('\n')[0];

                if (e.target.innerText === 'Following') {
                    chrome.runtime.sendMessage({
                        message: 'log_analytics',
                        data: {
                            hitType: 'event',
                            eventCategory: 'dailymotion-follow',
                            eventAction: 'click',
                            eventLabel: channel,
                            eventValue: 1
                        }
                    });
                }
                else {
                    chrome.runtime.sendMessage({
                        message: 'log_analytics',
                        data: {
                            hitType: 'event',
                            eventCategory: 'dailymotion-follow',
                            eventAction: 'click',
                            eventLabel: channel,
                            eventValue: -1
                        }
                    });
                }
            }
        }
    };

    widgets.push(widget);
})();

