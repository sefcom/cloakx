(function () {
    'use strict';

    var setting_page = {
        
        start: function () {
            this.content_page = jsonToDOM(['div', {
                    id: 'default_content',
                    class: 'setting_page_content'
                },
                ['div', {class: 'background'},
                    ['div', {class: 'out-container'},

                    ],
                    ['div', {class: 'row header'}, 
                        ['div', {class: 'col-sm-8'},
                            ['a', {href: 'https://www.heartbeat.tm/'},
                                ['img', {src: 'https://www.heartbeat.tm/images/heartbeat-logo.png'}]
                            ]
                        ],
                        ['div', {class: 'col-sm-4'},
                            ['div', {class: 'row'},
                                ['a', {href: 'https://www.freedom.tm/'},
                                    ['img', {src: 'https://www.heartbeat.tm/images/poweredby-freedom.png'}]
                                ]
                            ],
                            ['div', {class: 'row'},
                                ['a', {href: 'https://www.freedom.tm/', target: '_blank'},
                                    ['div', {class: 'socialicons'}]
                                ],
                                ['a', {href: 'https://www.facebook.com/mcnfreedom', target: '_blank'},
                                    ['div', {class: 'socialicons', id: 'social-fb'}]
                                ],
                                ['a', {href: 'https://www.youtube.com/freedom', target: '_blank'},
                                    ['div', {class: 'socialicons', id: 'social-yt'}]
                                ],
                                ['a', {href: 'https://twitter.com/heartbeattm', target: '_blank'},
                                    ['div', {class: 'socialicons', id: 'social-tw'}]
                                ],
                                ['a', {href: 'https://www.freedom.tm/', target: '_blank'},
                                    ['div', {class: 'socialicons', id: 'social-mail'}]
                                ],
                            ]
                        ]
                    ],
                    ['div', {class: 'row body'},
                        ['div', {class: 'heartbeat'}]
                    ],
                    ['div', {class: 'footer'},
                        ['a', {href: 'https://www.heartbeat.tm/blog', target: '_blank'},
                            util.locale('change_logs')
                        ],
                        ['a', {href: 'https://www.youtube.com/playlist?list=PLxLYo5_7D3Sfsq4i0BdQnvt0VRCD5PS1c', target: '_blank'},
                            util.locale('about_heartbeat')
                        ],
                    ]
                ]
            ]);

            util.$('#heartbeat_content').appendChild(this.content_page);
        }
    };

    heartbeat_menu_popup.add_page(setting_page);

})();
