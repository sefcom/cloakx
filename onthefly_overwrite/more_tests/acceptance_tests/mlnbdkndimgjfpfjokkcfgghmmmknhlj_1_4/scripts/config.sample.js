'use strict';

var config = {
  local: {
    iframeUrl: "http://localhost:1111/app/ref?type=extension&",
    isLoggedUrl: "http://localhost:1111/api/enter/islogged",
    windowUrl: "http://localhost:1111/app/ref?type=extension/#login"
  },
  development: {
    iframeUrl: "https://dev.kuku.io/app/ref?type=extension&",
    isLoggedUrl: "https://dev.kuku.io/api/enter/islogged",
    windowUrl: "https://dev.kuku.io/app/ref?type=extension/#login"
  },
  staging: {
    iframeUrl: "https://staging.kuku.io/app/ref?type=extension&",
    isLoggedUrl: "https://staging.kuku.io/api/enter/islogged",
    windowUrl: "https://staging.kuku.io/app/ref?type=extension/#login"
  },
  produnction: {
    iframeUrl: "https://kuku.io/app/ref?type=extension&",
    isLoggedUrl: "https://kuku.io/api/enter/islogged",
    windowUrl: "https://kuku.io/app/ref?type=extension/#login"
  }
};

//add return config.local || config.development || config.produnction
window.kukuConfig = config.development;