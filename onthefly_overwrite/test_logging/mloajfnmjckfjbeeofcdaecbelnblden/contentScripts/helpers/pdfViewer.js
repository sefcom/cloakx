/**************************************************************************
 **
 ** pdfViewer.js
 **
 ** Created by Codrin Juravle on Apr 29, 2015.
 ** Copyright (c) 2015 Don Johnston, Inc. All rights reserved.
 **
 **************************************************************************/

window.sru = window.sru || {};
window.sru.helpers = window.sru.helpers || {};

(function (__pdf) {

    var m_viewer = null;
    var m_pages = [];

    var m_lastUpdateTimestamp = Date.now();
    var m_lastGetTimestamp = m_lastUpdateTimestamp;
    var m_text = null;

    var m_rebuildTextTimer = null;

    var m_listeners = {
        newTextAvailable: []
    };

    //--------------------------------------------------------------------------------------------
    //
    //
    //
    __pdf.initialize = function (callback) {
        if(!m_viewer) {
            m_viewer = document.body.querySelector("div#viewerContainer div#viewer.pdfViewer");

            __cachePages(function() {
                dji.utils.callMethod(callback);

                window.addEventListener("textlayerrendered", function(e) {
                    // Other events: textlayerrendered, pagesloaded, pagerendered, pagechange.
                    var pageNumber = e.detail.pageNumber;
                    var page = m_pages[pageNumber - 1];
                    if(!page.isLoaded) {
                        page.isLoaded = true;
                        __onPageLoaded(page);
                    }
                });
            });
        }
    };

    __pdf.addEventListener = function (type, callback) {
        dji.utils.addEventListener(m_listeners, type, callback);
    };

    __pdf.removeEventListener = function (type, callback) {
        dji.utils.removeEventListener(m_listeners, type, callback);
    };

    __pdf.text = function(onlyIfNew) {
        var text = null;

        if(onlyIfNew) {
            text = (m_lastGetTimestamp < m_lastUpdateTimestamp ? m_text : "");
        } else {
            text = m_text;
        }

        m_lastGetTimestamp = Date.now();

        return text;
    };

    //--------------------------------------------------------------------------------------------
    //
    //
    //
    function __cachePages(callback) {

        var doCache = function(pageElements) {
            for(var index = 0; index < pageElements.length; index++) {
                var pageElem = pageElements[index];

                var page = {
                    number: (index + 1),
                    elem: pageElem,
                    isLoaded: false,
                    text: null,
                    isProcessed: false
                };

                m_pages.push(page);
            }

            callback();
        };

        var pageElements = m_viewer.querySelectorAll("div.page");
        if(pageElements.length == 0) {
            window.addEventListener("pagesinit", function() {
                window.removeEventListener("pagesinit", arguments.callee);
                pageElements = m_viewer.querySelectorAll("div.page");
                doCache(pageElements);
            });
        } else {
            doCache(pageElements);
        }
    }

    //--------------------------------------------------------------------------------------------
    //
    //
    //
    function __onPageLoaded(page) {
        page.text = dji.utils.extractVisibleTextFromElement(page.elem);

        if(m_rebuildTextTimer) {
            clearTimeout(m_rebuildTextTimer);
        }
        m_rebuildTextTimer = setTimeout(__rebuildText, 1000);
    }

    function __rebuildText() {
        clearTimeout(m_rebuildTextTimer);
        m_rebuildTextTimer = null;

        m_text = "";
        for(var index = 0; index < m_pages.length; index++) {
            var page = m_pages[index];
            if(page.text && page.text.length > 0) {
                if(m_text.length > 0) {
                    m_text += "\n";
                }
                m_text += page.text;
            }
        }

        m_lastUpdateTimestamp = Date.now();

        dji.utils.callListeners(m_listeners, "newTextAvailable", m_text);
    }

} (window.sru.helpers.pdfViewer = window.sru.helpers.pdfViewer || {}));