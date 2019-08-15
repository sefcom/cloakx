var ServiceAttachment = {
    chunks : {},

    mapAttachmentUrl : function(guid) {
        return MessagingAPI.vpsUrl + "/api" + MessagingAPI.apiVersion + "/attachments/" + guid;
    },

    bind : function() {
        App.vent.on('api:get:attachment:url', this.getAttachmentUrl, this);
        App.vent.on('api:get:attachment:details', this.getAttachmentDetails, this);
        App.vent.on('api:track:print:attachment', this.trackPrintAttachment, this);
        App.vent.on('api:search:attachments', this.searchAttachments, this);
        App.vent.on('api:search:esignatures', this.searchESignatures, this);
        App.vent.on('api:get:signatures', this.getSignatures, this);
        App.vent.on('api:download:attachment', this.downloadAttachment, this);
        App.vent.on('api:update:attachment', this.updateAttachment, this);
        App.vent.on('api:remove:attachment', this.removeAttachment, this);
        App.vent.on('api:delete:attachment', this.deleteAttachment, this);
        App.vent.on('api:sign:attachment', this.signAttachment, this);
        App.vent.on('api:get:attachment:progress', this.getAttachmentsUploadProgress, this);
        App.vent.on('api:download:attachment:chunks', this.downloadChunks, this);
        App.vent.on('api:create:attachment:download:token', this.createAttachmentDownloadToken, this);
        App.vent.on('api:download:attachment:with:token', this.downloadAttachmentWithToken, this);
    },

    unbind : function() {
        App.vent.off('api:get:attachment:url', this.getAttachmentUrl, this);
        App.vent.off('api:get:attachment:details', this.getAttachmentDetails, this);
        App.vent.off('api:track:print:attachment', this.trackPrintAttachment, this);
        App.vent.off('api:search:attachments', this.searchAttachments, this);
        App.vent.off('api:search:esignatures', this.searchESignatures, this);
        App.vent.off('api:get:signatures', this.getSignatures, this);
        App.vent.off('api:download:attachment', this.downloadAttachment, this);
        App.vent.off('api:update:attachment', this.updateAttachment, this);
        App.vent.off('api:remove:attachment', this.removeAttachment, this);
        App.vent.off('api:delete:attachment', this.deleteAttachment, this);
        App.vent.off('api:sign:attachment', this.signAttachment, this);
        App.vent.off('api:get:attachment:progress', this.getAttachmentsUploadProgress, this);
        App.vent.off('api:download:attachment:chunks', this.downloadChunks, this);
        App.vent.off('api:create:attachment:download:token', this.createAttachmentDownloadToken, this);
        App.vent.off('api:download:attachment:with:token', this.downloadAttachmentWithToken, this);
    },

    getAttachmentUrl : function(guid, vCallback){
        var path;

        path = MessagingAPI.vpsUrl + "/api" + MessagingAPI.apiVersion + "/attachments/" + guid;

        var query = "?";
        query += 'x-sm-client-name=WebApp';
        query += '&x-sm-client-version='+Version.VERSION;
        var token = "";
        if (Application.getPreferences && Application.getPreferences().token) {
            token = "&X-sm-session-token=" + Application.getPreferences().token;
        }

        if (Application && Application.sessionToken) {
            token = "&X-sm-session-token=" + Application.sessionToken;
        }

        if (token.length) {
            query += token;
        }

        path += query;

        if(vCallback) {
            vCallback(path);
        }
        App.vent.pub('api:get:attachment:url:complete', path);
        return path;
    },

    getAttachmentUrlByToken : function(token, download, vCallback){
        var path;

        path = MessagingAPI.vpsUrl + "/api" + MessagingAPI.apiVersion + "/attachments/download/" + token + "?preview=" + !download;

        if(vCallback) {
            vCallback(path);
        }
        App.vent.pub('api:get:attachment:url:by:token:complete', path);
        return path;
    },

    createAttachmentDownloadToken: function(options, vCallback) {
        options = options == undefined ? {} : options;
        var attachmentGuid = options.attachmentGuid;
        var password = options.password;
        var request = APIMessage.createAttachmentDownloadToken(attachmentGuid, password);
        MessagingAPI.handleRequest(request, ServiceAttachment.createAttachmentDownloadToken_, vCallback);
    },

    createAttachmentDownloadToken_: function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.pub('api:create:attachment:download:token:complete', response);
    },

    downloadAttachmentWithToken: function(options, vCallback) {
        options = options == undefined ? {} : options;
        var token = options.token;
        var name = options.name;
        var download = options.download;
        var request = APIMessage.downloadAttachmentWithToken(token, name, download);
        MessagingAPI.handleRequestAttachment(request, ServiceAttachment.downloadAttachmentWithToken_, vCallback);
        return request.request;
    },

    downloadAttachmentWithToken_ : function(response, data, vCallback) {
        if (response && !response.responseStatus) {
            var blob, url;
            if(App.clientInfo && App.clientInfo.isSafari()) {
                var intArray = new Uint8Array(response);
                blob = new Blob([intArray.buffer], {
                    type: "application/octet-stream"
                });
            } else {
                blob = new Blob([response], {
                    type: "application/octet-stream"
                });
            }
            url = window.URL.createObjectURL(blob);

            if (data.download && data.name) {
                if (App.clientInfo.isIE()) {
                    if (window.navigator.msSaveOrOpenBlob) {
                        window.navigator.msSaveOrOpenBlob(blob, data.name);
                    }
                } else {
                    var a = document.createElement("a");
                    document.body.appendChild(a);
                    a.style = "display: none";
                    a.href = url;
                    a.download = data.name;
                    a.click();
                }
                setTimeout(function() {
                    window.URL.revokeObjectURL(url);
                }, 100);
            }
            response = {
                blob : blob,
                data : response
            };
        }
        if(vCallback){
            vCallback(response);
        }

        App.vent.pub('api:download:attachment:with:token:complete', response);
    },

    getAttachmentDetails: function(guid, vCallback) {
        var request = APIMessage.getAttachmentDetails(guid);
        MessagingAPI.handleRequest(request, ServiceAttachment.getAttachmentDetails_, vCallback);
        return request.request;
    },

    getAttachmentDetails_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.pub('api:get:attachment:details:complete', response);
    },

    trackPrintAttachment : function(guid, vCallback) {
        var request = APIMessage.trackPrintAttachment(guid);
        MessagingAPI.handleRequest(request, ServiceAttachment.trackPrintAttachment_, vCallback);
    },

    trackPrintAttachment_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.pub('api:track:print:attachment:complete', response);
    },

    searchAttachments : function(options, vCallback) {
        options = options == undefined ? {} : options;
        var page = options.page;
        var pageSize = options.pageSize;
        var filter = options.filter;
        var sort = options.sort;
        if(typeof filter != 'object') {
            filter = {}
        }
        if (!filter.types) {
            filter.types = ['Normal'];
        }
        var request = APIMessage.searchAttachments(page, pageSize, filter, sort);
        MessagingAPI.handleRequest(request, ServiceAttachment.searchAttachments_, vCallback);
    },

    searchAttachments_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.pub('api:search:attachments:complete', response);
    },

    searchESignatures : function(options, vCallback) {
        options = options == undefined ? {} : options;
        var page = options.page;
        var pageSize = options.pageSize;
        var filter = options.filter;
        var sort = options.sort;
        if(typeof filter != 'object') {
            filter = {}
        }
        if (!filter.types) {
            filter.types = 'ESignature';
         }

        var request = APIMessage.searchAttachments(page, pageSize, filter, sort);
        MessagingAPI.handleRequest(request, ServiceAttachment.searchESignatures_, vCallback);
    },

    searchESignatures_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.pub('api:search:esignatures:complete', response);
    },

    updateAttachment : function(guid, type, vCallback) {
        var request = APIMessage.updateAttachment(guid, type);
        MessagingAPI.handleRequest(request, ServiceAttachment.updateAttachment_, vCallback);
    },

    updateAttachment_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.pub('api:update:attachment:complete', response);
    },

    deleteAttachment : function(guid, vCallback) {
        var request = APIMessage.deleteAttachment(guid);
        MessagingAPI.handleRequest(request, ServiceAttachment.deleteAttachment_, vCallback);
    },

    deleteAttachment_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.pub('api:delete:attachment:complete', response);
    },

    removeAttachment : function(mGuid, aGuid, vCallback) {
        var request = APIMessage.removeAttachment(mGuid, aGuid);
        MessagingAPI.handleRequest(request, ServiceAttachment.removeAttachment_, vCallback);
    },

    removeAttachment_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.pub('api:remove:attachment:complete', response);
    },

    signAttachment : function(guid, answer, vCallback) {
        var request = APIMessage.signAttachment(guid, answer);
        MessagingAPI.handleRequest(request, ServiceAttachment.signAttachment_, vCallback);
    },

    signAttachment_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.pub('api:sign:attachment:complete', response);
    },

    getSignatures : function(guid, vCallback) {
        var request = APIMessage.getSignatures(guid);
        MessagingAPI.handleRequest(request, ServiceAttachment.getSignatures_, vCallback);
    },

    getSignatures_ : function(response, vCallback, req) {
        if(vCallback){
            vCallback(response);
        }
        App.vent.pub('api:get:signatures:complete', response, req);
    },

    downloadAttachment : function(guid, name, download, vCallback) {
        var request = APIMessage.downloadAttachment(guid, name, download);
        MessagingAPI.handleRequestAttachment(request, ServiceAttachment.downloadAttachment_, vCallback);
        return request.request;
    },

    downloadAttachment_ : function(response, data, vCallback) {
        if (response && !response.responseStatus) {
            var blob, url;
            if(App.clientInfo && App.clientInfo.isSafari()) {
                var intArray = new Uint8Array(response);
                blob = new Blob([intArray.buffer], {
                    type: "application/octet-stream"
                });
            } else {
                blob = new Blob([response], {
                    type: "application/octet-stream"
                });
            }
            url = window.URL.createObjectURL(blob);

            if (data.download && data.name) {
                if (App.clientInfo.isIE()) {
                    if (window.navigator.msSaveOrOpenBlob) {
                        window.navigator.msSaveOrOpenBlob(blob, data.name);
                    }
                } else {
                    var a = document.createElement("a");
                    document.body.appendChild(a);
                    a.style = "display: none";
                    a.href = url;
                    a.download = data.name;
                    a.click();
                }
                setTimeout(function() {
                    window.URL.revokeObjectURL(url);
                }, 100);
            }
            response = {
                blob : blob,
                data : response
            };
        }
        if(vCallback){
            vCallback(response);
        }

        App.vent.pub('api:download:attachment:complete', response);
    },

    getAttachmentsUploadProgress : function(attachmentGuid, vCallback) {
        var request = APIMessage.getAttachmentsUploadProgress(attachmentGuid);
        MessagingAPI.handleRequest(request, ServiceAttachment.getAttachmentsUploadProgress_, vCallback);
    },
    getAttachmentsUploadProgress_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }

        App.vent.pub('api:get:attachment:progress:complete', response);
    },

    downloadChunks : function(guid, name, download, vCallback) {
        ServiceAttachment.getAttachmentsUploadProgress(guid, function(response) {
            if (response && !response.responseStatus) {
                var chunkProgresses = response.attachmentProgresses[0].chunkProgresses, i;
                console.log(response);
                ServiceAttachment.chunks[guid] = {
                    data : [],
                    totalCount : chunkProgresses.length,
                    currentCount : 0,
                    name : name,
                    download : download

                };
                for(i = 0; i < chunkProgresses.length; i++) {
                    ServiceAttachment.downloadAttachmentChunk(guid, chunkProgresses[i].chunkNumber, download, vCallback);
                }
            }
        });
    },

    completeChunkDownload : function(guid, vCallback) {
        if (ServiceAttachment.chunks[guid] && ServiceAttachment.chunks[guid].totalCount == ServiceAttachment.chunks[guid].currentCount) {
            var blob = new Blob(ServiceAttachment.chunks[guid].blob, {
                type : "application/octet-stream"
            }), url = window.URL.createObjectURL(blob);
            if (ServiceAttachment.chunks[guid].download) {
                var a = document.createElement("a");
                document.body.appendChild(a);
                a.style = "display: none";
                a.href = url;
                a.download = ServiceAttachment.chunks[guid].name;
                a.click();
                setTimeout(function() {
                    window.URL.revokeObjectURL(url);
                }, 100);
            }
            response = {
                blob : blob,
                data : ServiceAttachment.chunks[guid].data
            };
            if(vCallback) {
                vCallback(response);
            }
            App.vent.pub('api:download:attachment:chunks:complete', response);
        }
    },

    downloadAttachmentChunk : function(guid, chunkNumber, download, vCallback) {
        var request = APIMessage.downloadAttachmentChunk(guid, chunkNumber, download);
        MessagingAPI.handleRequestAttachment(request, ServiceAttachment.downloadAttachmentChunk_, vCallback);
    },

    downloadAttachmentChunk_ : function(response, data, vCallback) {
        if (!(response && response.responseStatus)) {
            if (data.guid && data.chunk) {
                var guid = data.guid;
                var chunk = data.chunk;
                var blob = new Blob([response], {
                    type : "application/octet-stream"
                });
                ServiceAttachment.chunks[guid].blob[chunk - 1] = blob;
                ServiceAttachment.chunks[guid].data[chunk - 1] = response;
                ServiceAttachment.chunks[guid].currentCount++;
                ServiceAttachment.completeChunkDownload(guid, vCallback);
            }
        }
        vCallback(response);
    }
};
