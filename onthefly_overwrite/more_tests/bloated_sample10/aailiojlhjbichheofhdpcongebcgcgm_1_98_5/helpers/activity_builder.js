/*
    YouTube Activity Builder
*/
(function (root) {
    'use strict';

    root.activity_builder = {
        build_activity: function (a) {
            var data;

            switch (a.snippet.type) {
                case 'bulletin':
                    if (!a.contentDetails) {
                        data = ['div', {class: 'activity_item'},
                            ['p',
                                ['i', {class: 'activity_icon material-icons'}, 'speaker_phone'],
                                ['span', {class: 'activity_description'},
                                    util.locale('yta_posted_bulletin'),
                                    ['b', a.snippet.description]
                                ],
                                ['span', {class: 'activity_date_published'}, moment(a.snippet.publishedAt).fromNow()]
                            ]
                        ];
                    }
                    else {
                        if (a.contentDetails.bulletin.resourceId.videoId) {
                            data = ['div', {class: 'activity_item'},
                                ['p',
                                    ['i', {class: 'activity_icon material-icons'}, 'speaker_phone'],
                                    ['span', {class: 'activity_description'},
                                        util.locale('yta_posted_bulletin'),
                                        ['b', a.snippet.description + '. '],
                                        util.locale('yta_attached_video'),
                                        ['a', {
                                                href: 'https://www.youtube.com/watch?v=' + a.contentDetails.bulletin.resourceId.videoId,
                                                target: '_blank'
                                            },
                                            a.snippet.title
                                        ]
                                    ],
                                    ['span', {class: 'activity_date_published'}, moment(a.snippet.publishedAt).fromNow()]
                                ]
                            ];
                        }
                        else {
                            data = ['div', {class: 'activity_item'},
                                ['p',
                                    ['i', {class: 'activity_icon material-icons'}, 'speaker_phone'],
                                    ['span', {class: 'activity_description'},
                                        util.locale('yta_posted_bulletin'),
                                        ['b', a.snippet.description + '. '],
                                        util.locale('yta_attached_playlist'),
                                        ['a', {
                                                href: 'https://www.youtube.com/playlist?list=' + a.contentDetails.bulletin.resourceId.playlistId,
                                                target: '_blank'
                                            },
                                            a.snippet.title
                                        ]
                                    ],
                                    ['span', {class: 'activity_date_published'}, moment(a.snippet.publishedAt).fromNow()]
                                ]
                            ];
                        }
                    }

                    return data;

                case 'channelItem':
                    return;

                case 'comment':
                    return;

                case 'favorite':
                    return;

                case 'like':
                    return ['div', {class: 'activity_item'},
                        ['p',
                            ['i', {class: 'activity_icon material-icons'}, 'thumb_up'],
                            ['span', {class: 'activity_description'},
                                util.locale('yta_liked_video'),
                                ['a', {
                                        href: 'https://www.youtube.com/watch?v=' + a.contentDetails.like.resourceId.videoId,
                                        target: '_blank'
                                    },
                                    a.snippet.title
                                ]
                            ],
                            ['span', {class: 'activity_date_published'}, moment(a.snippet.publishedAt).fromNow()]
                        ]
                    ];

                case 'recommendation':
                    return;

                case 'social':
                    return;

                case 'subscription':
                    return ['div', {class: 'activity_item'},
                        ['p',
                            ['i', {class: 'activity_icon material-icons'}, 'supervisor_account'],
                            ['span', {class: 'activity_description'},
                                util.locale('yta_subscribed_to'),
                                ['a', {
                                        href: 'https://www.youtube.com/channel/' + a.contentDetails.subscription.resourceId.channelId,
                                        target: '_blank'
                                    },
                                    a.contentDetails.subscription.resourceId.channelId
                                ]
                            ],
                            ['span', {class: 'activity_date_published'}, moment(a.snippet.publishedAt).fromNow()]
                        ]
                    ];

                case 'upload':
                    return ['div', {class: 'activity_item'},
                        ['p',
                            ['i', {class: 'activity_icon material-icons'}, 'open_in_new'],
                            ['span', {class: 'activity_description'},
                                util.locale('yta_uploaded_video'),
                                ['a', {
                                        href: 'https://www.youtube.com/watch?v=' + a.contentDetails.upload.videoId,
                                        target: '_blank'
                                    },
                                    a.snippet.title
                                ]
                            ],
                            ['span', {class: 'activity_date_published'}, moment(a.snippet.publishedAt).fromNow()]
                        ]
                    ];
                }

            return data;
        },
    };

})(this);

