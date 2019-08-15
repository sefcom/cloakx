(function () {
    'use strict';

    var widget = {

        name: 'Hover zoom photo on facebook',

        beta: true,

        action_classes: ['_54ru', '_8o', 'uiMediaThumbImg', '_5dec', '_7lw', '_2t9n', '_s0', '_2qds',
        'scaledImageFitHeight', 'scaledImageFitWidth', '_4-eo', '_5v4k', '_117p', '_7m4', '_6kt'],

        current_hover_el: null,

        supported_selectors: [
            'img[src*="fbcdn"]:not(.spotlight), img[src*="fbexternal"], [style*="fbcdn"]:not([data-reactid]), [style*="fbexternal"]',
            'a[href*="/photo.php"]',
            'a[ajaxify*="src="]:not(.coverWrap)'
        ],

        getThumbUrl:function (el) {
            var compStyle = (el && el.nodeType == 1) ? getComputedStyle(el) : false,
                backgroundImage = compStyle ? compStyle.backgroundImage : 'none';
            if (backgroundImage != 'none') {
                return backgroundImage.replace(/.*url\s*\(\s*(.*)\s*\).*/i, '$1');
            } 
            else {
                return el.src || el.href;
            }
        },

        get_hd_image_0: function (img) {
            var link = img.parents('a')[0];

            if (!link || link.has_class('UFICommentLink')
                || link.has_class('messagesContent') || link.getAttribute('href').indexOf('notif') != -1) return;

            var src = widget.getThumbUrl(img),
                origSrc = src;

            if (src.indexOf('safe_image.php') > -1) {
                src = unescape(src.substr(src.lastIndexOf('&url=') + 5));
                if (src.indexOf('?') > -1) {
                    src = src.substr(0, src.indexOf('?'));
                }
                if (src.indexOf('&') > -1) {
                    src = src.substr(0, src.indexOf('&'));
                }
                // Picasa hosted images
                if (src.indexOf('ggpht.com') > -1 || src.indexOf('blogspot.com') > -1) {
                    src = src.replace(/\/s\d+(-c)?\//, options.showHighRes ? '/s0/' : '/s800/');
                }
                // Youtube images
                if (src.indexOf('ytimg.com') > -1) {
                    src = src.replace(/\/(\d|(hq)?default)\.jpg/, '/0.jpg');
                }
            } else {
                var reg = src.match(/\d+_(\d+)_\d+/);

                if (reg) {
                    src = 'https://www.facebook.com/photo/download/?fbid=' + reg[1];
                }
            }

            return src;
        },

        get_hd_image_1: function (link) {
            return link.getAttribute('href').replace('photo.php', 'photo/download/');;
        },

        get_hd_image_2: function (link) {
            var key,
                src = link.getAttribute('ajaxify');

            if (src.indexOf('smallsrc=') > -1) {
                key = 'smallsrc=';
            }
            else {
                key = 'src=';
            }

            src = src.substr(src.indexOf(key) + key.length);
            src = unescape(src.substr(0, src.indexOf('&')));

            return src;
        },

        start: function () {
            var timer = null;

            document.addEventListener('mousemove', on_mouse_move);

            function on_mouse_move (e) {

                if (!target_changed(e)) return;

                stop(e);

                clearTimeout(timer);

                timer = setTimeout(_.partial(start, e), 300);
            }

            function target_changed (e) {
                return !widget.current_hover_el
                        || (widget.current_hover_el
                                && widget.current_hover_el.classList !== e.target.classList
                                && e.target.className !== 'hb_photo_zoom');
            }

            function stop (e) {
                widget.current_hover_el = null;
                util.$remove('.hb_photo_zoom');
                util.$('._li')[0].remove_class('hb_blurry');
            }

            function start (e) {
                var el_class,
                    actual_el,
                    i_selector,
                    hover_el    = util.bind_elem_functions(e.target),
                    el_classes  = hover_el.classList,
                    zoom_img    = jsonToDOM(['img', { class:'hb_photo_zoom' }]);

                if (!(el_class = class_valid(el_classes))) return;

                _.some(widget.supported_selectors, function (sel, i) {
                    var temp = hover_el.$(sel);

                    if (hover_el.matches(sel)) {
                        actual_el = hover_el;
                        i_selector = i;
                        return true;
                    }

                    if (temp.length) {
                        actual_el = temp[0];
                        i_selector = i;
                        return true;
                    }
                });

                if (!actual_el || !~i_selector) return;

                var hd_src = widget['get_hd_image_'+i_selector](actual_el);

                if (!hd_src) return;

                zoom_img.src = hd_src;
                document.body.appendChild(zoom_img);
                util.$('._li')[0].add_class('hb_blurry');
                widget.current_hover_el = hover_el;
            }

            function class_valid (el_classes) {
                var class_valid = false;

                _(el_classes)
                    .forEach(function (item) {
                        if (~widget.action_classes.indexOf(item)) {
                            class_valid = item;
                            return false;
                        }
                    })
                    .commit();

                return class_valid;
            }
        }
    };

    widgets.push(widget);

})();
