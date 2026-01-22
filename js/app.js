const optionContainer = document.querySelector("#options-container")
const gameBoardsContainer = document.querySelector("#game-boards")

//Flip Button
const flipButton = document.querySelector('#flip-button')


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
  return shipBlocks.some(i => blocks[i].classList.contains("taken"))
}

// Function to Add ships on the board (with Checks)
function addShipPiece(ship) {
  const blocks = document.querySelectorAll("#computer .block")

  let placed = false

  while (!placed) {
    const isHorizontal = Math.random() < 0.5
    const startIndex = Math.floor(Math.random() * width * width)

    if (!fitsOnBoard(startIndex, isHorizontal, ship.length, width)) continue

    const shipBlocks = buildShip(isHorizontal, startIndex, ship.length, width)

    if (overlaps(shipBlocks, blocks)) continue

    shipBlocks.forEach(squareIndex => {
      blocks[squareIndex].classList.add(ship.name)
      blocks[squareIndex].classList.add("taken")
    })

    placed = true
  }
}

ships.forEach(ship => addShipPiece(ship))
