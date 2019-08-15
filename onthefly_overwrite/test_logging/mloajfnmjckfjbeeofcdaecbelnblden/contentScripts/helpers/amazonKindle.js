/**************************************************************************
 **
 ** amazonKindle.js
 **
 ** Created by Andreea Vrancianu on Jun 15, 2015.
 ** Copyright (c) 2015 Don Johnston, Inc. All rights reserved.
 **
 **************************************************************************/

window.sru = window.sru || {};
window.sru.helpers = window.sru.helpers || {};

(function (__amazonKindle) {

    var m_viewer = null;

    //--------------------------------------------------------------------------------------------
    //
    //
    //
    __amazonKindle.initialize = function (callback) {
        if(!m_viewer) {

            dji.utils.waitForDocumentToLoad(document, function() {
                __waitForViewerToBeReady(function() {
                    if(m_viewer && m_viewer.contentDocument) {
                        dji.utils.waitForDocumentToLoad(m_viewer.contentDocument, function() {
                            __addStylesToIframes();
                            dji.utils.callMethod(callback);
                        });
                    }
                });
            });
        }
    };

    __amazonKindle.text = function() {
        return m_viewer ? dji.utils.extractVisibleTextFromElement(m_viewer.contentDocument.body) : "";
    };

    //--------------------------------------------------------------------------------------------
    //
    //
    //
    function __waitForViewerToBeReady(callback) {

        var __check = function() {
            var readerFrame = document.body.querySelector("iframe#KindleReaderIFrame");
            if (readerFrame) {
                m_viewer = readerFrame.contentWindow.document.getElementById("column_0_frame_1");
                if(m_viewer && m_viewer.style.visibility == "visible") {
                    callback();
                } else {
                    setTimeout(__check, 1000);
                }
            } else {
                setTimeout(__check, 1000);
            }
        };

        __check();
    }

    function __addStylesToIframes() {
        var readerFrame = document.getElementById("KindleReaderIFrame").contentWindow.document;
        if(readerFrame.head) {
            var link = readerFrame.getElementById("dji-sru-css-cursors");
            if (!link) {
                link = readerFrame.createElement('link');
                link.id = "dji-sru-css-cursors";
                link.rel = "stylesheet";
                link.type = "text/css";
                link.async = true;
                link.href = chrome.extension.getURL('contentScripts/cursors.css');
                readerFrame.head.appendChild(link);

                link = readerFrame.createElement('link');
                link.id = "dji-sru-css-rewordify";
                link.rel = "stylesheet";
                link.type = "text/css";
                link.async = true;
                link.href = chrome.extension.getURL('contentScripts/rewordify.css');
                readerFrame.head.appendChild(link);
            }
        }

        var iFrames = [];
        if (readerFrame.getElementById("column_0_frame_0")) iFrames.push(readerFrame.getElementById("column_0_frame_0"));
        if (readerFrame.getElementById("column_0_frame_1")) iFrames.push(readerFrame.getElementById("column_0_frame_1"));
        if (readerFrame.getElementById("column_1_frame_0")) iFrames.push(readerFrame.getElementById("column_1_frame_0"));
        if (readerFrame.getElementById("column_1_frame_1")) iFrames.push(readerFrame.getElementById("column_1_frame_1"));

        for (var i=0;i<iFrames.length;i++) {
            var doc = iFrames[i].contentWindow.document;
            if(doc.head) {
                var link = doc.getElementById("dji-sru-css-speech");
                if (!link) {
                    link = doc.createElement('link');
                    link.id = "dji-sru-css-speech";
                    link.rel = "stylesheet";
                    link.type = "text/css";
                    link.async = true;
                    link.href = chrome.extension.getURL('contentScripts/speech.css');
                    doc.head.appendChild(link);

                    link = doc.createElement('link');
                    link.id = "dji-sru-css-rewordify";
                    link.rel = "stylesheet";
                    link.type = "text/css";
                    link.async = true;
                    link.href = chrome.extension.getURL('contentScripts/rewordify.css');
                    doc.head.appendChild(link);
                }
            }
            iFrames[i].addEventListener("load", __addStylesToIframes, true);
        }
    }

} (window.sru.helpers.amazonKindle = window.sru.helpers.amazonKindle || {}));