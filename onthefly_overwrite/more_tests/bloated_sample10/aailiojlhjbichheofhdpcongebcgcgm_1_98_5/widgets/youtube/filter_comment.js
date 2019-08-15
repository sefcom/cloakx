/*
    Filter comments
*/

(function () {
    'use strict';

    var widget = {

        name: 'Filter comments',

        initialize: function () {
            if (this.widget_dom) {
                return;
            }

            this.widget_dom = jsonToDOM(['div', {
                    id: 'freedom_filter_comments'
                },
                ['span', util.locale('filter') + ':'],
                ['select', {
                        class: 'yt-uix-form-input-text',
                        onchange: this.on_filter_change
                    }, 
                    ['option', {value: 'filter_all'}, util.locale('filter_all')],
                    ['option', {value: 'filter_not_replied'}, util.locale('filter_not_replied')],
                    ['option', {value: 'filter_have_questions'}, util.locale('filter_have_questions')],
                    ['option', {value: 'filter_have_bad_words'}, util.locale('filter_have_bad_words')]
                ],
                ['span', {id: 'freedom_filter_result'}, '']
            ]);
        },

        start: function () {
            if (!~location.pathname.indexOf('/comments')) {
                this.remove();
                return;
            }

            this.render();
        },

        remove: function () {
            this.widget_dom.remove();
        },

        render: function () {
            var container = util.$('.options-bar')[0];

            if (!container) {
                return;
            }

            container.appendChild(this.widget_dom);
        },

        integrity: function () {
            var new_threads = util.$('#yt-comments-list > .comment-entry'),
                is_good = ~location.pathname.indexOf('/comments') && util.$('#freedom_filter_comments');

            if (is_good
                && this.threads 
                && new_threads.length !== this.threads.length) {
                this.on_filter_change();
            }

            return is_good;
        },

        settings_changed: function (change) {
            if (change.filter_comment && !settings.filter_comment) {
                this.remove();
            }
        },

        on_filter_change: function (evt) {
            var filter = evt.currentTarget.value;

            if (this[filter]) {
                this[filter]();
            }
        },

        apply_filter: function (predicate) {
            var span = util.$('#freedom_filter_result', this.widget_dom),
                select = util.$('select', this.widget_dom)[0],
                that = this;

            this.threads = util.$('#yt-comments-list > .comment-entry');
            this.filtered_threads = [];
            
            _(this.threads)
                .forEach(function (t) {
                    if (predicate(t)) {
                        that.filtered_threads.push(t);
                        t.remove_class('freedom_hidden');
                        return;
                    }
                    
                    t.add_class('freedom_hidden');
                })
                .commit();

            if (select.value === 'filter_all') {
                span.innerText = '';
                return;
            }

            span.innerText = util.locale('freedom_filter_result')
                .replace('?', this.filtered_threads.length)
                .replace('?', this.threads.length);
        },

        filter_all: function () {
            this.apply_filter(function () {return true;});
        },

        filter_not_replied: function () {
            this.apply_filter(function (t) {
                return !util.$('.comment-item.reply.channel-owner', t).length;
            });
        },

        filter_have_questions: function () {
            this.apply_filter(function (t) {
                return ~t.innerText.indexOf('?');
            });
        },

        filter_have_bad_words: function () {
            this.apply_filter(function (t) {
                return util.contains_offensive_words(t.innerText);
            });
        }
    };

    widgets.push(widget);

})();
