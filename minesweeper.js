const prompt = require('prompt');
prompt.start();

function onErr(err) {
  console.log(err);
  return 1;
}


class Game {
  constructor(rows, cols) {
    this.board = new Board(rows, cols);
  }

  run() {
    console.log("Welcome to minesweeper!");
    // while (!this.board.won) { // THIS DOESN'T WORK SYNCHRONOUSLY
    this.playTurn();
    // }
    // console.log("You won!");
  }

  playTurn() {
    this.board.render();
    this.getInput((x, y) => {
      if (this.board.checkMine(x, y)) {
        console.log("You hit a mine! Game over.");
        return;
      }
      else {
        this.board.revealSquare(x, y);
      }
    });
  }

  getInput(callback) {
    console.log("Enter x coordinate between 0 and " + this.board.height());
    console.log("Enter y coordinate between 0 and " + this.board.width());
    prompt.get(['x', 'y'], (err, result) => {
      if (err) { return onErr(err); }
      callback(result.y, result.x);
    });
  }
}


class Board {
  constructor(rows, cols) {
    this.grid = [];
    this.createGrid(rows, cols);
    this.populateGrid(rows * 2);
  }

  createGrid(rows, cols) {
    for (let i = 0; i < rows; i++) {
      this.grid.push([]);
      for (let j = 0; j < cols; j++) {
        this.grid[i].push(new Square());
      }
    }
  }

  populateGrid(numMines) {
    let minesCount = 0;
    while (minesCount < numMines) {
      let x = Math.floor(Math.random() * this.width());
      let y = Math.floor(Math.random() * this.height());
      let square = this.grid[x][y];

      if (!square.mine) {
        square.setMine();
        minesCount++;

        this.adjacentSquares(x, y).forEach(square => {
          square.adjacentMines++;
        });
      }
    }
  }

  adjacentPositions(x, y) {
    let diffs = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    let positions = [];
    diffs.forEach(pos => {
      let newX = x + pos[0];
      let newY = y + pos[1];

      if (this.inBounds(newX, newY)) {
        positions.push([newX, newY]);
      }
    });
    return positions;
  }

  adjacentSquares(x, y) {
    return this.adjacentPositions(x, y).map(pos => this.grid[pos[0]][pos[1]]);
  }

  checkMine(x, y) {
    if (this.inBounds(x, y)) {
      return this.grid[x][y].mine;
    }
  }

  revealSquare(x, y) {
    let square = this.grid[x][y];
    if (square.mine || square.revealed || square.flagged) {
      return;
    }
    else if (square.adjacentMines != 0) {
      return square.reveal();
    }
    else {
      square.reveal();
      this.adjacentPositions(x, y).forEach(pos => {
        this.revealSquare(pos[0], pos[1]);
      });
    }
  }

  inBounds(x, y) {
    return (x >= 0 && y >= 0 && x < this.width() && y < this.height());
  }

  width() {
    return this.grid.length;
  }

  height() {
    return this.grid[0].length;
  }

  won() {
    let won = true;
    this.grid.forEach(row => {
      row.forEach(square => {
        if (!square.revealed && !square.mine) {
          won = false;
        }
      });
    });
    return won;
  }

  render() {
    this.grid.forEach(row => {
      let rowString = row.map(square => square.toString()).join("");
      console.log("|" + rowString + "|");
    });
  }
}


class Square {
  constructor() {
    this.flagged = false;
    this.mine = false;
    this.revealed = false;
    this.adjacentMines = 0;
  }

  toggleFlag() {
    this.flagged = !this.flagged;
  }

  setMine() {
    this.mine = true;
  }

  reveal() {
    this.revealed = true;
  }

  toString() {
    if (this.revealed) {
      return String(this.adjacentMines);
    }
    else if (this.flagged) {
      return "f";
    }
    else {
      return "-";
    }
  }
}


// SQUARE CLASS
// constructor
s = new Square();
console.log(s.flagged === false);
console.log(s.mine === false);
console.log(s.revealed === false);
console.log(s.adjacentMines === 0);
// toString for unrevealed square
console.log(s.toString() === "-");
// toggleFlag
s.toggleFlag();
console.log(s.flagged === true);
console.log(s.toString() === "f");
s.toggleFlag();
console.log(s.toString() === "-");
// setMine
s.setMine();
console.log(s.mine === true);
// reveal
t = new Square();
t.reveal();
console.log(t.revealed === true);
// toString for revealed square
console.log(t.toString() === "0");

// BOARD CLASS
// createGrid
b = new Board(10, 20);
console.log(b.grid.length === 10);
console.log(b.grid[0].length === 20);
console.log(b.grid[0][0] instanceof Square);
// adjacentPositions
positions = b.adjacentPositions(2, 2);
console.log(positions.every(pos => b.inBounds(pos[0], pos[1])));
// adjacentSquares
squares = b.adjacentSquares(2, 2);
console.log(squares.every(square => square instanceof Square));
// inBounds
console.log(b.inBounds(-2, 3) === false);
console.log(b.inBounds(2, 3) === true);
console.log(b.inBounds(30, 3) === false);
// width and height
console.log(b.width() === 10);
console.log(b.height() === 20);

// GAME CLASS
// run
g = new Game(10, 20);
g.run();
