(function() {
    'use strict';

    var widget = {

        name: 'Remaining character on edit and upload',

        upload_items: 1,

        initialize: function () {
            if (!settings.remaining_characters) return;
        },

        start: function() {

            widget.show = (location.pathname === '/upload') || (location.pathname === '/edit');

            if (!widget.show || !settings.remaining_characters) return;

            var title_el = util.$('.video-settings-title')[0],
                add_tag_el = util.$('.video-settings-add-tag')[0],
                description_el = util.$('.video-settings-description')[0];

            title_el
                .add_class('fd-remain-char-el')
                .setAttribute('maxlength', widget.get_limit(title_el));
            add_tag_el
                .add_class('fd-remain-char-el')
                .setAttribute('maxlength', widget.get_limit(add_tag_el));
            description_el
                .add_class('fd-remain-char-el')
                .setAttribute('maxlength', widget.get_limit(description_el));

            widget.add_event_listener();
        },

        add_event_listener: function () {
            var remain_char_el = util.$('.fd-remain-char-el');

            _(remain_char_el)
                .forEach(function (el) {
                    var parent_el   = el.parents('.yt-uix-form-input-container')[0],
                        limit       = widget.get_limit(el),
                        char_length = widget.get_char_length(el),
                        limit_el    = jsonToDOM(['div', { class: 'fd-limiter'},
                                                    ['span', { class: 'fd-remain' }, char_length ],
                                                    ['span', '/' + limit]
                                                ]
                                            );

                    if (util.$('.fd-limiter', parent_el).length) {
                        util.$('.fd-remain', parent_el)[0].innerHTML = char_length;
                    }
                    else {
                        parent_el.appendChild(limit_el);
                    }

                    el.has_class('video-settings-add-tag') && el.addEventListener('keydown', widget.pre_process);
                    el.addEventListener('keyup', widget.calculate_remain_char);
                    widget.bind_event_on_tags();
                })
                .commit();
        },

        get_limit: function (el) {
            return el.has_class('video-settings-title')
                    ? 100
                    : (el.has_class('video-settings-add-tag') ? 420 : 5000);
        },

        get_char_length: function (el) {
            var parent_el    = el.parents('.yt-uix-form-input-container')[0],
                char_length = el.value.length + el.value.split(/\r\n|\r|\n/).length - 1,
                tag_length = 0;

            _(util.$('.yt-chip', parent_el))
                .forEach(function (tag) {
                    tag_length += tag.title.length;
                })
                .commit();

            el.has_class('video-settings-add-tag') && el.setAttribute('maxlength', (widget.get_limit(el) - tag_length));

            return char_length + tag_length;
        },

        pre_process: function (e) {
            var el          = util.bind_elem_functions(e.target),
                limit       = widget.get_limit(el),
                allow_keys  = [8, 9, 13, 16, 17, 20, 33, 34, 35, 36, 37, 38, 39, 40, 46],
                char_length = widget.get_char_length(el);

            if (char_length >= limit && !~allow_keys.indexOf(e.keyCode)) e.preventDefault();
        },

        calculate_remain_char: function (e) {
            var el          = util.bind_elem_functions(e.target),
                limit       = widget.get_limit(el),
                parent_el   = el.parents('.yt-uix-form-input-container')[0],
                remain_el   = util.$('.fd-remain', parent_el)[0];

            el.has_class('video-settings-add-tag') && widget.bind_event_on_tags();

            remain_el.innerHTML = widget.get_char_length(el);
        },

        bind_event_on_tags: function () {
            _(util.$('.yt-delete-chip'))
                .forEach(function (del_el) {
                    del_el.addEventListener('click', widget.recalculate)
                })
                .commit();
        },

        recalculate: function () {
            var el          = event.target.parentNode,
                parent_el   = el.parents('.yt-uix-form-input-container')[0],
                remain_el   = util.$('.fd-remain', parent_el)[0];

            remain_el.innerHTML = widget.get_char_length(util.$('.fd-remain-char-el', parent_el)[0]) - el.title.length;
        },

        integrity: function () {
            var last_upload_items = widget.upload_items;

            widget.upload_items = util.$('.upload-item').length;

            return last_upload_items === widget.upload_items;
        },

        settings_changed: function (change) {
            if (change.remaining_characters) {
                util.$('.fd-limiter').forEach(function (a) {
                    a.style.display = getComputedStyle(a).display === 'none' ? 'block' : 'none';
                });
            }
        }
    };

    widgets.push(widget);
})();
