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

(function (__bookshare) {

    var m_viewer = null;

    //--------------------------------------------------------------------------------------------
    //
    //
    //
    __bookshare.initialize = function (callback) {
        if(!m_viewer) {

            dji.utils.waitForDocumentToLoad(document, function() {
                __waitForViewerToBeReady(function() {
                    if(m_viewer && m_viewer.contentDocument) {
                        dji.utils.waitForDocumentToLoad(m_viewer.contentDocument, function() {
                            dji.utils.callMethod(callback);
                        });
                    }
                });
            });
        }
    };

    __bookshare.text = function() {
        return m_viewer ? dji.utils.extractVisibleTextFromElement(m_viewer.contentDocument.body) : "";
    };

    //--------------------------------------------------------------------------------------------
    //
    //
    //
    function __waitForViewerToBeReady(callback) {

        var __check = function() {
            m_viewer = document.body.querySelector("iframe#readium-scrolling-content");
            if(m_viewer) {
                callback();
            } else {
                setTimeout(__check, 1000);
            }
        };

        __check();
    }

} (window.sru.helpers.bookshare = window.sru.helpers.bookshare || {}));