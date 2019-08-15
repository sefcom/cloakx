/*
    Switch between HTML5 or FLASH player
*/

(function () {
    'use strict';

    var widget = {

        name: 'Flash player switch',

        container: '#heartbeat_flash_player_switch',

        initialize: function () {
            this.script = jsonToDOM(
                ['script', {type: 'text/javascript'},
                    'document.createElement("video").constructor.prototype.canPlayType = function(type){return ""}'
            ]);

            this.check_enable_flash_player();
        },

        check_enable_flash_player: function () {
            if (settings.flash_player) {
                document.documentElement.appendChild(this.script);
            }
        }
    };

    widgets.push(widget);

})();

