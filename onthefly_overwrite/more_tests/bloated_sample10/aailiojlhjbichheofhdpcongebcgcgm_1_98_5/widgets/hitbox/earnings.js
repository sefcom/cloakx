(function () {
    'use strict';

    var widget = {
        name: 'Hitbox Earnings',
        container: '#hitbox_earnings',

        initialize: function () {
            this.hitbox_earnings = jsonToDOM(['span', {
                    id: 'hitbox_earnings',
                    tooltip: util.locale('estimated_lifetime_earnings')
                }
            ]);

            this.hitbox_earnings.addEventListener('mouseenter', this.show_tooltip);
            this.hitbox_earnings.addEventListener('mouseleave', this.hide_tooltip);
        },

        start: function () {
            var that = this;

            if (!settings.hitbox_earnings) {
                this.remove();
                return;
            }

            util.$wait('#meta-info .stats .icon-eye:not(.ng-hide)', function (err, elem) {
                if (err || !elem.length) {
                    return;
                }

                that.hitbox_earnings.innerText = numeral((+elem[0].innerText.replace(/,/g, '') * 7 * 0.55 * 0.25) / 1000)
                    .format('$0,0.00') + ' ' + util.locale('estimated_abbr');

                that.render();
            }, 200, 10000);
        },

        settings_changed: function (change) {
            if (change.hitbox_earnings && !settings.hitbox_earnings) {
                this.remove();
            }
        },

        integrity: function () {
            return util.$('#hitbox_earnings');
        },

        render: function () {
            var e = util.$('#meta-info .stats')[0];

            if (e) {
                e.appendChild(this.hitbox_earnings);
            }
        },

        remove: function () {
            var widget = util.$('#hitbox_earnings');

            if (widget) {
                widget.remove();
            }
        },

        show_tooltip: function (evt) {
            var box = util.$('#freedom_tooltip_box'),
                elem = evt.currentTarget,
                position = util.get_element_offset(elem),
                container = util.$('body')[0],
                title = elem.getAttribute('tooltip');

            if (!container || !title) {
                return;
            }

            if (!box) {
                box = jsonToDOM(['div', {
                        id: 'freedom_tooltip_box',
                        class: 'tooltip top in'
                    }, 
                    ['div', {class: 'tooltip-arrow'}],
                    ['div', {class: 'tooltip-inner'}, title]
                ]);

                container.appendChild(box);
            }
            else {
                util.$('.tooltip-inner', box)[0].innerText = title;
            }

            box.style.display = 'block';
            box.style.left = position.left - box.offsetWidth / 2 + elem.offsetWidth / 2 + 'px';
            box.style.top = position.top - elem.offsetHeight - 20 + 'px';
        },

        hide_tooltip: function () {
            var box = util.$('#freedom_tooltip_box');

            if (box) {
                box.style.display = 'none';
            }
        }
    };

    widgets.push(widget);
})();

