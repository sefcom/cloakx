window.jsdapi=window.jsdapi||{};
(function(c){var b="https://citations.donjohnston.net",d=b+"/api";c.setServerUrl=function(a){b=a;d=b+"/api"};c.search=function(a,e){jsdapi.authorize(function(b){b?jsdapi.http.sendRequest({timeout:3E5,responseType:"json",method:"GET",url:d,query:{q:a.query,mt:a.materialType}},function(a){f(e,a)}):f(e,{error:401,message:"Authorization failed!"})})};var f=function(a){if(a)try{a.apply(this,[].slice.call(arguments).splice(1))}catch(b){dji.logger.error(b)}}})(window.jsdapi.citations=window.jsdapi.citations||
{});
