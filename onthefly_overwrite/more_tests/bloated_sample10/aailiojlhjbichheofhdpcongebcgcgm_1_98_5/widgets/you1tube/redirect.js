(function () {
    'use strict';

    var widget = {
        name: 'Set public token id',

        initialize: function () {
            if (location.pathname !== '/callback') {
                return;
            }

            this.generate_token_and_redirect();
        },

        generate_token_and_redirect: function () {
            var token_id = util.generate_UUID(),
                state = util.parse_qs().state;

            util.api('public_token')
                .post({
                        token_id: token_id,
                        access_token: util.parse_qs().access_token
                    },
                    function (err) {
                        if (err) {
                            return;
                        }

                        settings.set('public_token_id', token_id);

                        if (state === 'popup') {
                            window.public_token_id = token_id;
                            window.close();
                        }

                        location.href = util.parse_qs().state;
                    });
        }
    };

    widgets.push(widget);
})();
