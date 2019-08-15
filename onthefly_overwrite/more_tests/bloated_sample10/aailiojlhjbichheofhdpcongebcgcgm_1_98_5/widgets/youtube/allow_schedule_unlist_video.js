(function () {
    'use strict';

    var widget = {

        name: 'Allow user schedule unlist video',

        start: function () {
            if (!location.pathname === '/edit') return;

            util.$wait('.metadata-privacy-input', function (err, elems) {
                if (err) return;

                elems[0].addEventListener('click', function () {
                    util.$('option', elems[0])[3] && util.$('option', elems[0])[3].removeAttribute('disabled');
                })
            });
        }
    };

    widgets.push(widget);
})();
