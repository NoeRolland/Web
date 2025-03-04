const canvas = document.getElementById('tetris'); //permet recuper le doc
let isGameRunning = false;
let timerId;
let score = 0;

const colors = {
    I : 'cyan',
    J : 'blue',
    L : 'orange',
    O : 'yellow',
    S : 'green',
    T : 'purple',
    Z : 'red'
};

let shape_I = [
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0]
];

let shape_J = [
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 0]
];

let shape_L = [
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 1]
];

let shape_O = [
    [1, 1],
    [1, 1]
];

let shape_S = [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0]
];

let shape_T = [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0]
];

let shape_Z = [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0]
];

const shapes = {
    I : shape_I, 
    J : shape_J, 
    L : shape_L, 
    O : shape_O, 
    S : shape_S, 
    T : shape_T, 
    Z : shape_Z
};

const grid = 30; //taille de chaque case en pixels 
const ROWS = canvas.height / grid; //lignes
const COLS = canvas.width / grid; //colonnes
const board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));


document.addEventListener('DOMContentLoaded', () => { //Cette fonction s'exécute lorsque le document HTML est entièrement chargé
    const ctx = canvas.getContext('2d');
    const mainThemeSound = document.getElementById("mainTheme");
    const gameOverSound = document.getElementById("gameOver");

    const displayMessage = (param) => {
        ctx.fillStyle = 'white';
        ctx.globalAlpha = 0.75;
        ctx.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);
        ctx.globalAlpha=1;
        ctx.fillStyle = 'black';
        ctx.font = '30px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(param, canvas.width / 2, canvas.height / 2);
    }
    displayMessage("START GAME!");


    window.addEventListener('keydown', (e) => { //interpretation des saisie utilisateur pour lancer le jeu
        console.log(e);
        if ((e.code === 'Space' || e.key === ' ') && !isGameRunning) {
            isGameRunning = true;
            newGame();
            updateScore();
            timerId = setInterval(gameLoop, 500); 
        };
    });

    document.addEventListener('keydown', (e) => { // Interpretation des saisie utilisateur pour les mouvements
        if (isGameRunning) {
            if (e.code === 'ArrowDown') {
                moveDown();
            } else if (e.code === 'ArrowLeft') {
                moveLeft();
            } else if (e.code === 'ArrowRight') {
                moveRight();
            } else if (e.code === 'ArrowUp') {
                rotate();
            }
        }
    });



    document.addEventListener('keydown', (e) => {
        if (e.code === 'Escape') {
            clearInterval(timerId);
            isGameRunning = false;
            displayMessage("PAUSE");
        }
    });

//-----------------GAME-----------------//

    function newGame() {
        newPiece();
        draw();
    }
//les tros functions permment de creer un nouveau jeu, piece et plateau


    function newPiece() {
        const pieces = Object.keys(shapes);
        console.log(pieces);
        const piece = pieces[Math.floor(Math.random() * pieces.length)]; //fonction qui tire aleatoirement une chiffre entre 0 et 6
        currentShape = {
            shape: shapes[piece],
            type: piece, 
            x: Math.floor(COLS / 2) - Math.floor(shapes[piece][0].length / 2),
            y: 0
        };
        console.log(currentShape);
    }



    function draw() { //function pour dessiner le plateau et les formes.
        if (isGameRunning) {
            drawBoard();
            drawShape(currentShape.shape, 
                currentShape.x, 
                currentShape.y, 
                colors[currentShape.type]);
        }
    }
    
    
    function drawBoard() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        board.forEach((row, i) => {
            row.forEach((value, j) => {
                if (value) {
                    drawSquare(j, i, colors[value]);
                }
            });
        });
    }



    function drawShape(shape, x, y, color) {
        shape.forEach((row, i) => { 
            row.forEach((value, j) => {
                if (value) {
                    drawSquare(x + j, y + i, color);
                }
            });
        });
    }



    function drawSquare(x, y, color) { //dessine les carrés dedans la forme
        ctx.fillStyle = color;
        ctx.fillRect(x * grid, y * grid, grid, grid);
        ctx.strokeStyle = 'black';
        ctx.strokeRect(x * grid, y * grid, grid, grid);
    }



    function gameLoop() { //fonction qui fait descendre la pièce et augmente le score. Elle est appellée toute les 500 ms
        if (isGameRunning) {
            moveDown();
            score++;
            updateScore();
        }
    }



    function updateScore() {
        document.getElementById('score').innerText = score;
    } 



//---------Move shape---------//



    function moveDown() { // fonction que fait descendre la piece
        if (canMove(0, 1)) {
            currentShape.y++;
            draw();
        } else {
            lock();
            newPiece();
            if (!canMove(0, 0)) {
                clearInterval(timerId);
                isGameRunning = false;
                mainThemeSound.pause();
                gameOverSound.play();
                displayMessage("GAME OVER");
            }
        }
    }

    function moveLeft() { //fonction qui deplace la piece sur la gauche
        if (canMove(-1, 0)) {
            currentShape.x--;
            draw();
        }
    }

    function moveRight() { //fonction qui deplace la piece sur la droite
        if (canMove(1, 0)) {
            currentShape.x++;
            draw();
        }
    }


// fonction qu'initialice une piece tourner, copie de la piece actuelle, avec la fonction rotateShape
// si la piece tourné peut etre placé, la forme actuelle devient la forme tourné
    function rotate() { 
        const rotatedShape = rotateShape(currentShape.shape);
        if (canMove(0, 0, rotatedShape)) {
            currentShape.shape = rotatedShape;
            draw();
        }
    }

    function rotateShape(shape) { //fonction qui transpose la matrice bidimensionnelle et en inversant les lignes. 
        const N = shape.length;
        const newShape = Array.from({ length: N }, () => Array(N).fill(0));
        shape.forEach((row, i) => {
            row.forEach((value, j) => {
                newShape[j][N - 1 - i] = value;
            });
        });
        return newShape;
    }


// Fonction qui verifie si la piece peut bouger
// dx et dy sont la position a regarder, dx droite ou gauche, dy en dessous
    function canMove(dx, dy, newShape = currentShape.shape) {
        for (let i = 0; i < newShape.length; i++) {
            for (let j = 0; j < newShape[i].length; j++) {
                if (newShape[i][j]) {
                    const x = currentShape.x + j + dx;
                    const y = currentShape.y + i + dy;
                    if (x < 0 || x >= COLS || y >= ROWS) {
                        return false;
                    }
                    if (y >= 0 && board[y][x]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    function lock() {
        currentShape.shape.forEach((row, i) => {
            row.forEach((value, j) => {
                if (value) {
                    const x = currentShape.x + j;
                    const y = currentShape.y + i;
                    board[y][x] = currentShape.type;
                }
            });
        });
        checkRows();
    }

    function checkRows() {
        for (let i = ROWS - 1; i >= 0; i--) {
            if (board[i].every((value) => value)) {
                console.log(board);
                board.splice(i, 1);
                board.unshift(Array(COLS).fill(0));
                score += 100;
                updateScore();
                i++;
            }
        }
        draw();
    }
});