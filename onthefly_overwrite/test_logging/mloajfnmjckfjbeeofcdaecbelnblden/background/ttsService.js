window.dji=window.dji||{};
(function(b){function C(a){return a.replace(/(\w)([&#~$%*])(\d|\w)/g,function(a){return a[0]+" "+a[1]+" "+a[2]}).replace(/[()\[\]{}|]/g," ").replace(/[\u0022\u0060\u00B4\u2018\u2019\u201C\u201D]/g," ").replace(/\s+([.,:;])/g,function(a){return a[0]})}var r="",u="",t="",A="",g=[],h=-1,k=-1,l=-1,c=null,p=null,e=null,d=null,q=!1,v=!1,m=[];b.onError=null;b.onProgress=null;b.onStart=null;b.onStop=null;var E=function(a,n,f,D){r=a;q=!1;a:{if(window.dji.config.env().ttsServerURL)for(a=0;a<m.length;a++)if(m[a].voiceName===
n){u=m[a].voiceIdentifier;break a}q=!0;w(Error(n+" is not one of the known voices!"));b.onStop();u=void 0}t=JSON.parse(JSON.stringify(f));A=D;g=[];l=k=h=-1;p=c=null;v=!1},B=function(){b.onStart=b.onStart||function(){console.log("START PLAYBACK")};b.onProgress=b.onProgress||function(a,b){console.log(a,b)};b.onStop=b.onStop||function(){console.log("STOP PLAYBACK")};b.onError=b.onError||function(a){console.error(a)}},F=function(){if(c&&c.timings&&!(0>=c.timings.length)){for(var a=e.currentTime,n=!1,
f=0>k?0:k;f<c.timings.length;f++)if(a>c.timings[f][1]&&a<c.timings[f][2]){n=!0;if(f!==k){k=f;break}return}if(n)if(0>k)b.onProgress(0,-1);else a=c.timings[k][0],l=r.indexOf(a,l),0<=l&&(b.onProgress(l,l+a.length),l+=a.length)}},x=function(){q||(!v&&h+1<g.length?null===p?setTimeout(x,50):(h++,c=p,p=null,k=-1,e.onplaying=G,e.onended=x,e.onerror=H,e.src="data:audio/ogg;base64,"+c.audio,e.play()):y())},G=function(){null!==d&&(clearInterval(d),d=null);c&&c.timings&&0<c.timings.length&&(d=setInterval(F,50));
h+1<g.length&&z()},H=function(){w(Error("Failed to switch audio track"));y()},z=function(a){if(h+1>=g.length)w(Error("This should never happen, getNextAudioData() called at bad time "+(h+1)+">="+g.length));else{var b=C(r.substring(g[h+1][0],g[h+1][1])),b={method:"POST",responseType:"json",timeout:15E3,url:window.dji.config.env().ttsServerURL+"/v1/synthesize",query:{access_token:A},contentType:"application/json",content:JSON.stringify({voice:u,settings:{pitch:t.pitch,rate:t.rate,volume:t.volume},text:b})};
jsdapi.http.sendRequest(b,function(b){if(!b||b.error||1<z.counter)b={audio:"INVALID_STREAM_DATA"};p=b;a&&a()})}},y=function(){null!==d&&clearInterval(d);d=null;e&&e.pause();q||(b.onStop(),q=!0)},w=function(a){v=!0;null!==d&&clearInterval(d);d=null;b.onError(a)};B();var I=function(a){a=(new window.ParseEnglish).parse(a);var b=[],f=function(a){var c=0;if("SentenceNode"===a.type){for(var d=a.position.start.offset,e,c=0;c<a.children.length&&!(d+1E3>a.position.end.offset);c++)if(e=a.children[c],"PunctuationNode"===
e.type&&e.position.end.offset>d+600||"WhiteSpaceNode"===e.type&&e.position.end.offset>d+900||e.position.start.offset<d+1E3&&e.position.end.offset>=d+1E3)b.push([d,e.position.end.offset]),d=e.position.end.offset;a.position.end.offset>d&&b.push([d,a.position.end.offset])}else if(a.children)for(c=0;c<a.children.length;c++)f(a.children[c])};f(a);return b};b.play=function(a,c,d){B();E(a,c,d,window.jsdapi.getAuthToken());e=document.getElementById("dji-sru-tts-service-audio");g=I(r);z(function(){b.onStart();
x()})};b.stop=function(){y()};b.loadVoices=function(a){if(0<m.length)return a(m);var b={method:"GET",url:window.dji.config.env().ttsServerURL+"/v1/voices",timeout:5E3,responseType:"json"};jsdapi.http.sendRequest(b,function(b){if(0>=m.length){if(!b||b.error)return a(null);m=b}a(m)})};b.isOnlineVoice=function(a){return 0<a.indexOf("(Online)")}})(window.dji.tts_service=window.dji.tts_service||{});