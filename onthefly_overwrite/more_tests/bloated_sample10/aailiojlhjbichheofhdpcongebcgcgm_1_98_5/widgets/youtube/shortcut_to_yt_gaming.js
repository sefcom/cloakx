(function () {
    'use strict';

    var widget = {

        name: 'Shortcut to youtube gaming',

        start: function () {
            widget.show =   ~location.pathname.indexOf('/user')
                            || ~location.pathname.indexOf('/channel')
                            || location.pathname === '/watch';

            if (!widget.show) return;

            function handler (e) {
                if (e.altKey && e.keyCode === 71) {
                    location = location.href.replace('www', 'gaming');
                }
            }

            document.addEventListener('keyup', handler, false);
        }
    };

    widgets.push(widget);

})();
