(function(eventName) {
  function createEvent(type, data) {
    switch (type) {
      case "keydown":
      case "keyup":
      case "keypress":
        return createKeyEvent(type, data);
      case "mousedown":
      case "mouseup":
      case "click":
        return createMouseEvent(type, data);
    }
    
    return null;
  }
  
  function createKeyEvent(type, data) {
    var evt = document.createEvent("Events");
    if (typeof evt.initEvent !== "function") throw new Error("The event object can't be initialized.");
    
    evt.initEvent(type, data["bubbles"], data["cancelable"]);
    
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        evt[key] = data[key];
      }
    }
    
    return evt;
  }
  
  function createMouseEvent(type, data) {
    return new MouseEvent(type, data);
  }
  
  // Dispatch the event
  document.body.addEventListener(eventName, function(e) {
    var detail = e.detail;
    
    var target = e.target;
    var type = detail["type"];
    var data = detail["data"];
    
    var evt = createEvent(type, data);
    if (!evt) {
      console.error("Unknown event object.");
      return;
    }
    
    if (target.tagName.toLowerCase() === "iframe") {
      /** @preserveTry */
      try {
        if (target && target.contentDocument && target.contentDocument.body) {
          target = target.contentDocument.body;
        } else if (target.contentDocument) {
          target = target.contentDocument;
        }
      } catch (e) {}
    }
    
    target.dispatchEvent(evt);
  });
}).call(this, "lingapps-dispatch-event");