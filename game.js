
var paper = new Raphael(document.getElementById("board"), 800, 800);

function raphaelText(x, y) {
	return paper.text(x, y, "Current Player: Player1 --> Play a red");
}

function raphaelSquare(x, y, linesize) {
	return paper.rect(x, y, linesize, linesize);
}

function raphaelHex(x, y, linesize) {
	var thirtyRadians = 30 * (Math.PI / 180);
	var pathLine = '' +
		'M' + x + ' ' + y + (4 * (linesize * Math.cos(thirtyRadians) * (-1))) + ' '
		+ 'l' + (linesize / (2)) + ' ' + (linesize * Math.cos(thirtyRadians) * (-1)) + ' '
		+ 'h' + linesize + ' '
		+ 'l' + (linesize / (2)) + ' ' + (linesize * Math.cos(thirtyRadians) * (1)) + ' '
		+ 'l' + (linesize / (-2)) + ' ' + (linesize * Math.cos(thirtyRadians) * (1))
		+ 'h' + (-linesize)
		+ 'Z';

	return paper.path(pathLine);
}

// Hexagon constructor
function Hexagon(x, y, linesize, hexInColumn) {
	this.x = x;
	this.y = y;
	this.linesize = linesize;
	this.hexInColumn = hexInColumn;
	this.color = 99; /* color undefined (black) */
	this.defaultColor = "black";
	this.raphaelHex = raphaelHex(this.x, this.y, this.linesize);

} // End of Hexagon constructor

// Column object constructor
function Column(column, depth, minIndex, maxIndex, xOffset, yOffset, linesize) {
	this.column = column;
	this.depth = depth;
	this.minIndex = minIndex;
	this.maxIndex = maxIndex;
	this.xOffset = xOffset;
	this.yOffset = yOffset;
	this.linesize = linesize;
	this.cos = linesize * (Math.cos(30 * (Math.PI / 180)));
	this.hexes = new Array();

	//x and y are where we start drawing the top of column 1
	this.x = 150;
	this.y = 150;

	this.clickHandler = function (evt) {

		controller.hexSelected = true;
		controller.click++;
		if (controller.currentHexSelected) {
			controller.currentHexSelected.attr({ stroke: "gray" });
			controller.currentHexSelected.g.remove();
		}
		controller.currentHexSelected = this;
		this.toFront();
		this.g = this.glow({ color: "cyan", width: 25 });
		this.attr({ stroke: "cyan" });

		// If selected hex is black (empty)
		if (this.data("color") == 99) {

			// Initial player move
			if (!controller.moved) {
				board.square1.attr({ fill: controller.spectrum[controller.playerColors[controller.turn % 2]] });
				board.square2.attr({ fill: controller.spectrum[controller.playerColors[controller.turn % 2]] });
				board.square1.data("color", controller.playerColors[controller.turn % 2]);
				board.square2.data("color", controller.playerColors[controller.turn % 2]);

				controller.moved = true;

				// Yellow part of move
			} else {
				board.square1.attr({ fill: controller.spectrum[0] });
				board.square2.attr({ fill: controller.spectrum[0] });
				board.square1.data("color", 0);
				board.square2.data("color", 0);

				controller.movedYellow = true;
			}

			controller.currentHexSelected.attr({ fill: (board.square1.attr('fill')) });
			console.log("Just set the fill of the selected Hex.");
			controller.currentHexSelected.data("pendingColor", board.square1.data("color"));
			controller.completeTurn();

			// If selected hex already has a color
		} else {

			// Make the squares glow if not already glowing
			if (!board.square1.isGlowing) {
				board.square1.square1Glow = board.square1.glow({ color: "cyan", width: 25 });
				board.square1.attr({ stroke: "cyan" });
				board.square1.isGlowing = true;
				board.square2.square2Glow = board.square2.glow({ color: "cyan", width: 25 });
				board.square2.attr({ stroke: "cyan" });
				board.square2.isGlowing = true;
			}

			// Initial part of move (not yellow)
			if (!controller.moved) {
				// If current hex is yellow, need to wrap to green, since
				// apparently JS doesn't correctly handle negative modulo
				if (this.data("color") == 0) {
					board.square1.attr({ fill: controller.spectrum[5] });
					board.square1.data("color", 5);
					// selected hex is not yellow
				} else {
					board.square1.attr({ fill: controller.spectrum[(this.data("color") - 1) % 6] });
					board.square1.data("color", (this.data("color") - 1) % 6);
				}
				board.square2.attr({ fill: controller.spectrum[(this.data("color") + 1) % 6] });
				board.square2.data("color", (this.data("color") + 1) % 6);
				// Yellow part of move
			} else {
				// selected hex is already yellow
				if (this.data("color") == 0) {
					alert("Select another hex.  This one is already yellow.");
					return;
					// Selected hex is not yellow
				} else {

					// If hex is red, the only choice is orange
					if (this.data("color") == 2) {
						board.square1.attr({ fill: controller.spectrum[1] });
						board.square1.data("color", 1);
						board.square2.attr({ fill: controller.spectrum[1] });
						board.square2.data("color", 1);

						// If hex is blue, the only choice is green
					} else if (this.data("color") == 4) {
						board.square1.attr({ fill: controller.spectrum[5] });
						board.square1.data("color", 5);
						board.square2.attr({ fill: controller.spectrum[5] });
						board.square2.data("color", 5);

						// hex is neither red nor blue nor yellow
					} else {
						board.square1.attr({ fill: controller.spectrum[(this.data("color") - 1) % 6] });
						board.square1.data("color", (this.data("color") - 1) % 6);
						board.square2.attr({ fill: controller.spectrum[(this.data("color") + 1) % 6] });
						board.square2.data("color", (this.data("color") + 1) % 6);
					}
				} // Selected hex is not yellow	
			} // Yellow part of move
		} // Selected hex is not black
	} // End of hex click handler

	//
	// Method to draw the column instance
	//
	this.drawColumn = function () {

		//console.log ("drawColum(): in column: " + this.column);
		var currYOffset = this.yOffset;
		var index = 7 - this.depth
		//console.log("drawColumn(), depth: " + this.depth + " index: " + index);

		//
		// Main loop for drawing the seven columns
		//
		for (i = 0; i < this.depth; i++) {

			hex = new Hexagon(this.x + (this.xOffset * this.linesize), this.y + (currYOffset * this.cos), linesize, i);
			hex.raphaelHex.attr({ fill: hex.defaultColor });
			hex.raphaelHex.attr({ stroke: "gray" });
			hex.raphaelHex.attr("stroke-width", "2");
			hex.raphaelHex.data("color", 99);
			hex.raphaelHex.data("column", this.column);
			hex.raphaelHex.data("index", index);

			//
			// Event handler for clicking on a the current Raphael hex
			//
			hex.raphaelHex.click(this.clickHandler);

			currYOffset += 2;
			//this.hexes.push(hex);
			this.hexes[index] = hex;
			//console.log ("drawColum(): created hex index: " + index);
			index += 2;
		} // End of for loop in column (loop for each hex)
	}; // End of drawColumn function

} // end of Column contructor

function HorizontalRow(firstColumn, minIndex, maxIndex, length) {
	this.firstColumn = firstColumn;
	this.minIndex = minIndex;
	this.maxIndex = maxIndex;
	this.length = length;
}

function Blocked() {
	this.blockedColumn = undefined;
	this.blockedIndex = undefined;
	this.middle = undefined;
	this.above = undefined;
	this.below = undefined;
	this.upperRight = undefined;
	this.lowerRight = undefined;
	this.upperLeft = undefined;
	this.lowerLeft = undefined;

	this.yBlockedColumn = undefined;
	this.yBlockedIndex = undefined;
	this.yMiddle = undefined;
	this.yAbove = undefined;
	this.yBelow = undefined;
	this.yUpperRight = undefined;
	this.yLowerRight = undefined;
	this.yUpperLeft = undefined;
	this.yLowerLeft = undefined;
}

var boardReplacer = function (key, value) {
	console.log("boardReplacer: " + value);
	// Filtering out properties
	if (value instanceof Raphael) {
		return undefined;
	}
	return value;
}

var replacer = function (key, value) {
	console.log("replacer: " + value);
	// Filtering out properties
	if (value instanceof Raphael) {
		return undefined;
	}
	return value;
}

function Controller() {

	//
	// Color legend:
	// -------------
	// Yellow = 0
	// Orange = 1
	// Red    = 2
	// Purple = 3
	// Blue   = 4
	// Green  = 5
	//
	this.spectrum = ["yellow", "orange", "red", "purple", "blue", "green"];

	// stores the indexes of the players' colors in the "spectrum" array
	this.playerColors = [2, 4];

	this.defaultColor = "black";
	this.defaultColorNum = 99;

	this.player1 = 2; /* red */
	this.player2 = 4; /* blue */
	this.click = 0;

	// Turn:
	// turn % 2 = 0 ==> turn is red
	// turn % 2 = 1 ==> turn is blue
	this.turn = 0;
	this.mongoGameId;

	this.currentHexSelected = undefined;
	this.moved = false;
	this.movedYellow = false;
	this.hexSelected = false;
	this.blocked = new Array();

	this.blocked[0] = new Blocked(); //stores blocked cells based on Red's move
	this.blocked[1] = new Blocked(); //stores blocked cells based on Blue's move

	//console.log("this.turn: " + this.turn);
	this.gameOver = false;
	this.winningColor;
	this.incrementTurn = function () {
		this.turn++;
	}

	this.setMongoGameId = function (id) {
		this.mongoGameId = id;
	}

	this.checkColumn = function (columnIndex) {
		var count = 0;
		var playerColor = controller.playerColors[(controller.turn) % 2];
		var currentCellColor;
		var winner = false;

		for (var i = board.columns[columnIndex].minIndex; i <= board.columns[columnIndex].maxIndex; i = i + 2) {

			currentCellColor = board.columns[columnIndex].hexes[i].raphaelHex.data("color");

			if ((board.columns[columnIndex].hexes[i].raphaelHex.data("color") == playerColor) ||
				(board.columns[columnIndex].hexes[i].raphaelHex.data("color") == playerColor - 1) ||
				(board.columns[columnIndex].hexes[i].raphaelHex.data("color") == playerColor + 1)) {
				count++;
				//console.log("in equal");
				//console.log("count: " + count);
				if (count >= 5) {
					winner = true;
					break;
				}
			} else {
				count = 0;
			}
		}

		if (winner) {
			console.log(controller.spectrum[playerColor] + " wins!");
			controller.winningColor = playerColor;
			controller.endGame(playerColor);
		} else {
			//console.log("NOT A WINNER!   columnIndex: " + columnIndex);
		}
	}

	this.checkDownwardRow = function (rowIndex) {

		var count = 0;
		var playerColor = controller.playerColors[(controller.turn) % 2];
		var currentCellColor;
		var winner = false;
		var currentColumn = board.downwardRows[rowIndex].firstColumn;

		for (var i = board.downwardRows[rowIndex].minIndex; i <= board.downwardRows[rowIndex].maxIndex; i = i + 1) {

			currentCellColor = board.columns[currentColumn].hexes[i].raphaelHex.data("color");

			if ((currentCellColor == playerColor) ||
				(currentCellColor == playerColor - 1) ||
				(currentCellColor == playerColor + 1)) {
				count++;
				if (count >= 5) {
					winner = true;
					break;
				}
			} else {
				count = 0;
			}
			currentColumn += 1;
		}

		if (winner) {
			console.log(controller.spectrum[playerColor] + " wins!");
			controller.winningColor = playerColor;
			controller.endGame(playerColor);
		} else {
			//console.log("NOT A WINNER!  row: " + rowIndex);
		}
	}

	this.checkUpwardRow = function (rowIndex) {

		var count = 0;
		var playerColor = controller.playerColors[(controller.turn) % 2];
		var currentCellColor;
		var winner = false;
		var currentColumn = board.upwardRows[rowIndex].firstColumn;

		for (var i = board.upwardRows[rowIndex].minIndex; i >= board.upwardRows[rowIndex].maxIndex; i = i - 1) {

			currentCellColor = board.columns[currentColumn].hexes[i].raphaelHex.data("color");

			if ((currentCellColor == playerColor) ||
				(currentCellColor == playerColor - 1) ||
				(currentCellColor == playerColor + 1)) {
				count++;
				if (count >= 5) {
					winner = true;
					break;
				}
			} else {
				count = 0;
			}
			currentColumn += 1;
		}

		if (winner) {
			console.log(controller.spectrum[playerColor] + " wins!");
			controller.winningColor = playerColor;
			controller.endGame(playerColor);
		} else {
			//console.log("NOT A WINNER!  row: " + rowIndex);
		}

	}

	this.blockHex = function (hex) {

		hex.toFront();
		if (hex.g == undefined) {
			hex.g = hex.glow({ color: "white", width: 35 });
		}
		hex.attr({ stroke: "cyan" });
		hex.attr("stroke-width", "5");
		hex.unclick(Column.clickHandler);
	}

	this.unBlockHex = function (hex) {

		if (hex) {
			if (hex.g) {
				hex.g.remove();
				hex.g = undefined;
			}
			hex.attr({ stroke: "gray" });
			hex.attr("stroke-width", "2");
			hex.toFront();
			hex.click(board.columns[parseInt(hex.data("column")) - 1].clickHandler);
		}
	}

	this.blockHexes = function (c) {

		this.blockHex(c.middle);
		if (c.above) { this.blockHex(c.above); }
		if (c.below) { this.blockHex(c.below); }
		if (c.upperRight) { this.blockHex(c.upperRight); }
		if (c.lowerRight) { this.blockHex(c.lowerRight); }
		if (c.upperLeft) { this.blockHex(c.upperLeft); }
		if (c.lowerLeft) { this.blockHex(c.lowerLeft); }

		this.unBlockHex(c.yMiddle); //remove the glow from selecting this hex
		this.blockHex(c.yMiddle);
		if (c.yAbove) { this.blockHex(c.yAbove); }
		if (c.yBelow) { this.blockHex(c.yBelow); }
		if (c.yUpperRight) { this.blockHex(c.yUpperRight); }
		if (c.yLowerRight) { this.blockHex(c.yLowerRight); }
		if (c.yUpperLeft) { this.blockHex(c.yUpperLeft); }
		if (c.yLowerLeft) { this.blockHex(c.yLowerLeft); }

	}

	this.unBlockHexes = function (j) {

		console.log("unblock selected");
		this.unBlockHex(j.middle);
		if (j.above) { this.unBlockHex(j.above); j.above = undefined; }
		if (j.below) { this.unBlockHex(j.below); j.below = undefined; }
		if (j.upperRight) { this.unBlockHex(j.upperRight); j.upperRight = undefined; }
		if (j.lowerRight) { this.unBlockHex(j.lowerRight); j.lowerRight = undefined; }
		if (j.upperLeft) { this.unBlockHex(j.upperLeft); j.upperLeft = undefined; }
		if (j.lowerLeft) { this.unBlockHex(j.lowerLeft); j.lowerLeft = undefined; }

		this.unBlockHex(j.yMiddle);
		if (j.yAbove) { this.unBlockHex(j.yAbove); j.yAbove = undefined; }
		if (j.yBelow) { this.unBlockHex(j.yBelow); j.yBelow = undefined; }
		if (j.yUpperRight) { this.unBlockHex(j.yUpperRight); j.yUpperRight = undefined; }
		if (j.yLowerRight) { this.unBlockHex(j.yLowerRight); j.yLowerRight = undefined; }
		if (j.yUpperLeft) { this.unBlockHex(j.yUpperLeft); j.yUpperLeft = undefined; }
		if (j.yLowerLeft) { this.unBlockHex(j.yLowerLeft); j.yLowerLeft = undefined; }

	}
	this.setBlocked = function () {

		// Identify the hexes which cannot be played and make them glow
		var column = controller.currentHexSelected.data("column") - 1;
		var index = controller.currentHexSelected.data("index");

		var c = controller.blocked[controller.turn % 2];

		//initialize set of hexes to block to null, to allow for when selected hex is at edge of the board
		c.above = null; c.below = null; c.upperRight = null; c.lowerRight = null; c.upperLeft = null; c.lowerLeft = null;

		c.blockedColumn = column;
		c.blockedIndex = index;
		c.middle = controller.currentHexSelected;
		if (index - 2 >= board.columns[column].minIndex) { c.above = board.columns[column].hexes[parseInt(index - 2)].raphaelHex; }
		if (index + 2 <= board.columns[column].maxIndex) { c.below = board.columns[column].hexes[parseInt(index + 2)].raphaelHex; }
		if ((column + 1 <= 6) && (index - 1 >= board.columns[column + 1].minIndex)) { c.upperRight = board.columns[column + 1].hexes[parseInt(index - 1)].raphaelHex; }
		if ((column + 1 <= 6) && (index + 1 <= board.columns[column + 1].maxIndex)) { c.lowerRight = board.columns[column + 1].hexes[parseInt(index + 1)].raphaelHex; }
		if ((column - 1 >= 0) && (index - 1 >= board.columns[column - 1].minIndex)) { c.upperLeft = board.columns[column - 1].hexes[parseInt(index - 1)].raphaelHex; }
		if ((column - 1 >= 0) && (index + 1 <= board.columns[column - 1].maxIndex)) { c.lowerLeft = board.columns[column - 1].hexes[parseInt(index + 1)].raphaelHex; }
	}

	this.setYellowBlocked = function () {

		// Identify the hexes which cannot be played and make them glow
		var column = controller.currentHexSelected.data("column") - 1;
		var index = controller.currentHexSelected.data("index");

		var c = controller.blocked[controller.turn % 2];

		c.yBlockedColumn = column;
		c.yBlockedIndex = index;
		c.yMiddle = controller.currentHexSelected;
		if (index - 2 >= board.columns[column].minIndex) { c.yAbove = board.columns[column].hexes[parseInt(index - 2)].raphaelHex; }
		if (index + 2 <= board.columns[column].maxIndex) { c.yBelow = board.columns[column].hexes[parseInt(index + 2)].raphaelHex; }
		if ((column + 1 <= 6) && (index - 1 >= board.columns[column + 1].minIndex)) { c.yUpperRight = board.columns[column + 1].hexes[parseInt(index - 1)].raphaelHex; }
		if ((column + 1 <= 6) && (index + 1 <= board.columns[column + 1].maxIndex)) { c.yLowerRight = board.columns[column + 1].hexes[parseInt(index + 1)].raphaelHex; }
		if ((column - 1 >= 0) && (index - 1 >= board.columns[column - 1].minIndex)) { c.yUpperLeft = board.columns[column - 1].hexes[parseInt(index - 1)].raphaelHex; }
		if ((column - 1 >= 0) && (index + 1 <= board.columns[column - 1].maxIndex)) { c.yLowerLeft = board.columns[column - 1].hexes[parseInt(index + 1)].raphaelHex; }
	}

	this.makeSquaresBlack = function () {
		board.square1.attr({ fill: this.defaultColor });
		board.square1.data("color", this.defaultColorNum);
		board.square2.attr({ fill: this.defaultColor });
		board.square2.data("color", this.defaultColorNum);

		if (board.square1.square1Glow) {
			board.square1.square1Glow.remove();
			board.square2.square2Glow.remove();
			board.square1.isGlowing = false;
			board.square2.isGlowing = false;
		}
	}

	this.completeTurn = function (event) {

		controller.hexSelected = false;
		console.log("In completeTurn; controller.hexSelected: " + controller.hexSelected);

		controller.makeSquaresBlack();

		if (controller.moved == false) {
			alert("You need to make moves for your color and for yellow.");
			return;
		}

		if (controller.moved && !controller.movedYellow) {
			controller.currentHexSelected.data("color", controller.currentHexSelected.data("pendingColor"));

			// New Code
			var currColumn = controller.currentHexSelected.data("column") - 1;
			var currIndex = controller.currentHexSelected.data("index");
			board.columns[currColumn].hexes[currIndex].color = controller.currentHexSelected.data("pendingColor");
			console.log("!!!!!!!!!!!!!!!pendingColor" + board.columns[currColumn].hexes[currIndex].color);

			console.log("Player " + ((parseInt(controller.turn) % 2) + 1) + " completed first part of turn.");
			controller.hexSelected == false;

			strCurrTurn = "Current Player: Player" + (parseInt((controller.turn) % 2) + 1) + " --> Play a yellow";
			board.currentPlayerText.attr("text", strCurrTurn);

			// identify the hexes which should be blocked
			controller.setBlocked();

		}

		if (controller.moved && controller.movedYellow) {
			console.log("Player finishing turn: " + ((parseInt(controller.turn) % 2) + 1));

			controller.currentHexSelected.data("color", controller.currentHexSelected.data("pendingColor"));

			// New Code
			var currColumn = controller.currentHexSelected.data("column") - 1;
			var currIndex = controller.currentHexSelected.data("index");
			board.columns[currColumn].hexes[currIndex].color = controller.currentHexSelected.data("pendingColor");
			console.log("!!!!!!!!!!!!!!!pendingColor" + board.columns[currColumn].hexes[currIndex].color);

			// no need to unblock cells on first turn
			if (controller.turn) {
				controller.unBlockHexes(controller.blocked[(controller.turn - 1) % 2]);
			}

			controller.checkColumn(1);
			controller.checkColumn(2);
			controller.checkColumn(3);
			controller.checkColumn(4);
			controller.checkColumn(5);

			controller.checkDownwardRow(1);
			controller.checkDownwardRow(2);
			controller.checkDownwardRow(3);
			controller.checkDownwardRow(4);
			controller.checkDownwardRow(5);

			controller.checkUpwardRow(1);
			controller.checkUpwardRow(2);
			controller.checkUpwardRow(3);
			controller.checkUpwardRow(4);
			controller.checkUpwardRow(5);

			if (!controller.gameOver) {
				// identify the hexes which should be blocked and make them glow
				controller.setYellowBlocked();
				controller.blockHexes(controller.blocked[controller.turn % 2]);

				// increment to the next turn
				controller.incrementTurn();

				// call rest service here
				controller.updateStateInDB(controller.mongoGameId);

				// alert players to pass the game
				var currTurn = (parseInt(controller.turn) % 2) + 1;
				alert("Please pass game to player " + ((parseInt(controller.turn) % 2) + 1));

				// Update the text on the screen to direct the current player how to move
				strCurrTurn = "Current Player: Player" + currTurn + " --> Play a "
					+ controller.spectrum[controller.playerColors[controller.turn % 2]];
				board.currentPlayerText.attr("text", strCurrTurn);
				board.currentPlayerText.attr({ "fill": controller.spectrum[controller.playerColors[controller.turn % 2]] });

				// reset the player move indicators
				controller.moved = false;
				controller.movedYellow = false;

			} else { // if game over print game over message
				var str = controller.spectrum[controller.winningColor] + " WINS!!!";
				board.currentPlayerText.attr("text", str);
				board.currentPlayerText.attr({ "fill": controller.spectrum[controller.winningColor] });
			}
		}

	}

	this.endGame = function (playerColor) {
		console.log("XXXXXXXXXXXXXXXXX   IN endGame()    XXXXXXXXXXXXX");
		for (i = 0; i < board.columns.length; i++) {
			for (j = board.columns[i].minIndex; j <= board.columns[i].maxIndex; j = j + 2) {
				board.columns[i].hexes[j].raphaelHex.unclick(Column.clickHandler);
			}
		}
		controller.gameOver = true;
		//delete the cookie
		document.cookie = 'gameId=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	}

	this.getCookie = function (cname) {
		var name = cname + "=";
		var decodedCookie = decodeURIComponent(document.cookie);
		var ca = decodedCookie.split(';');
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}
		return "";
	}


	this.updateStateInDB = function (gameId) {
		var invocation = new XMLHttpRequest();
		var url = 'http://localhost:8080/cfast-status/' + gameId;
		console.log("PUT URL: " + url);
		console.log("GAME ID: " + this.mongoGameId);

		var gameStatus = Object.assign(board, controller);

		var statusString = JSON.stringify(gameStatus, ["columns", "hexes", "raphaelHex",
			"data", "color", "hexInColumn", "pendingColor",
			"attrs", "fill", "turn", "blocked", "blockedColumn", "blockedIndex", "yBlockedColumn", "yBlockedIndex"]);

		console.log("###gameStatus: " + statusString)

		/*
		var jsonString = JSON.stringify(board, ["columns", "hexes", "raphaelHex",
			"data", "color", "pendingColor",
			"attrs", "fill"]);

		console.log("jsonString: " + jsonString);
		*/
		invocation.open('PUT', url, true);
		invocation.setRequestHeader('Content-type', 'application/json; charset=utf-8');
		//withCredentials = true;

		//invocation.onreadystatechange = function () {
		invocation.onload = function () {
			if (this.readyState == 4 && this.status == 200) {
				var newBoard = JSON.parse(this.responseText);
				console.log("updated status: " + JSON.stringify(newBoard));

				/*newBoard.columns.forEach((cl, i) => {
					//console.log("columns[" + i + "]:" + JSON.stringify(cl));
					cl.hexes.forEach((hx, j) => {
						if (null != hx) {
							board.columns[i].hexes[j].color = hx.color;
							board.columns[i].hexes[j].raphaelHex.attr("fill", hx.raphaelHex.attrs.fill);
							board.columns[i].hexes[j].raphaelHex.data("color", hx.color);
						}
					});
				}); */
			}
		};

		invocation.send(statusString);
	}

	this.getStateFromDB = function (mongoGameId) {
		var invocation = new XMLHttpRequest();
		var url = 'http://localhost:8080/cfast-status/' + mongoGameId;
		/*var jsonString = JSON.stringify(board, ["columns", "hexes", "raphaelHex",
			"data", "color", "pendingColor",
			"attrs", "fill"]);*/

		var gameStatus = Object.assign(board, controller);

		var statusString = JSON.stringify(gameStatus, ["columns", "hexes", "raphaelHex",
			"data", "color", "pendingColor",
			"attrs", "fill", "turn", "blocked"]);

		console.log("###gameStatus: " + statusString)

		//console.log("jsonString: " + jsonString);
		invocation.open('GET', url, true);
		invocation.setRequestHeader('Content-type', 'application/json; charset=utf-8');
		//withCredentials = true;

		//invocation.onreadystatechange = function () {
		invocation.onload = function () {
			if (this.readyState == 4 && this.status == 200) {
				var newBoard = JSON.parse(this.responseText);
				console.log("updated board: " + JSON.stringify(newBoard));
				controller.turn = newBoard.turn;
				console.log("TURN from DB: " + controller.turn);
				newBoard.columns.forEach((cl, i) => {
					//console.log("columns[" + i + "]:" + JSON.stringify(cl));
					cl.hexes.forEach((hx, j) => {
						if (null != hx) {
							board.columns[i].hexes[j].color = hx.color;
							board.columns[i].hexes[j].raphaelHex.attr("fill", hx.raphaelHex.attrs.fill);
							board.columns[i].hexes[j].raphaelHex.data("color", hx.color);
						}
					});
				});

				// Update the text on the screen to direct the current player how to move
				strCurrTurn = "Current Player: Player" + parseInt((controller.turn % 2) + 1) + " --> Play a "
					+ controller.spectrum[controller.playerColors[controller.turn % 2]];
				board.currentPlayerText.attr("text", strCurrTurn);
				board.currentPlayerText.attr({ "fill": controller.spectrum[controller.playerColors[controller.turn % 2]] });
			}
		};

		invocation.send();
	}

	this.insertStateToDB = function () {
		var invocation = new XMLHttpRequest();
		var url = 'http://localhost:8080/cfast-status/';
		/*
		var jsonString = JSON.stringify(board, ["columns", "hexes", "raphaelHex",
			"data", "color", "pendingColor",
			"attrs", "fill"]);

		console.log("jsonString insert request: " + jsonString);
		var gameStatus = Object.assign(board, controller.turn); */

		var gameStatus = Object.assign(board, controller);

		var statusString = JSON.stringify(gameStatus, ["columns", "hexes", "raphaelHex",
			"data", "color", "pendingColor",
			"attrs", "fill", "turn", "blocked"]);

		console.log("###gameStatus: " + statusString)

		invocation.open('POST', url, true);
		invocation.setRequestHeader('Content-type', 'application/json; charset=utf-8');
		//withCredentials = true;

		//invocation.onreadystatechange = function () {
		invocation.onload = function () {
			if (this.readyState == 4 && this.status == 200) {
				var newBoard = JSON.parse(this.responseText);
				console.log("Inserted Board: " + JSON.stringify(newBoard));
				controller.mongoGameId = newBoard._id;
				console.log("###### _id: " + controller.mongoGameId);
				controller.turn = newBoard.turn;
				console.log("TURN from DB: " + controller.turn);
				newBoard.columns.forEach((cl, i) => {
					//console.log("columns[" + i + "]:" + JSON.stringify(cl));
					cl.hexes.forEach((hx, j) => {
						if (null != hx) {
							board.columns[i].hexes[j].color = hx.color;
							board.columns[i].hexes[j].raphaelHex.attr("fill", hx.raphaelHex.attrs.fill);
							board.columns[i].hexes[j].raphaelHex.data("color", hx.color);
						}
					});
				});
			}

			var myCookie = "gameId=" + controller.mongoGameId + ";max-age=2629746;path=/";
			document.cookie = myCookie;

			console.log("myCookie: " + myCookie);
			console.log("READ COOKIE: " + controller.getCookie("gameId"));
		};

		invocation.send(statusString);
	}



} // End of Controller constructor

// Board object constructor
function Board() {

	//set the linesize.  change this to be proportional to the screen size.
	this.linesize = 40;
	this.defaultColor = "black";
	this.columns = [];
	this.downwardRows = [];
	this.upwardRows = [];

	this.currentPlayerText = raphaelText(200, 550).attr({ fill: 'red' });
	this.currentPlayerText.attr("font-size", 16);
	this.square1 = raphaelSquare(500, 500, 50, 50);
	this.square2 = raphaelSquare(565, 500, 50, 50);

	this.square1.attr({ fill: this.defaultColor });
	this.square1.attr({ stroke: "gray" });
	this.square1.attr("stroke-width", "2");
	this.square2.attr({ fill: this.defaultColor });
	this.square2.attr({ stroke: "gray" });
	this.square2.attr("stroke-width", "2");

	this.square1.isGlowing = false;
	this.square2.isGlowing = false;

	this.col1 = new Column(1, 4, 3, 9, 0, 0, this.linesize);
	this.columns.push(this.col1);
	this.col2 = new Column(2, 5, 2, 10, 1.5, -1, this.linesize);
	this.columns.push(this.col2);
	this.col3 = new Column(3, 6, 1, 11, 3, -2, this.linesize);
	this.columns.push(this.col3);
	this.col4 = new Column(4, 7, 0, 12, 4.5, -3, this.linesize);
	this.columns.push(this.col4);
	this.col5 = new Column(5, 6, 1, 11, 6, -2, this.linesize);
	this.columns.push(this.col5);
	this.col6 = new Column(6, 5, 2, 10, 7.5, -1, this.linesize);
	this.columns.push(this.col6);
	this.col7 = new Column(7, 4, 3, 9, 9, 0, this.linesize);
	this.columns.push(this.col7);

	// function HorizontalRow (firstColumn, minIndex, maxIndex, length) {

	this.downRow1 = new HorizontalRow(3, 0, 3, 4);
	this.downwardRows.push(this.downRow1);
	this.downRow2 = new HorizontalRow(2, 1, 5, 5);
	this.downwardRows.push(this.downRow2);
	this.downRow3 = new HorizontalRow(1, 2, 7, 6);
	this.downwardRows.push(this.downRow3);
	this.downRow4 = new HorizontalRow(0, 3, 9, 7);
	this.downwardRows.push(this.downRow4);
	this.downRow5 = new HorizontalRow(0, 5, 10, 6);
	this.downwardRows.push(this.downRow5);
	this.downRow6 = new HorizontalRow(0, 7, 11, 5);
	this.downwardRows.push(this.downRow6);
	this.downRow7 = new HorizontalRow(0, 9, 12, 4);
	this.downwardRows.push(this.downRow7);

	// function HorizontalRow (firstColumn, minIndex, maxIndex, length) {

	this.upRow1 = new HorizontalRow(0, 3, 0, 4);
	this.upwardRows.push(this.upRow1);
	this.upRow2 = new HorizontalRow(0, 5, 1, 5);
	this.upwardRows.push(this.upRow2);
	this.upRow3 = new HorizontalRow(0, 7, 2, 6);
	this.upwardRows.push(this.upRow3);
	this.upRow4 = new HorizontalRow(0, 9, 3, 7);
	this.upwardRows.push(this.upRow4);
	this.upRow5 = new HorizontalRow(1, 10, 5, 6);
	this.upwardRows.push(this.upRow5);
	this.upRow6 = new HorizontalRow(2, 11, 7, 5);
	this.upwardRows.push(this.upRow6);
	this.upRow7 = new HorizontalRow(3, 12, 9, 4);
	this.upwardRows.push(this.upRow7);

	this.drawBoard = function () {
		this.col1.drawColumn();
		this.col2.drawColumn();
		this.col3.drawColumn();
		this.col4.drawColumn();
		this.col5.drawColumn();
		this.col6.drawColumn();
		this.col7.drawColumn();
	};

	this.setInitialThreeHexes = function () {

		this.col2.hexes[8].raphaelHex.data("color", 2);
		this.col2.hexes[8].raphaelHex.attr({ fill: "red" });
		this.col2.hexes[8].color = 2;

		this.col4.hexes[2].raphaelHex.data("color", 0);
		this.col4.hexes[2].raphaelHex.attr({ fill: "yellow" });
		this.col4.hexes[2].color = 0;

		this.col6.hexes[8].raphaelHex.data("color", 4);
		this.col6.hexes[8].raphaelHex.attr({ fill: "blue" });
		this.col6.hexes[8].color = 4;
	}

	this.square1.click(function (evt) {

		console.log("controller.hexSelected: " + controller.hexSelected);
		if (controller.hexSelected) {
			controller.currentHexSelected.attr({ fill: (board.square1.attr('fill')) });
			controller.currentHexSelected.data("pendingColor", board.square1.data("color"));
			if (controller.moved) {
				controller.movedYellow = true;
			} else {
				controller.moved = true;
			}
			controller.completeTurn();
		}
	})

	this.square2.click(function (evt) {

		console.log("controller.hexSelected: " + controller.hexSelected);
		if (controller.hexSelected) {
			controller.currentHexSelected.attr({ fill: (board.square2.attr('fill')) });
			controller.currentHexSelected.data("pendingColor", board.square2.data("color"));
			if (controller.moved) {
				controller.movedYellow = true;
			} else {
				controller.moved = true;
			}
			controller.completeTurn();
		}
	})
} // End of Board constructor

var board = new Board();
board.drawBoard();
board.setInitialThreeHexes();

var controller = new Controller();
controller.mongoGameId = controller.getCookie("gameId")
console.log("READ GAME ID FROM COOKIE: " + controller.mongoGameId);
if (controller.mongoGameId === "") {

	//comment the next three lines when mongo is available
	//console.log("creating a cookie");
	//var myCookie = "gameId=100;max-age=2629746;path=/";
	//document.cookie = myCookie;

	//uncomment the next two lines when mongo is available
	console.log("inserting to DB");
	controller.insertStateToDB();
} else {
	console.log("Getting state from DB.  Game id: " + controller.mongoGameId)
	controller.getStateFromDB(controller.mongoGameId);
}
