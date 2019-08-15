(function () {

    'use strict';

    var widget = {

        initialize: function () {
            if (!~location.pathname.indexOf('login/callback.html')) {
                return;
            }

            this.update_token();
        },

        update_token: function () {
            var token = location.hash && location.hash.slice(1);

            if (~token.indexOf('error=')) return;

            session.access_token = token;
            session.issued_at = new Date();
            session.user = null;
            session.save(function () {
                chrome.runtime.sendMessage({action: 'update_session'});
                if (window.opener) {
                    window.close();
                }
            });
        }
    };

    widgets.push(widget);
})();
