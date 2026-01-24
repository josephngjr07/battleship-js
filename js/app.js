const optionContainer = document.querySelector("#options-container")
const gameBoardsContainer = document.querySelector("#game-boards")

//Flip Button
const flipButton = document.querySelector('#flip-button')

const placedShips = new Set()

// store each ship's cells so we can detect "sunk" and "win"
const shipLocations = {
  player: {},   // { destroyer: [..], ... }
  computer: {}, // { destroyer: [..], ... }
};

// Creating Ship Options
let angle = 0

function flip() {
  const shipOptions = Array.from(optionContainer.children)
  angle = angle === 0 ? 90 : 0
    shipOptions.forEach(shipOption => shipOption.style.transform = `rotate(${angle}deg)`)
}

flipButton.addEventListener('click', flip)


//Creating Game Boards
const width = 10

function createBoards(user) {
    const gameBoard = document.createElement("div")
    gameBoard.classList.add("game-board")
    gameBoard.id = user
 
    for(let i = 0; i < width * width; i++) {
       const block = document.createElement("div")
       block.classList.add("block")
       block.id = i;
       gameBoard.append(block)
    }
       gameBoardsContainer.append(gameBoard)
}

createBoards("player")
createBoards("computer")

//Creating Ships 

class Ship {
    constructor(name, length) {
        this.name = name
        this.length = length
    }
}

const destroyer = new Ship('destroyer', 2)
const submarine = new Ship('submarine', 3)
const cruiser = new Ship('cruiser', 3)
const battleship = new Ship('battleship', 4)
const carrier = new Ship('carrier', 5)



const ships = [destroyer, submarine, cruiser, battleship, carrier]


// Creating Ship in an Array
function buildShip(isHorizontal, startIndex, length, width) {
  const shipBlocks = []
  for (let i = 0; i < length; i++) {
    if (isHorizontal) {
      shipBlocks.push(startIndex + i)
    } else {
      shipBlocks.push(startIndex + i * width)
    }
  }
  return shipBlocks
}

// Overflow Check (Does this fit on the board?)
function fitsOnBoard(startIndex, isHorizontal, length, width) {
  const startCol = startIndex % width
  const startRow = Math.floor(startIndex / width)

  return isHorizontal
    ? startCol + length <= width
    : startRow + length <= width
}

// Overlapping checks
function overlaps(shipBlocks, blocks) {
  return shipBlocks.some(squareIndex => blocks[squareIndex].classList.contains("taken"))
}



// Place ship after overflow + overlap validation
function addShipPiece(user, ship, startId) {
  const blocks = document.querySelectorAll(`#${user} .block`);

  let placed = false;

  while (!placed) {
    const randomBoolean = Math.random() < 0.5;
    const isHorizontal = user === "player" ? angle === 0 : randomBoolean;
    const randomStartIndex = Math.floor(Math.random() * width * width);

    const hasStartId = startId !== undefined && startId !== null;
    const startIndex = hasStartId ? Number(startId) : randomStartIndex;

    // overflow check
    if (!fitsOnBoard(startIndex, isHorizontal, ship.length, width)) {
      if (hasStartId) return false; // player: fail, don't loop forever
      continue; // computer: retry
    }

    const shipBlocks = buildShip(isHorizontal, startIndex, ship.length, width);

    // overlap check
    if (overlaps(shipBlocks, blocks)) {
      if (hasStartId) return false;
      continue;
    }

    // place ship
    shipBlocks.forEach(squareIndex => {
      blocks[squareIndex].classList.add(ship.name);
      blocks[squareIndex].classList.add("taken");
    });

    // store where this ship is
    shipLocations[user][ship.name] = shipBlocks;

    placed = true;
  }

  return true;
}

ships.forEach(ship => addShipPiece('computer', ship))



//Drag player ships
let draggedShip
const optionShips = Array.from(optionContainer.children)
optionShips.forEach(optionShip => optionShip.addEventListener('dragstart', dragStart))


const allPlayerBlocks = document.querySelectorAll('#player .block')
    allPlayerBlocks.forEach(playerBlock => {
        playerBlock.addEventListener('dragover', dragOver)
        playerBlock.addEventListener('drop', dropShip)
    })

function dragStart(e) {
    draggedShip = e.target
   
}

function dragOver(e) {
    e.preventDefault()
}

function dropShip(e) {
  const startId = Number(e.target.id);
  const shipIndex = Number(draggedShip.id);
  const ship = ships[shipIndex];

  // Block duplicates
  if (placedShips.has(ship.name)) return;

  const success = addShipPiece("player", ship, startId);

  if (success) {
    placedShips.add(ship.name);

    // Remove the preview ship from the options bar
    draggedShip.remove();
  }
}


//Game Logic

const startButton = document.querySelector('#start-button');
const turnEl = document.querySelector('#turn');

let gameStarted = false;
let currentPlayer = 'player'; // 'player' or 'computer'

const shots = {
  player: new Set(),   // stores indexes player already shot on computer
  computer: new Set(), // stores indexes computer already shot on player
};


//start game only after player placed all ships

startButton.addEventListener('click', () => {
  if (placedShips.size < ships.length) {
    turnEl.textContent = `Place all ships first (${placedShips.size}/${ships.length}).`;
    return;
  }
  gameStarted = true;
  turnEl.textContent = 'Game started! Click on the computer board to fire.';
});

//Player shooting (click computer blocks)
const computerBlocks = document.querySelectorAll('#computer .block');

computerBlocks.forEach(block => {
  block.addEventListener('click', () => {
    if (!gameStarted) return;
    if (currentPlayer !== 'player') return;

    const index = Number(block.id);

    // prevent shooting same cell twice
    if (shots.player.has(index)) return;
    shots.player.add(index);

    // hit or miss?
    if (block.classList.contains('taken')) {
    block.classList.add('hit');

    const sunkShip = checkSunk('computer', index);

    if (sunkShip) {
        turnEl.textContent = `You sunk the enemy ${sunkShip}! 🚢`;
    } else {
        turnEl.textContent = 'Hit!';
    }
    }
    else {
        block.classList.add('miss');
        turnEl.textContent = 'Miss.';
        }

    // win check
    if (checkWin('computer')) {
      turnEl.textContent = 'You win! 🎉';
      gameStarted = false;
      return;
    }

    // switch turn
    currentPlayer = 'computer';
    setTimeout(computerTurn, 500);
  });
});


//Computer Shooting (random shooting)

function computerTurn() {
  const playerBlocks = document.querySelectorAll('#player .block');

  // pick a random cell not shot before
  let index = Math.floor(Math.random() * width * width);
  while (shots.computer.has(index)) {
    index = Math.floor(Math.random() * width * width);
  }
  shots.computer.add(index);

  const target = playerBlocks[index];

    if (target.classList.contains('taken')) {
    target.classList.add('hit');

    const sunkShip = checkSunk('player', index);

    if (sunkShip) {
        turnEl.textContent = `Computer sunk your ${sunkShip}! 💥`;
    } else {
        turnEl.textContent = 'Computer hit you!';
    }
    }
    else {
        target.classList.add('miss');
        turnEl.textContent = 'Computer missed.';
    }

  // lose check
  if (checkWin('player')) {
    turnEl.textContent = 'You lose 😭';
    gameStarted = false;
    return;
  }

  currentPlayer = 'player';
  turnEl.textContent += ' Your turn.';
}


function checkSunk(defender, hitIndex) {
  const blocks = document.querySelectorAll(`#${defender} .block`);

  // loop through each ship
  for (const [shipName, shipCells] of Object.entries(shipLocations[defender])) {

    // only check ships that include this hit (optimization)
    if (!shipCells.includes(hitIndex)) continue;

    const sunk = shipCells.every(i =>
      blocks[i].classList.contains('hit')
    );

    if (sunk) {
      return shipName;
    }
  }

  return null;
}

//Check Win

function checkWin(defender) {
  // defender = 'player' or 'computer'
  const blocks = document.querySelectorAll(`#${defender} .block`);

  // defender loses if every ship cell has class "hit"
  const allShipCells = Object.values(shipLocations[defender]).flat();
  if (allShipCells.length === 0) return false; // safety

  return allShipCells.every(i => blocks[i].classList.contains('hit'));
}
