(function() {
  $("body").prepend($("<div id=\"shifty-spritz\" style=\"display: none;\" tabindex=\"1\"></div>").load(chrome.extension.getURL("index.html"), function() {
    var date, newDate, oldKeyCode, pressedTimeout, progressBarMouseDown, shiftySpritz, stop, timeDiff;
    shiftySpritz = {
      meta: {
        word: 0,
        enable: true,
        text: {},
        play: true,
        wpm: 60000 / 300,
        nextWordTimeout: 0,
        delay: 500,
        understoodChanges: false,
        $document: $(document),
        $shiftySpritz: $(this),
        $countdown: $("#shifty-spritz #countdown-shifty"),
        $words: $("#shifty-spritz #words-shifty"),
        $wordDivs: $("#shifty-spritz #words-shifty div"),
        $left: $("#shifty-spritz #left-shifty"),
        $center: $("#shifty-spritz #center-shifty"),
        $right: $("#shifty-spritz #right-shifty"),
        $progressBar: $("#shifty-spritz #progress-bar-shifty"),
        $progressSeek: $("#shifty-spritz #progress-bar-shifty #seek-shifty"),
        $progress: $("#shifty-spritz #progress-bar-shifty #progress-shifty"),
        $pausePlay: $("#shifty-spritz #pause-play-shifty"),
        $close: $("#shifty-spritz #close-shifty")
      },
      show: function() {
        this.meta.$shiftySpritz.css({
          "top": "0",
          "margin-top": "0",
          "display": "block"
        });
      },
      close: function() {
        shiftySpritz.meta.$shiftySpritz.css("display", "none");
      },
      empty: function(text) {
        return !!text.length;
      },
      getText: function(text) {
        var map;
        map = function(x) {
          var words;
          words = x.split(/\s+/g);
          words.push("");
          return words;
        };
        text = text.split(/[\n\r]+/g).filter(this.empty).map(map.bind(this)).reduce(function(a, b) {
          return a.concat(b);
        });
        text.pop();
        return text;
      },
      updateProgress: function() {
        this.meta.$progress.css("width", 100 / this.meta.text.length * this.meta.word + "%");
      },
      getWord: function() {
        return this.meta.text[this.meta.paragraph].words[this.meta.word];
      },
      splitWord: function(word) {
        var pivot;
        pivot = (function() {
          switch (false) {
            case !(word.length < 2):
              return 0;
            case !(word.length < 6):
              return 1;
            case !(word.length < 10):
              return 2;
            case !(word.length < 14):
              return 3;
            default:
              return 4;
          }
        })();
        return [word.substring(0, pivot), word.substring(pivot, pivot + 1), word.substring(pivot + 1)];
      },
      goFromPercent: function(percent, readNext) {
        this.meta.word = Math.floor(this.meta.text.length / 100 * percent);
        this.meta.$progress.css("width", percent + "%");
        clearTimeout(this.meta.nextWordTimeout);
        this.readNextWord(this.meta.wpm, readNext);
      },
      updateWordPositioning: function() {
        var offset;
        offset = $(window).width() % 2;
        this.meta.$center.css("margin-left", -(this.meta.$center.width() + offset) / 2 + "px");
        this.meta.$left.css("padding-right", (this.meta.$center.width() + offset) / 2 + "px");
      },
      readNextWord: function(delay, readNext) {
        var self, splitWord, wpm, _ref;
        if (delay == null) {
          delay = 0;
        }
        if (readNext == null) {
          readNext = true;
        }
        if (this.meta.word === this.meta.text.length) {
          return false;
        }
        self = this;
        wpm = this.meta.wpm;
        splitWord = this.splitWord(this.meta.text[this.meta.word]);
        wpm += ((_ref = this.meta.text[this.meta.word].slice(-1)) === "." || _ref === "," || _ref === "!" || _ref === "?" ? this.meta.wpm : 0);
        wpm += (this.meta.text[this.meta.word] === "" ? this.meta.wpm * 3 : 0);
        wpm += delay;
        this.meta.$left.html(splitWord[0]);
        this.meta.$center.html(splitWord[1]);
        this.meta.$right.html(splitWord[2]);
        this.updateWordPositioning();
        this.meta.word++;
        if (readNext) {
          this.updateProgress();
          this.meta.nextWordTimeout = setTimeout(function() {
            self.readNextWord();
          }, wpm);
        }
      },
      playPause: function(delay) {
        this.meta.$pausePlay.addClass((this.meta.play ? "fa-pause" : "fa-play")).removeClass((!this.meta.play ? "fa-pause" : "fa-play"));
        clearTimeout(this.meta.nextWordTimeout);
        !this.meta.play || this.readNextWord(delay);
      },
      play: function(delay) {
        this.meta.play = true;
        this.playPause(delay);
      },
      pause: function() {
        this.meta.play = false;
        this.playPause();
      },
      init: function(text, wpm) {
        this.meta.$countdown.css({
          "opacity": 1,
          "left": 0,
          "width": "100%"
        });
        this.meta.$countdown.animate({
          "opacity": 0,
          "left": "30%",
          "width": 0
        }, this.meta.delay);
        clearTimeout(this.meta.nextWordTimeout);
        this.meta.word = 0;
        this.meta.text = this.getText(text);
        this.play(this.meta.delay);
      }
    };
    progressBarMouseDown = false;
    chrome.storage.sync.get(["wpm", "color", "size", "style", "font", "enable", "delay", "understoodChanges"], function(value) {
      shiftySpritz.meta.wpm = 60000 / value.wpm || 60000 / 300;
      shiftySpritz.meta.$wordDivs.css({
        "font-size": parseInt(value.size || 25) + "px",
        "height": parseInt(value.size || 25) + 25 + "px",
        "line-height": parseInt(value.size || 25) + 25 + "px",
        "font-weight": value.style || "bold",
        "font-family": value.font || "'droid sans'"
      });
      shiftySpritz.meta.$center.css("color", value.color || "#fa3d3d");
      shiftySpritz.meta.enable = (typeof value.enable === "undefined" ? true : !!value.enable);
      shiftySpritz.meta.understoodChanges = !!value.understoodChanges;
      shiftySpritz.meta.delay = parseInt(value.delay || 500);
    });
    chrome.storage.onChanged.addListener(function(changes, namespace) {
      if (changes.wpm) {
        shiftySpritz.meta.wpm = 60000 / changes.wpm.newValue;
      }
      if (changes.size) {
        shiftySpritz.meta.$wordDivs.css({
          "font-size": parseInt(changes.size.newValue || 25) + "px",
          "height": parseInt(changes.size.newValue || 25) + 25 + "px",
          "line-height": parseInt(changes.size.newValue || 25) + 25 + "px"
        });
      }
      if (changes.style) {
        shiftySpritz.meta.$wordDivs.css({
          "font-weight": changes.style.newValue || "bold"
        });
      }
      if (changes.font) {
        shiftySpritz.meta.$wordDivs.css({
          "font-family": changes.font.newValue || "'droid sans'"
        });
      }
      if (changes.color) {
        shiftySpritz.meta.$center.css("color", changes.color.newValue || shiftySpritz.meta.$center.css("color"));
      }
      shiftySpritz.updateWordPositioning();
      if (changes.enable) {
        shiftySpritz.meta.enable = !!changes.enable.newValue;
        shiftySpritz.close();
      }
      if (changes.understoodChanges) {
        shiftySpritz.meta.understoodChanges = !!changes.understoodChanges.newValue;
      }
      if (changes.delay) {
        shiftySpritz.meta.delay = parseInt(changes.delay.newValue || 500);
      }
    });
    shiftySpritz.meta.$progressBar.mousedown(function(e) {
      shiftySpritz.goFromPercent(100 / shiftySpritz.meta.$progressBar.width() * (e.pageX + 6 - shiftySpritz.meta.$progressBar.offset().left), false);
      progressBarMouseDown = true;
    });
    shiftySpritz.meta.$progressBar.mousemove(function(e) {
      return shiftySpritz.meta.$progressSeek.css("left", Math.max(e.pageX - shiftySpritz.meta.$progressBar.offset().left, 6) + "px");
    });
    shiftySpritz.meta.$pausePlay.click(function() {
      if (shiftySpritz.meta.play) {
        return shiftySpritz.pause();
      } else {
        return shiftySpritz.play();
      }
    });
    shiftySpritz.meta.$close.click(function() {
      return shiftySpritz.close();
    });
    shiftySpritz.meta.$document.mouseup(function(e) {
      !progressBarMouseDown || shiftySpritz.goFromPercent(100 / shiftySpritz.meta.$progressBar.width() * Math.max(Math.min(e.pageX + 6 - shiftySpritz.meta.$progressBar.offset().left, shiftySpritz.meta.$progressBar.width()), 0), shiftySpritz.meta.play);
      progressBarMouseDown = false;
    });
    shiftySpritz.meta.$document.mousemove(function(e) {
      if (progressBarMouseDown) {
        shiftySpritz.goFromPercent(100 / shiftySpritz.meta.$progressBar.width() * Math.max(Math.min(e.pageX + 6 - shiftySpritz.meta.$progressBar.offset().left, shiftySpritz.meta.$progressBar.width()), 0), false);
      }
    });
    pressedTimeout = void 0;
    date = new Date().getTime();
    pressedTimeout = 0;
    newDate = 0;
    timeDiff = 0;
    stop = false;
    oldKeyCode = -1;
    shiftySpritz.meta.$document.keydown(function(e) {
      var selectedText;
      if (!(stop && e.keyCode === oldKeyCode)) {
        oldKeyCode = e.keyCode;
        stop = true;
        selectedText = window.getSelection().toString();
        if (e.shiftKey && e.keyCode === 16) {
          if (!shiftySpritz.meta.understoodChanges) {
            pressedTimeout = setTimeout(function() {
              shiftySpritz.meta.understoodChanges = confirm("Sorry for the inconvenience but I have changed the Shifty Spritz hotkeys. To start reading double tap SHIFT on some selected text. To pause and play press SHIFT + SPACE together. To close press ESC. If you click OK you will probably never see this message again!");
              return chrome.storage.sync.set({
                understoodChanges: shiftySpritz.meta.understoodChanges
              });
            }, 500);
          }
          date = newDate;
          newDate = new Date().getTime();
          timeDiff = newDate - date;
          if (timeDiff < 350 && shiftySpritz.meta.enable && selectedText.length) {
            newDate = 0;
            shiftySpritz.show();
            shiftySpritz.init(selectedText, 500);
          }
        } else if (e.keyCode === 27) {
          shiftySpritz.close();
        } else if (e.shiftKey && e.keyCode === 32 && shiftySpritz.meta.$shiftySpritz.css("display") === "block") {
          if (shiftySpritz.meta.play) {
            shiftySpritz.pause();
          } else {
            shiftySpritz.play();
          }
          e.preventDefault();
        }
        if (!e.shiftKey) {
          newDate = 0;
        }
      }
    });
    shiftySpritz.meta.$document.keyup(function(e) {
      stop = false;
      return clearTimeout(pressedTimeout);
    });
  }));

}).call(this);
