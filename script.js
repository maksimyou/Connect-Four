function Gameboard() {
    const rows = 6;
    const columns = 7;
    const board = [];

    for (let i = 0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < columns; j++) {
            board[i].push(Cell());
        }
    }

    const getBoard = () => board;

    const dropToken = (column, player) => {
        const availableCells = board.filter((row) => row[column].getValue() === 0).map(row => row[column]);

        if (!availableCells.length) return 'stop';

        const lowestRow = availableCells.length - 1;
        board[lowestRow][column].addToken(player);
    };

    const printBoard = () => {
        const boardWithCellValues = board.map((row) => row.map((cell) => cell.getValue()))
        console.log(boardWithCellValues);
    };

    return { getBoard, dropToken, printBoard };
}

function Cell() {
    let value = 0;

    const addToken = (player) => {
        value = player;
    };

    const getValue = () => value;

    return {
        addToken,
        getValue,
        value
    };
}

function GameController(
    playerOneName = "Player One",
    playerTwoName = "Player Two"
) {
    const board = Gameboard();

    const players = [
        {
            name: playerOneName,
            token: 1
        },
        {
            name: playerTwoName,
            token: 2
        }
    ];

    let activePlayer = players[0];


    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };
    const getActivePlayer = () => activePlayer;

    const printNewRound = () => {
        board.printBoard();
        //console.log(`${getActivePlayer().name}'s turn.`);
    };

    const playRound = (column, slide) => {
        const stop = board.dropToken(column, getActivePlayer().token);

        if (stop !== 'stop') {
            switchPlayerTurn();
            slide.play()
        }
        printNewRound();
        const active = activePlayer
        console.log(stop)
        return { stop, active, board: board.getBoard() };
    };

    printNewRound();

    return {
        playRound,
        getActivePlayer,
        getBoard: board.getBoard
    };
}

function ScreenController() {
    const game = GameController();
    const playerTurnDiv = document.querySelector('.turn');
    const boardDiv = document.querySelector('.board');
    let count = 0;
    let stopGame = true;
    const columnLeft = document.querySelector('.column-left');
    const columnRight = document.querySelector('.column-right');
    const chipOne = document.createElement('div');
    const chipTwo = document.createElement('div');
    let win = document.querySelector('.modal_winner')
    win.addEventListener('click', (e) => {
        document.querySelector('.cell').click()
        win.style.display = 'none';
    })
    chipOne.classList.add('chip-one');
    chipTwo.classList.add('chip-two');

    for (let i = 0; i < 21; i++) {
        let one = chipOne.cloneNode()
        one.id = i + 1
        let two = chipTwo.cloneNode()
        two.id = i + 1
        columnLeft.append(one)
        columnRight.append(two)
    }

    const updateScreen = (deletes = false, stop) => {
        // clear the board
        boardDiv.textContent = "";
        const activePlayer = game.getActivePlayer();
        console.log(count)
        if (deletes && activePlayer.token === 2 && stop !== 'stop') {
            columnLeft.children[count].classList.add('hide')
            //count++;
        } else if (deletes && stop !== 'stop') {
            columnRight.children[count].classList.add('hide')
            count += 1;
        }

        // get the newest version of the board and player turn
        let board = game.getBoard();

        // Display player's turn
        playerTurnDiv.textContent = `${activePlayer.name}'s turn...`

        // Render board squares
        if (!stopGame) {
            board.forEach(row => {
                row.forEach((cell, index) => {
                    cell.addToken(0)
                })
            })
            for (let i = 0; i < 21; i++) {
                columnLeft.children[i].classList.remove('hide')
                columnRight.children[i].classList.remove('hide')
            }
            count = 0;
            stopGame = true
        }

        board.forEach(row => {
            row.forEach((cell, index) => {
                // Anything clickable should be a button!!
                const cellImg = document.createElement("img");
                cellImg.addEventListener("click", (e) => {
                    let token;
                    let { active, board } = clickHandlerBoard(e);
                    if (active.token === 1) { token = 2 } else { token = 1 }
                    if (checkWinner(token, board)) {
                        stopGame = false;
                        document.querySelector('.modal_winner').style.display = 'block';
                        document.querySelector('.winner').textContent = `Игрок ${token} выиграл!`
                        console.log(`Игрок ${token} выиграл!`);
                    } else {
                        console.log(`Игрок ${token} еще не выиграл.`);
                    }
                }
                );
                cellImg.classList.add("cell");
                // Create a data attribute to identify the column
                // This makes it easier to pass into our `playRound` function 
                cellImg.dataset.column = index
                if (cell.getValue() === 0) {
                    cellImg.src = './pngwing.com.png'
                }
                if (cell.getValue() === 1) {
                    cellImg.src = './Fishki/f11.png'
                } if (cell.getValue() === 2) {
                    cellImg.src = './Fishki/f12.png'
                }
                //cellImg.textContent = cell.getValue();
                boardDiv.appendChild(cellImg);
            })
        })


    }

    // Add event listener for the board
    function clickHandlerBoard(e) {
        const selectedColumn = e.target.dataset.column;
        const slide = new Audio();
        slide.src = './60438981e7f39ca.mp3';
        slide.volume = 0.2
        // Make sure I've clicked a column and not the gaps in between
        if (!selectedColumn) return;

        let { stop, active, board } = game.playRound(selectedColumn, slide);
        updateScreen(true, stop);
        return { active, board };
    }

    // Initial render
    updateScreen();

    // We don't need to return anything from this module because everything is encapsulated inside this screen controller.
}


function checkWinner(player, board) {
    console.log(board)
    // Проверка по горизонтали
    const numRows = 6;
    const numCols = 7;
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col <= numCols - 4; col++) {
            //console.log(board[row][col].getValue())
            if (
                board[row][col].getValue() === player &&
                board[row][col + 1].getValue() === player &&
                board[row][col + 2].getValue() === player &&
                board[row][col + 3].getValue() === player
            ) {
                return true;
            }
        }
    }

    // Проверка по вертикали
    for (let col = 0; col < numCols; col++) {
        for (let row = 0; row <= numRows - 4; row++) {
            if (
                board[row][col].getValue() === player &&
                board[row + 1][col].getValue() === player &&
                board[row + 2][col].getValue() === player &&
                board[row + 3][col].getValue() === player
            ) {
                return true;
            }
        }
    }

    // Проверка по диагонали снизу вверх (лево направо)
    for (let row = 3; row < numRows; row++) {
        for (let col = 0; col <= numCols - 4; col++) {
            if (
                board[row][col].getValue() === player &&
                board[row - 1][col + 1].getValue() === player &&
                board[row - 2][col + 2].getValue() === player &&
                board[row - 3][col + 3].getValue() === player
            ) {
                return true;
            }
        }
    }

    // Проверка по диагонали сверху вниз (лево направо)
    for (let row = 0; row <= numRows - 4; row++) {
        for (let col = 0; col <= numCols - 4; col++) {
            if (
                board[row][col].getValue() === player &&
                board[row + 1][col + 1].getValue() === player &&
                board[row + 2][col + 2].getValue() === player &&
                board[row + 3][col + 3].getValue() === player
            ) {
                return true;
            }
        }
    }

    return false;
}

ScreenController();
