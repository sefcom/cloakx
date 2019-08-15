(function () {
    'use strict';

    var widget = {
        name: 'user tracker',

        start: function () {
            document.body.addEventListener('click', this.handleEvent, false);
        },

        handleEvent: function (e) {

            var analytics_data = null;

            if (e.srcElement.classList.contains('like-button-renderer-like-button-unclicked') ||
                    e.srcElement.parentElement.classList.contains('like-button-renderer-like-button-unclicked')) {
                analytics_data = {
                    hitType: 'event',
                    eventCategory: 'youtube-like',
                    eventAction: 'click',
                    eventLabel: data.video_id,
                    eventValue: 1
                };
            }
            else if (e.srcElement.classList.contains('like-button-renderer-like-button-clicked') ||
                e.srcElement.parentElement.classList.contains('like-button-renderer-like-button-clicked')) {
                analytics_data = {
                    hitType: 'event',
                    eventCategory: 'youtube-like',
                    eventAction: 'click',
                    eventLabel: data.video_id,
                    eventValue: -1
                };
            }
            else if (e.target.innerText === 'Subscribe') {
                analytics_data = {
                    hitType: 'event',
                    eventCategory: 'youtube-subscribe',
                    eventAction: 'click',
                    eventLabel: data.channel_id,
                    eventValue: 1
                };
            }
            else if (e.target.innerText === 'Unsubscribe') {
                analytics_data = {
                    hitType: 'event',
                    eventCategory: 'youtube-subscribe',
                    eventAction: 'click',
                    eventLabel: data.channel_id,
                    eventValue: -1
                };
            }

            if (analytics_data !== null) {
                chrome.runtime.sendMessage({
                    message: 'log_analytics',
                    data: analytics_data
                });
            }
        }
    };

    widgets.push(widget);
})();

