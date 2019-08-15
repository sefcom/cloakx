(function(q){function w(a,c,b){if((c||b===f.Download)&&y(null,r.UserSettings,null)){a=a||{};var d=new jsdapi.sru.types.File(a?a.uuid:null,u.settingsUser);if(b==f.Update||b==f.Create)d.checksum=a.checksum,d.creationDate=a.creationDate,d.modifiedDate=a.modifiedDate,d.modifiedUuid=a.modifiedUuid,d.version=a.version||0;g.push({file:d,type:r.UserSettings,action:b,body:c,extra:a,session:null});1==g.length&&h==k.Idle&&m()}}function z(a,c){var b=null;c==f.Update&&(a.update||a["delete"])?(b={},a.update&&(b.update=
a.update),a["delete"]&&(b["delete"]=a["delete"])):c==f.Download&&a.download&&(b={download:a.download});if(b||y(null,r.Outlines,null))g.push({file:null,type:r.Outlines,action:c,body:b,extra:null,session:null}),1==g.length&&h==k.Idle&&m()}function y(a,c,b){a:{for(var d=0;d<g.length;d++){var f=g[d];if(!(a&&f.id!==a||f.type!==c||b&&f.action!==b)){a=d;break a}}a=-1}if(-1!==a){if(g[a].session)return!1;g.splice(a,1)}return!0}function m(a){l&&(x(),e.timer=setTimeout(B,a||0<g.length?e.timeout.near:e.timeout.far))}
function x(){e.timer&&(clearTimeout(e.timer),e.timer=null)}function B(){if(l&&v)return m(!1);h=k.Busy;x();if(l){var a=0<g.length?g[0]:null;null===a?C():a.type===r.UserSettings?D(a):a.type===r.Outlines?E(a):(g.splice(g.indexOf(a),1),h=k.Idle,m())}else h=k.Idle}function C(){var a=p,c=[{type:u.settingsUser},{type:u.privacyMode},{type:u.outlinesData}],b=!1,d=!0,g={settingsUpdates:!1},l=function(){e.checkFiles.max<=e.checkFiles.counter?(e.checkFiles.max=Math.min(5,e.checkFiles.max+1),e.checkFiles.counter=
0):e.checkFiles.counter++;b&&!d&&(e.checkFiles.counter=e.checkFiles.max=0);h=k.Idle;m();dji.utils.callListeners(t,"checkForUpdatesFinished",g)},r=function(){F(function(a){a?jsdapi.sru.updateMeasurements(a,function(a){dji.utils.callListeners(t,"measurementsSyncFinished",a&&!a.error,l)}):l()})};e.checkFiles.max<=e.checkFiles.counter?(b=!0,jsdapi.sru.checkForUpdates(c,function(b){if(a===p){if(b&&!b.error&&b.files){var c=b.files[u.privacyMode],c=c&&1===c.length?c[0]:null,e;a:{if(n.privacyModeAvailable)try{e=
n.privacyModeAvailable(c?"on"===c.comment:!1);break a}catch(l){}e=!1}e&&(d=!1);e=(e=b.files[u.settingsUser])&&1===e.length?e[0]:null;var k;a:{if(n.checkSettingsUpdate)try{k=n.checkSettingsUpdate(e);break a}catch(l){}k=f.None}if(k==f.Upload){var h;a:{if(n.needSettingsData)try{h=n.needSettingsData();break a}catch(l){}h=null}h&&(d=!1,w(h.fileInfo,h.data,f.Create))}else k==f.Download&&(d=!1,g.settingsUpdates=!0,w(e,null,f.Download));if(b=b.files[u.outlinesData]){var m;a:{if(n.checkOutlinesUpdate)try{m=
n.checkOutlinesUpdate(b);break a}catch(l){}m=null}m&&(d=!1,q.enqueueOutlinesData(m))}}r()}})):r()}function D(a){a.session=p;var c=function(){if(a.session===p){var b=g.indexOf(a);-1!=b&&g.splice(b,1);h=k.Idle;m()}},b=function(a){a&&!a.error&&dji.utils.callListeners(t,"settingsUpdateAvailable",a.file.toJSON());c()};a.action==f.Create||a.action==f.Update?jsdapi.sru.listFiles(a.file.type,null,function(d){if(a.session===p){if(!d||d.error)return c();(d=d.files&&0<d.files.length?d.files[0]:null)&&a.action==
f.Create&&(a.action=f.Update);a.action==f.Update?a.file.version==d.version?jsdapi.sru.updateFile(d,a.body,b):c():jsdapi.sru.createFile(a.file,a.body,b)}}):a.action==f.Download&&jsdapi.sru.downloadFile(a.file,"json",function(b){b&&dji.utils.callListeners(t,"settingsUpdateAvailable",a.extra.toJSON(),b);c()})}function E(a){a.session=p;var c=function(b){b&&!b.error&&dji.utils.callListeners(t,"outlinesUpdateAvailable",b);a.session===p&&(b=g.indexOf(a),-1!=b&&g.splice(b,1),h=k.Idle,m())};a.action==f.Update?
jsdapi.sru.comboUpdateOutlinesData(a.body,function(b){a.session===p&&c(b)}):a.action==f.Download&&jsdapi.sru.downloadOutlinesData(a.body,function(b){a.session===p&&c(b)})}function A(){return p=dji.utils.generateUUID()}function F(a){if(n.needMeasurementsData)try{return n.needMeasurementsData(a)}catch(c){}a(null)}var r={None:0,UserSettings:1,Outlines:2},f={None:0,Create:1,Update:2,Upload:3,Download:4},u={settingsUser:"settings/user",privacyMode:"settings/privacy/mode",outlinesData:"outlines/*"},k={Idle:0,
Busy:1},p=null,g=[],e={timer:null,timeout:{near:10,far:6E4},checkFiles:{max:0,counter:0}},h=k.Idle,l=!1,v=!1,t={checkForUpdatesFinished:[],settingsUpdateAvailable:[],measurementsSyncFinished:[],outlinesUpdateAvailable:[]},n={checkSettingsUpdate:null,needSettingsData:null,needMeasurementsData:null,checkOutlinesUpdate:null,privacyModeAvailable:null};q.ActionType=f;q.setDelegate=function(a,c){!n.hasOwnProperty(a)||null!==c&&"function"!=typeof c||(n[a]=c)};q.addEventListener=function(a,c){t.hasOwnProperty(a)&&
"function"==typeof c&&-1==t[a].indexOf(c)&&t[a].push(c)};q.start=function(){l||(A(),l=!0,v=!1,h=k.Idle,e.checkFiles.counter=0,e.checkFiles.max=0,m(!0))};q.stop=function(){l&&(x(),l=v=!1,h=k.Idle,e.checkFiles.counter=0,e.checkFiles.max=0,A(),g.slice(0,g.length))};q.pause=function(a){v=a};q.enqueueUserSettings=function(a,c){l&&w(a,c,a&&a.uuid?f.Update:f.Create)};q.enqueueOutlinesData=function(a){if(l&&a&&((a.update||a["delete"])&&z(a,f.Update),a.download)){if(a=a.download){for(var c=[],b=null,d=null,
e=["directories","outlines","sources","topics"],g=null,h=0;h<e.length;h++)if(g=e[h],a.hasOwnProperty(g)){if(b=a[g]){for(d=[];0<b.length;)d.push(b.splice(0,50));b=d}else b=null;if(b&&!(0>=b.length))for(var k=0;k<b.length;k++)d={download:{}},d.download[g]=b[k],c.push(d)}a=c}else a=null;if(a)for(c=0;c<a.length;c++)z(a[c],f.Download)}}})(window.sru.sync=window.sru.sync||{});