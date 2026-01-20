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


//Random Generated Computer Ships

function addShipPiece(ship) {
    const allBoardBlocks = document.querySelectorAll('#computer div')
    let randomBoolean = Math.random() < 0.5
    let isHorizontal = randomBoolean
    let randomStartIndex = Math.floor(Math.random() * width * width)
    
    let shipBlocks = []

   for (let i = 0; i < ship.length; i++)
        if (isHorizontal) {
            shipBlocks.push(allBoardBlocks[Number(randomStartIndex) + i])
        } else {
            shipBlocks.push(allBoardBlocks[Number(randomStartIndex)+ i * width])
        }

        shipBlocks.forEach(shipBlock => {
            shipBlock.classList.add(ship.name)
            shipBlock.classList.add('taken')
    })   
}

ships.forEach(ship => addShipPiece(ship))