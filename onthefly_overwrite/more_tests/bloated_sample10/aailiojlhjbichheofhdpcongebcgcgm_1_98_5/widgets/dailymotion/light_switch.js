/*
    Light switch widget
*/

(function () {
    'use strict';

    var widget = {

        name: 'Light switch',

        container: '#hb_light_switch_widget',

        initialize: function () {
            widget.light_switch = jsonToDOM(['div', {
                    class: 'switch',
                    id: widget.container.slice(1)
                },
                    ['input', {
                            id: 'hb_light_switch', 
                            class: 'hb_light_toggle hb_light_toggle_round', 
                            type: 'checkbox',
                            onchange: widget.toggle_lights,
                            checked: settings.dailymotion_light_switch ? true : undefined
                        }],
                    ['label', {for: 'hb_light_switch'}]
                ]);

            widget.dark_css = jsonToDOM(['link', {
                    rel: 'stylesheet',
                    href: config.assets_url + 'styles/dailymotion-darkmode.css'
                }]);
        },

        start: function () {                 
            if (!settings.dailymotion_light) {
                return;
            }
        
            //wait for containers available on dom
            util.$wait('.sd_header__login, .main-header__right', function (err, eles) {
                if (err || !eles.length) {
                    return;
                }

                var ele = eles[0];
                ele.insertBefore(widget.light_switch, ele.firstChild);
            });

            widget.render();
        },

        toggle_lights: function () {
            settings.set('dailymotion_light_switch', !settings.dailymotion_light_switch);
        },

        render: function () {
            if (settings.dailymotion_light_switch) {
                (document.head || document.body || document.documentElement).appendChild(widget.dark_css);
            } else {
                widget.dark_css.remove();
            }  
        },

        settings_changed: function (change) {
            if (change.dailymotion_light) {
                settings.dailymotion_light ? widget.start() : widget.stop();
            }
            else if (change.dailymotion_light_switch) {
                widget.render();
            }
        },

        stop: function () {
            widget.light_switch.remove();
            widget.dark_css.remove();
        }
    };

    widgets.push(widget);

})();
