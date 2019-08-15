var extName = "Chord Assistent";
var defaultRowCount = 4;
var defaultColCount = 6;
var strings = ["E", "A", "D", "G", "B", "E"];

/*var availableChords = {
	"D": ["X", "X", "O", "1,2", "3,3", "2,2"], // D chord
	"C": ["X", "3,3", "2,2", "O", "1,1", "O"] // C chord
};*/

availableChords = {
	"E": ["O", "2,2", "3,2", "1,1", "O", "O"],
	"F": ["1,1", "3,3", "4,3", "2,2", "1,1", "1,1"],
	"G": ["2,3", "1,2", "O", "O", "O", "3,3"],
	"A": ["X", "O", "1,2", "2,2", "3,3", "O"],
	"B": ["X", "1,2", "3,4", "3,4", "3,4", "1,2"],
	"C": ["X", "3,3", "2,2", "O", "1,1", "O"],
	"D": ["X", "X", "O", "1,2", "3,3", "2,2"],
	"Em": ["O", "2,2", "3,2", "O", "O", "O"],
	"Fm": ["1,1", "3,3", "4,3", "1,1", "1,1", "1,1"],
	"Gm": ["1,3", "3,5", "4,5", "1,3", "1,3", "1,3"],
	"Am": ["X", "O", "2,2", "3,2", "1,1", "O"],
	"Bm": ["X", "1,2", "3,4", "4,4", "2,3", "1,2"],
	"Cm": ["X", "1,1", "3,3", "4,3", "2,2", "1,1"],
	"Dm": ["X", "X", "O", "2,2", "3,3", "1,1"],
	"E7": ["O", "2,2", "O", "1,1", "O", "O"],
	"F7": ["1,1", "3,3", "1,1", "2,2", "1,1", "1,1"],
	"G7": ["3,3", "2,2", "O", "O", "O", "1,1"],
	"A7": ["X", "O", "1,2", "O", "3,2", "O"],
	"B7": ["X", "2,2", "1,1", "3,2", "O", "4,2"],
	"C7": ["X", "3,3", "2,2", "4,3", "1,1", "O"],
	"D7": ["X", "X", "O", "2,2", "1,1", "3,2"],
	"Emaj7": ["O", "3,2", "1,1", "2,1", "O", "O"],
	"Fmaj7": ["X", "X", "4,3", "3,2", "2,1", "O"],
	"Gmaj7": ["3,3", "2,2", "O", "O", "O", "1,2"],
	"Amaj7": ["X", "O", "2,2", "1,1", "3,2", "O"],
	"Bmaj7": ["X", "1,2", "3,4", "2,3", "4,4", "1,2"],
	"Cmaj7": ["X", "3,3", "2,2", "O", "O", "O"],
	"Dmaj7": ["X", "X", "O", "1,2", "1,2", "1,2"],
	"Em7": ["O", "2,2", "2,2", "O", "4,3", "O"],
	"Fm7": ["1,1", "3,3", "1,1", "1,1", "1,1", "1,1"],
	"Gm7": ["1,3", "3,5", "1,3", "1,3", "1,3", "1,3"],
	"Am7": ["X", "O", "2,2", "O", "1,1", "O"],
	"Bm7": ["X", "2,2", "O", "3,2", "O", "4,2"],
	"Cm7": ["X", "1,3", "3,5", "1,3", "2,4", "1,3"],
	"Dm7": ["X", "X", "O", "2,,", "1,1", "1,1"],
	"Esus2": ["X", "1,2", "1,2", "3,4", "4,5", "1,1"],
	"Fsus2": ["X", "X", "1,3", "3,5", "4,6", "1,1"],
	"Gsus2": ["3,3", "O", "O", "O", "X", "X"],
	"Asus2": ["X", "O", "1,2", "2,2", "O", "O"],
	"Bsus2": ["X", "1,2", "3,4", "4,4", "1,2", "1,2"],
	"Csus2": ["X", "3,3", "O", "O", "1,1", "X"],
	"Dsus2": ["X", "X", "O", "1,2", "3,3", "O"],
	"Esus4": ["O", "2,2", "3,2", "4,2", "O", "O"],
	"Fsus4": ["1,1", "1,1", "3,3", "4,3", "1,1", "1,1"],
	"Gsus4": ["3,3", "4,3", "O", "O", "X", "X"],
	"Asus4": ["X", "O", "1,2", "2,2", "4,3", "O"],
	"Bsus4": ["X", "1,2", "2,4", "3,4", "4,5", "1,2"],
	"Csus4": ["X", "3,3", "4,3", "O", "1,1", "X"],
	"Dsus4": ["X", "X", "O", "1,2", "3,3", "4,3"],
	"E5": ["O", "1,2", "2,2", "X", "X", "X"],
	"F5": ["1,1", "3,3", "4,3", "X", "X", "X"],
	"G5": ["1,3", "3,5", "4,5", "X", "X", "X"],
	"A5": ["X", "O", "1,2", "2,2", "X", "X"],
	"B5": ["X", "1,2", "3,4", "4,4", "X", "X"],
	"C5": ["X", "1,3", "3,5", "4,5", "X", "X"],
	"D5": ["X", "X", "O", "1,2", "2,3", "X"]
};

var _mouseOver = false;
var _flag = false;

function clearFretboard () {
	// reset dots
	var cells = document.getElementsByClassName("col");
	for (var i = 0; i < cells.length; i++) {
		var cell = cells[i];
		if (cell.childNodes.length > 0) {
			cell.removeChild(cell.getElementsByClassName("dot")[0]);
		}
	}

	// reset string status
	var stringStatus = document.getElementsByClassName("string-status");
	for (var i = 0; i < stringStatus.length; i++) {
		var curr = stringStatus[i];
		if (curr.childNodes.length > 0) {
			curr.removeChild(curr.getElementsByClassName("circle")[0]);
		}
	}	
}

function createFretboard(height) {
	// create wrapper
	var wrapper = document.createElement("div");
	wrapper.setAttribute("class", "wrapper");

	// set top portion of the popup
	var fretboardHeading = document.createElement("div");
	fretboardHeading.setAttribute("class", "fretboard-heading");

	// create title row
	var titleRow = document.createElement("div");
	titleRow.setAttribute("class", "fretboard-title-row")
	var logo = document.createElement("div");
	logo.setAttribute("class", "fretboard-logo");
	var img = document.createElement("img");
	img.setAttribute("src", chrome.extension.getURL("img/logo-lg.png"));
	img.setAttribute("height", "29");
	logo.appendChild(img);
	var title = document.createElement("div");
	title.setAttribute("class", "fretboard-title");
	title.setAttribute("id", "fretboard-title");
	// create label for the currently displaying chord
	var chordLabel = document.createTextNode("");
	title.appendChild(chordLabel);
	
	titleRow.appendChild(logo);
	titleRow.appendChild(title);

	// append title row
	fretboardHeading.appendChild(titleRow);

	// create details row
	var detailsRow = document.createElement("div");
	detailsRow.setAttribute("class", "fretboard-details");

	// create cells to show information about strings
	for (var i = 0; i < defaultColCount; i++) {
		// create cell
		var detailCell = document.createElement("div");
		detailCell.setAttribute("class", "detail-cell");
		// add string label
		var stringLabel = document.createTextNode(strings[i]);
		detailCell.appendChild(stringLabel);
		// add placehoder for string status (whether open or close when strumming)
		var stringStatus = document.createElement("div");
		stringStatus.setAttribute("class", "string-status");
		detailCell.appendChild(stringStatus);

		// append cell to the row
		detailsRow.appendChild(detailCell);
	}
	// append details row
	fretboardHeading.appendChild(detailsRow);

	wrapper.appendChild(fretboardHeading);
	// done

	// create fretboard
	var fretboard = document.createElement("div");
	fretboard.setAttribute("class", "fretboard");
	fretboard.setAttribute("id", "fretboard");

	// create rows
	for (var i = 0; i < height; i++) {
		var row = document.createElement("div");
		row.setAttribute("class", "row");

		// create columns
		for (var j = 0; j < defaultColCount; j++) {
			var col = document.createElement("div");
			col.setAttribute("class", "col");

			row.appendChild(col);
		}
		
		fretboard.appendChild(row); 
	}
	
	wrapper.appendChild(fretboard);
	
	return wrapper;
}

function generateFingerPattern(chord) {
	clearFretboard();

	var pattern = availableChords[chord];
	var detailCells = document.getElementsByClassName("detail-cell");

	for (var i = 0; i < pattern.length; i++) {
		var val = pattern[i];

		if (val === "X" || val === "O") {
			var circle = document.createElement("div");
			circle.setAttribute("class", "circle");

			var text = document.createTextNode(val);
			circle.appendChild(text);

			var stringStatus = detailCells[i].getElementsByClassName("string-status")[0];
			stringStatus.appendChild(circle);
		/*} else if (val === "O") {
			detailCells[i].getElementsByClassName("string-status")[0].innerHTML = "0";*/
		} else {
			var params = val.split(",");
			var finger = params[0];
			var fret = params[1];

			addFinger(fret - 1, i, finger);
		}
	}
}

function addFinger(rowId, colId, fingerId) {
	var fretboard = document.getElementById("fretboard");

	var row = fretboard.getElementsByClassName("row")[rowId];
	var cell = row.getElementsByClassName("col")[colId];

	if (cell.childNodes.length === 0) {
		// create dot
		var dot = document.createElement("span");
		dot.setAttribute("class", "dot");

		// add finger id
		var text = document.createTextNode(fingerId);
		dot.appendChild(text);

		cell.appendChild(dot);
	} else {
		// console.log("Already has a finger.");
	}
}

function changeChordTitle (chord) {
	var text = document.createTextNode(chord);
	var title = document.getElementById("fretboard-title");
	title.removeChild(title.childNodes[0]);
	title.appendChild(text);
}

function renderBubble(mouseX, mouseY, chord) {
	var bubble = document.getElementById("bubble");

	generateFingerPattern(chord);

	bubble.style.top = mouseY + document.body.scrollTop + 'px';
	bubble.style.left = mouseX + 'px';
	/*bubble.style.visibility = 'visible';*/

	bubble.setAttribute("class", "bubble active");
}

function hideBubble () {
	if (!_mouseOver) {
		var bubble = document.getElementById("bubble");
		bubble.setAttribute("class", "bubble");

		setTimeout(function() {
			bubble.style.top = "";
			bubble.style.left = "";
			bubble.setAttribute("class", "bubble hidden")
		}, 1000);
	}
}

function setFlag() {
	var currUrl = window.location.origin;
	// console.log(currUrl);

	var allowList = [];
	chrome.storage.sync.get(["fretboardsites"], function(result) {
        allowList = result["fretboardsites"];
        var index = allowList.indexOf(currUrl);
	    // console.log(allowList.length);
	    // console.log(index);
		if (index >= 0) {
			_flag = true;
		} else {
			_flag = false;
		}
		// console.log(_flag);
    });
}

function createBubble() {
	var bubble = document.createElement('div');
	
	bubble.setAttribute('class', 'bubble');
	bubble.setAttribute('id', 'bubble');
	bubble.appendChild(createFretboard(defaultRowCount));

	document.body.appendChild(bubble);
}

window.onload = function() {
	setFlag();
	createBubble();

	document.body.ondblclick = function(e) {
		// console.log(_flag);
		if (_flag) {
			// console.log(window.getSelection().toString());
		   	var chord = window.getSelection().toString().trim();

		   	// check whether a word is selected
			if (chord.length > 0) {
				// check whether the selected word is in the map
				if ((chord in availableChords)) {
					changeChordTitle(chord);

					renderBubble(e.clientX - 2, e.clientY - 2, chord);	
				} else {
					// console.log("The selected chord is not in the map.");
				}
			} else {
				// console.log("No chord have been selected.");
			}
		}
	};

	document.getElementById("bubble").onmouseleave = function(){
		_mouseOver = false;
		document.getElementById("bubble").style.opacity = "0.7";
		setTimeout(hideBubble, 1000);
	};

	document.getElementById("bubble").onmouseover = function(){
		document.getElementById("bubble").style.opacity = "0.9";
		_mouseOver = true;
	};

	// Listen for messages from the popup
	chrome.runtime.onMessage.addListener(function (msg, sender, response) {
	  if ((msg.from === 'FRETBOARD_POPUP') && (msg.subject === 'FRETBOARD_NEW_URL')) {
	    setFlag();
	  } else if ((msg.from === 'FRETBOARD_OPTIONS') && (msg.subject === 'FRETBOARD_UPDATE_URLS')) {
		setFlag();
	  }
	});
};