var ServiceMessage = {

    bind : function() {
        App.vent.on('api:get:campaign:messages', this.getCampaignMessages, this);
        App.vent.on('api:track:print:message', this.trackPrintMessage, this);
        App.vent.on('api:get:message:tree', this.getMessageTree, this);
        App.vent.on('api:search:messages', this.searchMessages, this);
        App.vent.on('api:search:messages:detour', this.searchMessagesDetour, this);
        App.vent.on('api:link:attachment', this.linkAttachment, this);
        App.vent.on('api:unlink:attachment', this.unlinkAttachment, this);
        App.vent.on('api:get:message', this.getMessage, this);
        App.vent.on('api:get:message:list', this.getMessageList, this);
        App.vent.on('api:create:message', this.preCreateMessage, this);
        App.vent.on('api:save:message', this.saveMessage, this);
        App.vent.on('api:send:message', this.sendMessage, this);
        App.vent.on('api:create:attachments', this.preCreateAttachments, this);
        App.vent.on('api:upload:attachment:chunks', this.uploadAttachmentChunk, this);
    },

    unbind : function() {
        App.vent.off('api:get:campaign:messages', this.getCampaignMessages, this);
        App.vent.off('api:track:print:message', this.trackPrintMessage, this);
        App.vent.off('api:get:message:tree', this.getMessageTree, this);
        App.vent.off('api:search:messages', this.searchMessages, this);;
        App.vent.off('api:search:messages:detour', this.searchMessagesDetour, this);
        App.vent.off('api:link:attachment', this.linkAttachment, this);
        App.vent.off('api:unlink:attachment', this.unlinkAttachment, this);
        App.vent.off('api:get:message', this.getMessage, this);
        App.vent.off('api:get:message:list', this.getMessageList, this);
        App.vent.off('api:create:message', this.preCreateMessage, this);
        App.vent.off('api:save:message', this.saveMessage, this);
        App.vent.off('api:send:message', this.sendMessage, this);
        App.vent.off('api:create:attachments', this.preCreateAttachments, this);
        App.vent.off('api:upload:attachment:chunks', this.uploadAttachmentChunk, this);
    },

    mapAttachmentUrl : function(guid) {
        return MessagingAPI.vpsUrl + "/api" + MessagingAPI.apiVersion + "/attachments/" + guid;
    },

    trackPrintMessage : function(guid, vCallback) {
        var request = APIMessage.trackPrintMessage(guid);
        MessagingAPI.handleRequest(request, ServiceMessage.trackPrintMessage_, vCallback);
    },

    trackPrintMessage_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.pub('api:track:print:message:complete', response);
    },

    getMessageTree : function(guid, vCallback) {
        var request = APIMessage.getMessageTree(guid);
        MessagingAPI.handleRequest(request, ServiceMessage.getMessageTree_, vCallback);
    },

    getMessageTree_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.pub('api:get:message:tree:complete', response);
    },

    getCampaignMessages : function(options, vCallback) {
        options = options == undefined ? {} : options;
        var page = options.page ? options.page : 1;
        var pageSize = options.pageSize ? options.pageSize : 25;
        var filter = options.filter ? options.filter : {};
        var sort = options.sort;

        filter.campaignGuid = options.campaignGuid;
        var request = APIMessage.searchMessages(page, pageSize, filter, sort);
        MessagingAPI.handleRequest(request, ServiceMessage.getCampaignMessages_, vCallback);
    },

    getCampaignMessages_ : function(response) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.pub('api:get:campaign:messages:complete', response);
    },

    searchMessages : function(options, vCallback) {
        options = options == undefined ? {} : options;
        var page = options.page;
        var pageSize = options.pageSize;
        var filter = options.filter;
        var sort = options.sort;
        var request = APIMessage.searchMessages(page, pageSize, filter, sort);
        MessagingAPI.handleRequest(request, ServiceMessage.searchMessages_, vCallback);
    },

    searchMessages_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.pub('api:search:messages:complete', response);
    },

    searchMessagesDetour : function(options, vCallback) {
        options = options == undefined ? {} : options;
        var page = options.page;
        var pageSize = options.pageSize;
        var filter = options.filter;
        var sort = options.sort;
        var request = APIMessage.searchMessages(page, pageSize, filter, sort);
        MessagingAPI.handleRequest(request, ServiceMessage.searchMessagesDetour_, vCallback);
    },

    searchMessagesDetour_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.pub('api:search:messages:detour:complete', response);
    },

    linkAttachment : function(mGuid, aGuid, vCallback) {
        mGuid = mGuid.replace(/-/g, '');
        aGuid = aGuid.replace(/-/g, '');
        var request = APIMessage.linkAttachment(mGuid, aGuid);
        MessagingAPI.handleRequest(request, ServiceMessage.linkAttachment_, vCallback);
    },

    linkAttachment_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.pub('api:link:attachment:complete', response);
    },

    unlinkAttachment : function(mGuid, aGuid, vCallback) {
        var request = APIMessage.unlinkAttachment(mGuid, aGuid);
        MessagingAPI.handleRequest(request, ServiceMessage.unlinkAttachment_, vCallback);
    },

    unlinkAttachment_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.pub('api:unlink:attachment:complete', response);
    },

    getMessage : function(options, vCallback) {
        options = options == undefined ? {} : options;
        var guid = options.messageGuid;
        var password = options.password;
        var request = APIMessage.getMessage(guid, password);
        MessagingAPI.handleRequest(request, ServiceMessage.getMessage_, vCallback);
    },

    getMessage_ : function(response, vCallback) {
        var hasHtmlTag = function(str) {
            var htmlTagRe = /<\/?[\w\s="/.':;#-\/\?]+>/gi;
            return htmlTagRe.test(str);
        }
        if(response.subject) {
            if (hasHtmlTag(response.subject)) {
                response.subject = striptags(response.subject, MessagingAPI.allowedTags, true)
            }
            response.subject = htmlEnDeCode.htmlDecode(response.subject);
        }
        if(response.body) {
            response.body = striptags(response.body, MessagingAPI.allowedTags, true);
        }
        if(vCallback) {
            vCallback(response);
        }
        App.vent.pub('api:get:message:complete', response);
    },

    getMessageList : function(page, pageSize, filterGroup, filterSearch, sortType, sortDirection, vCallback) {
        var request = APIMessage.getMessageList(page, pageSize, filterGroup, filterSearch, sortType, sortDirection);
        MessagingAPI.handleRequest(request, ServiceMessage.getMessageList_, vCallback);
    },

    getMessageList_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.pub('api:get:message:list:complete', response);
    },

    preCreateMessage : function(options, vCallback) {
        options = options == undefined ? {} : options;
        var actionCode = options.actionCode;
        var parentGuid = options.parentGuid;
        var password = options.password;
        var campaignGuid = options.campaignGuid;
        var request = APIMessage.preCreateMessage(actionCode, parentGuid, password, campaignGuid);
        MessagingAPI.handleRequest(request, ServiceMessage.preCreateMessage_, vCallback);
        return request.request;
    },
    preCreateMessage_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.pub('api:create:message:complete', response);
    },

    saveMessage : function(options, vCallback) {
        options = options == undefined ? {} : options;
        var messageGuid = options.messageGuid;
        if (options.guid && !messageGuid) {
            messageGuid = options.guid;
        }
        var subject = options.subject;
        var recipients = options.recipients ? options.recipients : {};
        var body = options.body;
        var bodyFormat = options.bodyFormat;
        var options = options.options;
        var request = APIMessage
                .saveMessage(messageGuid, subject, recipients.to, recipients.cc, recipients.bcc, body, bodyFormat, options.allowForward, options.allowReply, options.allowTracking, options.shareTracking, options.fyeoType, options.expiryDate, options.expiryGroup);
        MessagingAPI.handleRequest(request, ServiceMessage.saveMessage_, vCallback);
    },
    saveMessage_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.pub('api:save:message:complete', response);
    },

    sendMessage : function(messageGuid, password, createMembers, sendNotification, craCode, expiryDate, expiryGroup, vCallback) {
        var request = APIMessage.sendMessage(messageGuid, password, createMembers, sendNotification, craCode);
        MessagingAPI.handleRequest(request, ServiceMessage.sendMessage_, vCallback);
        return request.request;
    },
    sendMessage_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.pub('api:send:message:complete', response);
    },

    preCreateAttachments : function(messageGuid, attachmentPlaceholders, vCallback) {
        var request = APIMessage.preCreateAttachments(messageGuid, attachmentPlaceholders);
        MessagingAPI.handleRequest(request, ServiceMessage.preCreateAttachments_, vCallback);
    },
    preCreateAttachments_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.pub('api:create:attachments:complete', response);
    },
    uploadAttachmentChunk : function(attachmentGuid, chunkNumber, vCallback) {
        var request = APIMessage.uploadAttachmentChunk(attachmentGuid, chunkNumber);
        MessagingAPI.handleRequest(request, ServiceMessage.uploadAttachmentChunk_, vCallback);
    },
    uploadAttachmentChunk_ : function(response, vCallback) {
        if(vCallback) {
            vCallback(response);
        }
        App.vent.pub('api:upload:attachment:chunks:complete', response);
    }
};
