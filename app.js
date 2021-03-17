document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid')
    let squares = Array.from(document.querySelectorAll('.grid div'))
    const scoreDisplay = document.querySelector('#score')
    const levelDisplay = document.querySelector('#level')
    const linesDisplay = document.querySelector('#lines')
    const startButton = document.querySelector('#start-button')
    const resumeButton = document.querySelector('#resume-button')
    const pauseButton = document.querySelector('#pause-button')
    const width = 10
    let timerId
    let score = 0
    let level = 1
    let lines = 0
    let timeDownTetromino = 1000
    let gameStarted = 0
    var nextRandom = Math.floor(Math.random() * 5)
    
    //Tetrominoes
    const tetrominoL = [
        [2,width,width+1,width+2],
        [1,width+1,width*2+1,width*2+2],
        [width,width+1,width+2,width*2],
        [0,1,width+1,width*2+1]
    ] 
    const tetrominoJ = [
        [0,width,width+1,width+2],
        [1,2,width+1,width*2+1],
        [width,width+1,width+2,width*2+2],
        [1,width+1,width*2+1,width*2]
    ]
    const tetrominoS = [
        [1,2,width,width+1],
        [1,width+1,width+2,width*2+2],
        [width+1,width+2,width*2,width*2+1],
        [0,width,width+1,width*2+1]
    ]
    const tetrominoZ = [
        [0,1,width+1,width+2],
        [2,width+1,width+2,width*2+1],
        [width,width+1,width*2+1,width*2+2],
        [1,width,width+1,width*2]
    ]
    const tetrominoT = [
        [1,width,width+1,width+2],
        [1,width+1,width*2+1,width+2],
        [width,width+1,width+2,width*2+1],
        [1,width+1,width*2+1,width]
    ]
    const tetrominoO = [
        [0,1,width,width+1],
        [0,1,width,width+1],
        [0,1,width,width+1],
        [0,1,width,width+1]
    ]
    const tetrominoI = [
        [width,width+1,width+2,width+3],
        [2,width+2,width*2+2,width*3+2],
        [width*2,width*2+1,width*2+2,width*2+3],
        [1,width+1,width*2+1,width*3+1]
    ]
    const tetrominoes = [tetrominoL,tetrominoJ,tetrominoS,tetrominoZ,tetrominoT,tetrominoO,tetrominoI]

    let currentPosition = 4

    //randomly select a tetromio and your first rotation
    let random = Math.floor(Math.random() * tetrominoes.length)
    let initialPosition = 0

    let current = tetrominoes[random][initialPosition]

    //Function to set color based in tetromino
    function colors(tetromino){
        if (tetromino == 0 || tetromino == 3){
            return 'tetrominoLZ';
        } else if (tetromino == 1 || tetromino == 2){
            return 'tetrominoJS';
        } else{
            return 'tetrominoTOI';
        }
    }

    //add tetromino
    function add() {
            current.forEach(index =>{
                squares[currentPosition + index].classList.add(colors(random))
            })
    }
    
    //remove tetromino
    function remove(){
        current.forEach(index =>{
            squares[currentPosition + index].classList.remove(colors(random))
        })
    }

    //functions to KeyCodes
    function control(e){
        if(e.keyCode === 37) {
            moveLeft()
        } else if (e.keyCode === 38){
            rotation()
        } else if (e.keyCode === 39){
            moveRight()
        } else if (e.keyCode === 40){
            moveDown()
        }
    }
    
    //function to moveDown
    function moveDown() {
        remove()
        currentPosition += width 
        add()
        stop()
    }

    //stop tetromino
    function stop() {
        if (current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
            current.forEach(index => squares[currentPosition + index].classList.add('taken'))

            if(current.some(index => (currentPosition + index) <= 9)){
                gameOver()
            } else{
                //start a new tetromino
                random = nextRandom
                nextRandom = Math.floor(Math.random() * tetrominoes.length)
                initialPosition = 0
                current = tetrominoes[random][initialPosition]
                currentPosition = 4
                addScore()
                addLevel()
                add()
                displayNext()
                if (current.some(index => squares[currentPosition + index].classList.contains('taken'))){
                    gameOver()
                }
            }
        }
    }

    function isAtLeftEdge(positionTetromino,currentPosition,width){
        return positionTetromino.some(index => (currentPosition + index) % width === 0);
    }

    function isAtRightEdge(positionTetromino,currentPosition,width){
        return positionTetromino.some(index => (currentPosition + index) % width === width -1);
    }

    function isAtFinalEdge(positionTetromino,currentPosition){
        return positionTetromino.some(index => (currentPosition + index) > 199);
    }

    //move tetromino to left, unless is at the edge or there is a blockage
    function moveLeft() {
        remove()

        const inLeftEdge = isAtLeftEdge(current,currentPosition,width)

        if(!inLeftEdge){
            currentPosition -= 1
        }
        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))){
            currentPosition += 1
        }
        add()
        stop()
    }

    //move tetromino to right, unless is at the edge or there is a blockage
    function moveRight(){
        remove()

        const inRightEdge = isAtRightEdge(current,currentPosition,width)

        if(!inRightEdge){
            currentPosition += 1  
        }
        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))){
            currentPosition -= 1
        }
        add()
        stop()
    }

    //rotation tetromino
    function rotation(){
        
        //tetromino cannot rotate in some situations if it is on edge
        if(initialPosition == 3){
            initialPosition = -1 //scape possible error to nextRotation (Ex: initialPosition == 3 + 1, dont exist initialPosition == 4)
        }

        let nextRotation = tetrominoes[random][initialPosition + 1]
        let inFinalEdge = isAtFinalEdge(nextRotation,currentPosition) 

        let inLeftEdge = isAtLeftEdge(nextRotation,currentPosition,width)
        let inRightEdge = isAtRightEdge(nextRotation,currentPosition,width)
        let containsTaken = nextRotation.some(index => squares[currentPosition + index].classList.contains('taken'))
       
        if(!inFinalEdge && !containsTaken && !(inLeftEdge && inRightEdge)) { //conditions to rotate
            remove()
            initialPosition ++
            if (initialPosition === current.length){ //Reset position 
            initialPosition = 0
            }
            current = tetrominoes[random][initialPosition]
            add()
            stop()
        }
    }
    
    //show up-next tetromino in grid-display
    const displaySquare = document.querySelectorAll('.mini-grid div')
    const displayWidth = 4
    let displayIndex = 0

    //Tetrominos positions to show in Display (in first position: initialPosition == 0)
    const upNextTetrominoes = [
        [displayWidth+3,displayWidth*2+3,displayWidth*2+2,displayWidth*2+1], //TetrominoL
        [displayWidth,displayWidth*2,displayWidth*2+1,displayWidth*2+2], //tetrominoJ
        [displayWidth+1,displayWidth+2,displayWidth*2,displayWidth*2+1], //tetrominoS
        [displayWidth,displayWidth+1,displayWidth*2+1, displayWidth*2+2], //TetrominoZ
        [displayWidth+1,displayWidth*2,displayWidth*2+1,displayWidth*2+2], //tetrominoT
        [displayWidth+1,displayWidth+2,displayWidth*2+1,displayWidth*2+2], //tetrominoO
        [displayWidth,displayWidth+1,displayWidth+2,displayWidth+3] //TetrominoI

    ]

    //display of the next tetromino
    function displayNext(){
        //remove actually tetromino in display
        displaySquare.forEach(square => {
            square.classList.remove(colors(random))
        })
        upNextTetrominoes[nextRandom].forEach( index => {
            displaySquare[displayIndex + index].classList.add((colors(nextRandom)))
        })
    }

    //start button
    startButton.addEventListener('click', () => {
        if (gameStarted == 0){
            document.addEventListener('keyup',control)
            add()
            timerId = setInterval(moveDown, timeDownTetromino)
            nextRandom = Math.floor(Math.random() * tetrominoes.length)
            scoreDisplay.innerHTML = ' ' + score
            levelDisplay.innerHTML = ' ' + level
            linesDisplay.innerHTML = ' ' + lines
            displayNext()
            gameStarted++
        }
    })

    //resume button
    resumeButton.addEventListener('click', () => {
        if(!timerId){
            document.addEventListener('keyup',control)
            timerId = setInterval(moveDown, timeDownTetromino - ((level - 1) *100))
        }
    })

    //pause button
    pauseButton.addEventListener('click', () =>{
        if(timerId){
            clearInterval(timerId)
            timerId = null
            document.removeEventListener('keyup',control)
        }
    })

    //add score
    function addScore() {
        for (let i = 0; i < 199; i+= width) {
            const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]

            if(row.every(index => squares[index].classList.contains('taken'))) {
                score = score + ((Math.floor(Math.random() * 11))) * level
                lines ++
                scoreDisplay.innerHTML = ' ' + score
                linesDisplay.innerHTML = ' ' + lines
                row.forEach(index => {
                    squares[index].classList.remove('taken')
                    squares[index].classList.remove(colors(0))
                    squares[index].classList.remove(colors(2))
                    squares[index].classList.remove(colors(6))
                })
                const squaresRemoved = squares.splice(i, width)

                squares = squaresRemoved.concat(squares)

                squares.forEach(cell => grid.appendChild(cell))
            }
        }
    }

    //add level
    function addLevel() {
        if (lines >= level*5){
            clearInterval(timerId)
            level++
            timerId = setInterval(moveDown, timeDownTetromino - ((level - 1) *100))
            levelDisplay.innerHTML = ' ' + level
        }
    }

    //game over
    function gameOver() {
        //if(current.some(index => squares[currentPosition + index].classList.contains('taken'))){
        levelDisplay.innerHTML = ' ' + level + ' (Game Over)'
        clearInterval(timerId)
        document.removeEventListener('keyup',control)
      
        }
})