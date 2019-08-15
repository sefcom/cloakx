var APIMessage = {
    apiRoute : '/messages',
    attachRoute : '/attachments',

    createAttachmentDownloadToken: function(guid, password) {
        var command = this.attachRoute + '/' + guid + '/downloadtoken';
        var data = {
            password: password
        };
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'POST', data, false);
    },

    getAttachmentDetails : function(guid) {
        var command = this.attachRoute + '/' + guid + '/details';
        var data = {
            attachmentGuid : guid
        };
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'GET', data, false);
    },

    trackPrintAttachment : function(guid) {
        var command = this.attachRoute + '/' + guid + '/tracking/print';
        var data = {
                attachmentGuid : guid
        };
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'POST', data);
    },

    trackPrintMessage : function(guid) {
        var command = this.apiRoute + '/' + guid + '/tracking/print';
        var data = {
                messageGuid : guid
        };
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'POST', data);
    },

    preCreateMessage : function(actionCode, parentGuid, password) {
        var command = this.apiRoute;
        var data = {
            actionCode : actionCode
        };
        if (parentGuid) {
            data.parentGuid = parentGuid;
        }
        if (password) {
            data.password = password;
        }
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'POST', data);
    },

    getSignatures : function(guid) {
        var command = this.attachRoute + '/' + guid + '/signatures';
        var data = {
            attachmentGuid: guid
        };

        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'GET', data);
    },


    getMessageTree : function(guid) {
        var command = this.apiRoute + '/' + guid + '/tree';
        var data = {
            messageGuid: guid
        };

        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'GET', data);
    },

    searchAttachments : function(page, pageSize, filter, sort) {
        var command = this.attachRoute + '/search';
        var data = {};
        if(page) {
            data.page = page;
        }
        if(pageSize) {
            data.pageSize = pageSize;
        }
        if(filter) {
            data.filter = JSV.stringify(filter);
        }
        if(sort) {
            data.sort = JSV.stringify(sort);
        } else {
            sort = {
                    type: 'sentOn',
                    direction: 'desc',
            };
            data.sort = JSV.stringify(sort);
        }
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'GET', data, true);
    },

    searchMessages : function(page, pageSize, filter, sort) {
        var command = this.apiRoute + '/search';
        var data = {};
        if(page) {
            data.page = page;
        }
        if(pageSize) {
            data.pageSize = pageSize;
        }
        if(filter) {
            data.filter = JSV.stringify(filter);
        }
        if(sort) {
            data.sort = JSV.stringify(sort);
        }

        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'GET', data, true);
    },

    getMessage : function(guid, password) {
        var command = this.apiRoute + '/' + guid, header = [];
        var data = {
            messageGuid: guid
        };

        if(password) {
            header.push({
                title: 'x-sm-password',
                value: Base64.encode(password)
            });
        }
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'GET', data, true, header);
    },
    getMessageList : function(page, pageSize, filterGroup, filterSearch, sortType, sortDirection) {
        var command = this.apiRoute + '/list';
        var data = {
            pageNumber : page,
            pageSize : pageSize,
            filter : {
                group : filterGroup,
                searchCriteria : filterSearch
            },
            sort : {
                type : sortType,
                direction : sortDirection
            }
        };
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'GET', data);
    },
    preCreateMessage : function(actionCode, parentGuid, password, campaignGuid) {
        var command = this.apiRoute;
        var data = {
            actionCode : actionCode
        };
        if (parentGuid) {
            data.parentGuid = parentGuid;
        }
        if (password) {
            data.password = password;
        }
        if (campaignGuid) {
            data.campaignGuid = campaignGuid;
        }
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'POST', data);
    },
    saveMessage : function(messageGuid, subject, to, cc, bcc, body, bodyFormat, allowForward, allowReply, allowTracking, shareTracking, fyeoType, expiryDate, expiryGroup) {
        var command = this.apiRoute + '/' + messageGuid + '/save';
        var data = {
            "messageGuid" : messageGuid,
            "to" : to ? to : [],
            "cc" : cc ? cc : [],
            "bcc" : bcc ? bcc : [],
            "messageOptions" : {
                "allowForward" : allowForward,
                "allowReply" : allowReply,
                "allowTracking" : allowTracking,
                "fyeoType" : fyeoType,
                "shareTracking" : shareTracking
            }
        };
        if(subject) {
            data.subject = subject;
        }
        if(body) {
            data.body = body;
        }
        if(bodyFormat) {
            data.bodyFormat = bodyFormat;
        }
        if(expiryDate) {
            data.expiryDate = expiryDate
        }
        if(expiryGroup) {
            data.expiryGroup = expiryGroup
        }
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'PUT', data);
    },
    sendMessage : function(messageGuid, password, createMembers, sendNotification, craCode) {
        var command = this.apiRoute + '/' + messageGuid + '/send';
        var data = {
                "messageGuid": messageGuid,
                "password": password,
                "inviteNewUsers": createMembers,
                "sendNotification": sendNotification
        };
        if(craCode) {
            data.craCode = craCode;
        }
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'PUT', data);
    },
    preCreateAttachments : function(messageGuid, attachmentPlaceholders) {
        var command = this.attachRoute + '/precreate';
        var data = {
                "messageGuid": messageGuid,
                "attachmentPlaceholders": attachmentPlaceholders

        };
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'POST', data);
    },
    uploadAttachmentChunk : function(attachmentGuid, chunkNumber) {
        var command = this.attachRoute + '/' + attachmentGuid + '/chunk/' + chunkNumber;
        var data = {
                "attachmentGuid": attachmentGuid,
                "chunkNumber": chunkNumber

        };
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'POST', data);
    },
    getAttachmentsUploadProgress : function(attachmentGuid) {
        var command = this.attachRoute + '/progress';
        var guidArray = [].concat(attachmentGuid);
        var data = {
                "attachmentGuids": JSV.stringify(guidArray),
        };
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'GET', data, true);
    },
    removeAttachment : function(messageGuid, attachmentGuid) {
        var command = this.apiRoute + '/' + messageGuid + this.attachRoute + '/' + attachmentGuid;
        var data = {
            messageGuid : messageGuid,
            attachmentGuid : attachmentGuid
        };
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'DELETE', data);
    },
    deleteAttachment : function(attachmentGuid) {
        var command = this.attachRoute + '/' + attachmentGuid;
        var data = {
            attachmentGuid : attachmentGuid
        };
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'DELETE', data);
    },
    linkAttachment : function(messageGuid, attachmentGuid) {
        var command = this.apiRoute + '/' + messageGuid + this.attachRoute + '/' + attachmentGuid + '/link';
        var data = {
            messageGuid : messageGuid,
            attachmentGuid : attachmentGuid
        };
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'PUT', data);
    },
    unlinkAttachment : function(messageGuid, attachmentGuid) {
        var command = this.apiRoute + '/' + messageGuid + this.attachRoute + '/' + attachmentGuid + '/unlink';
        var data = {
            messageGuid : messageGuid,
            attachmentGuid : attachmentGuid
        };
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'PUT', data);
    },

    downloadAttachment : function(attachmentGuid, name, download) {
        var command = this.attachRoute + '/' + attachmentGuid;
        var data = {
                "attachmentGuid": attachmentGuid,
                "preview": !download
        };
        return MessagingAPI.requestAttachment(MessagingAPI.vpsUrl, command, name, download, data, true);
    },
    downloadAttachmentChunk : function(attachmentGuid, chunkNumber, download) {
        var command = this.attachRoute + '/' + attachmentGuid + '/chunk/' + chunkNumber;
        var data = {
                "attachmentGuid": attachmentGuid,
                "chunkNumber": chunkNumber,
                "preview": !download
        };
        return MessagingAPI.requestAttachment(MessagingAPI.vpsUrl, command, name, download, data, true);
    },
    downloadAttachmentWithToken : function(token, name, download) {
        var command = this.attachRoute + '/download/' + token;
        var data = {
            "downloadToken": token,
            "preview": !download
        };
        return MessagingAPI.requestAttachment(MessagingAPI.vpsUrl, command, name, download, data, true);
    },
    updateAttachment : function(attachmentGuid, type) {
        var command = this.attachRoute + '/' + attachmentGuid;
        var data = {
            type : type,
            attachmentGuid : attachmentGuid
        };
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'PUT', data);
    },
    signAttachment : function(attachmentGuid, answer) {
        var command = this.attachRoute + '/' + attachmentGuid + '/signature';
        var data = {
            answer : answer,
            attachmentGuid : attachmentGuid
        };
        return MessagingAPI.request(MessagingAPI.vpsUrl, command, 'POST', data);
    },
};
