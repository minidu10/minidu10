/**
 * Snake and Ladder Game
 * A fully functional web-based Snake and Ladder game
 * Features: 1-4 players, dice animation, game state persistence, responsive design
 */

class SnakeLadderGame {
    constructor() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.gameStarted = false;
        this.boardSize = 100;
        this.snakesAndLadders = {};
        this.gameState = null;
        
        // Player colors
        this.playerColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'];
        
        // Game elements
        this.elements = {
            gameSetup: document.getElementById('gameSetup'),
            gameBoardContainer: document.getElementById('gameBoardContainer'),
            playerCount: document.getElementById('playerCount'),
            playerNames: document.getElementById('playerNames'),
            startGameBtn: document.getElementById('startGameBtn'),
            newGameBtn: document.getElementById('newGameBtn'),
            resetBtn: document.getElementById('resetBtn'),
            saveBtn: document.getElementById('saveBtn'),
            loadBtn: document.getElementById('loadBtn'),
            rollDiceBtn: document.getElementById('rollDiceBtn'),
            dice: document.getElementById('dice'),
            diceFace: document.getElementById('diceFace'),
            diceResult: document.getElementById('diceResult'),
            currentPlayerName: document.getElementById('currentPlayerName'),
            currentPlayerColor: document.getElementById('currentPlayerColor'),
            playerList: document.getElementById('playerList'),
            gameBoard: document.getElementById('gameBoard'),
            gameMessage: document.getElementById('gameMessage'),
            winModal: document.getElementById('winModal'),
            winnerMessage: document.getElementById('winnerMessage'),
            playAgainBtn: document.getElementById('playAgainBtn')
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.generatePlayerInputs();
        this.generateSnakesAndLadders();
        this.loadGameState();
    }
    
    setupEventListeners() {
        this.elements.playerCount.addEventListener('change', () => this.generatePlayerInputs());
        this.elements.startGameBtn.addEventListener('click', () => this.startGame());
        this.elements.newGameBtn.addEventListener('click', () => this.newGame());
        this.elements.resetBtn.addEventListener('click', () => this.resetGame());
        this.elements.saveBtn.addEventListener('click', () => this.saveGame());
        this.elements.loadBtn.addEventListener('click', () => this.loadGame());
        this.elements.rollDiceBtn.addEventListener('click', () => this.rollDice());
        this.elements.playAgainBtn.addEventListener('click', () => this.playAgain());
        
        // Close modal when clicking outside
        this.elements.winModal.addEventListener('click', (e) => {
            if (e.target === this.elements.winModal) {
                this.closeWinModal();
            }
        });
    }
    
    generatePlayerInputs() {
        const count = parseInt(this.elements.playerCount.value);
        const container = this.elements.playerNames;
        container.innerHTML = '';
        
        for (let i = 1; i <= count; i++) {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-input';
            playerDiv.innerHTML = `
                <div class="player-color-indicator player-${i}"></div>
                <input type="text" id="player${i}Name" placeholder="Player ${i} Name" value="Player ${i}">
            `;
            container.appendChild(playerDiv);
        }
    }
    
    generateSnakesAndLadders() {
        // Predefined snakes and ladders for consistent gameplay
        this.snakesAndLadders = {
            // Snakes (head -> tail)
            16: 6,
            47: 26,
            49: 11,
            56: 53,
            62: 19,
            64: 60,
            87: 24,
            93: 73,
            95: 75,
            98: 78,
            
            // Ladders (bottom -> top)  
            1: 38,
            4: 14,
            9: 21,
            21: 42,
            28: 84,
            36: 44,
            51: 67,
            71: 91,
            80: 100
        };
    }
    
    startGame() {
        const playerCount = parseInt(this.elements.playerCount.value);
        this.players = [];
        
        // Create players
        for (let i = 1; i <= playerCount; i++) {
            const nameInput = document.getElementById(`player${i}Name`);
            this.players.push({
                id: i,
                name: nameInput.value || `Player ${i}`,
                position: 0,
                color: this.playerColors[i - 1]
            });
        }
        
        this.currentPlayerIndex = 0;
        this.gameStarted = true;
        
        // Hide setup, show game
        this.elements.gameSetup.style.display = 'none';
        this.elements.gameBoardContainer.style.display = 'block';
        
        this.createGameBoard();
        this.updateGameDisplay();
        this.updateMessage(`${this.getCurrentPlayer().name}'s turn! Roll the dice to start.`);
    }
    
    createGameBoard() {
        const board = this.elements.gameBoard;
        board.innerHTML = '';
        
        // Create squares from 100 to 1 (snake and ladder board style)
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                let squareNumber;
                
                // Alternate row direction (zigzag pattern)
                if (row % 2 === 0) {
                    // Even rows: right to left (100, 99, 98...)
                    squareNumber = 100 - (row * 10 + col);
                } else {
                    // Odd rows: left to right (81, 82, 83...)
                    squareNumber = 100 - (row * 10 + (9 - col));
                }
                
                const square = document.createElement('div');
                square.className = 'board-square';
                square.id = `square-${squareNumber}`;
                square.innerHTML = `
                    <div class="number">${squareNumber}</div>
                    <div class="players"></div>
                `;
                
                // Add special square classes
                if (this.snakesAndLadders[squareNumber]) {
                    const destination = this.snakesAndLadders[squareNumber];
                    if (destination < squareNumber) {
                        // Snake head
                        square.classList.add('snake-head');
                        square.innerHTML += '<div class="snake-ladder-icon">🐍</div>';
                    } else {
                        // Ladder bottom
                        square.classList.add('ladder-bottom');
                        square.innerHTML += '<div class="snake-ladder-icon">🪜</div>';
                    }
                }
                
                // Check if this square is a snake tail or ladder top
                Object.entries(this.snakesAndLadders).forEach(([start, end]) => {
                    if (end === squareNumber) {
                        if (parseInt(start) > squareNumber) {
                            // Snake tail
                            square.classList.add('snake-tail');
                        } else {
                            // Ladder top
                            square.classList.add('ladder-top');
                        }
                    }
                });
                
                // Win square
                if (squareNumber === 100) {
                    square.classList.add('win');
                    square.innerHTML += '<div class="snake-ladder-icon">🏆</div>';
                }
                
                board.appendChild(square);
            }
        }
        
        this.updatePlayerPositions();
    }
    
    rollDice() {
        if (!this.gameStarted) return;
        
        this.elements.rollDiceBtn.disabled = true;
        this.elements.dice.classList.add('rolling');
        
        // Animate dice roll
        let rollCount = 0;
        const rollInterval = setInterval(() => {
            const randomFace = Math.floor(Math.random() * 6) + 1;
            this.elements.diceFace.textContent = this.getDiceFace(randomFace);
            rollCount++;
            
            if (rollCount >= 10) {
                clearInterval(rollInterval);
                const finalRoll = Math.floor(Math.random() * 6) + 1;
                this.elements.diceFace.textContent = this.getDiceFace(finalRoll);
                this.elements.diceResult.textContent = `Rolled: ${finalRoll}`;
                this.elements.dice.classList.remove('rolling');
                
                setTimeout(() => {
                    this.movePlayer(finalRoll);
                    this.elements.rollDiceBtn.disabled = false;
                }, 500);
            }
        }, 100);
    }
    
    getDiceFace(number) {
        const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        return faces[number - 1];
    }
    
    movePlayer(diceRoll) {
        const currentPlayer = this.getCurrentPlayer();
        const newPosition = Math.min(currentPlayer.position + diceRoll, 100);
        
        // Animate movement
        this.animatePlayerMovement(currentPlayer, currentPlayer.position, newPosition);
        
        currentPlayer.position = newPosition;
        
        // Check for snakes and ladders
        if (this.snakesAndLadders[newPosition]) {
            const destination = this.snakesAndLadders[newPosition];
            setTimeout(() => {
                if (destination < newPosition) {
                    this.updateMessage(`🐍 Oh no! ${currentPlayer.name} was bitten by a snake! Sliding down from ${newPosition} to ${destination}.`);
                } else {
                    this.updateMessage(`🪜 Great! ${currentPlayer.name} climbed a ladder! Moving up from ${newPosition} to ${destination}.`);
                }
                
                currentPlayer.position = destination;
                this.updatePlayerPositions();
                
                setTimeout(() => {
                    this.checkWinCondition();
                }, 1000);
            }, 1000);
        } else {
            this.updateMessage(`${currentPlayer.name} moved to square ${newPosition}.`);
            setTimeout(() => {
                this.checkWinCondition();
            }, 500);
        }
        
        this.updatePlayerPositions();
    }
    
    animatePlayerMovement(player, startPos, endPos) {
        // This is a simplified animation - in a more complex version,
        // you could animate step by step through each square
        const startSquare = document.getElementById(`square-${startPos}`);
        const endSquare = document.getElementById(`square-${endPos}`);
        
        if (startSquare && endPos > 0) {
            const playerTokens = startSquare.querySelectorAll('.player-token');
            playerTokens.forEach(token => {
                if (token.dataset.playerId == player.id) {
                    token.classList.add('tokenMove');
                }
            });
        }
    }
    
    checkWinCondition() {
        const currentPlayer = this.getCurrentPlayer();
        
        if (currentPlayer.position === 100) {
            this.gameStarted = false;
            this.showWinModal(currentPlayer);
            return;
        }
        
        // Move to next player
        this.nextPlayer();
    }
    
    nextPlayer() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.updateGameDisplay();
        this.updateMessage(`${this.getCurrentPlayer().name}'s turn! Roll the dice.`);
    }
    
    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }
    
    updateGameDisplay() {
        const currentPlayer = this.getCurrentPlayer();
        this.elements.currentPlayerName.textContent = currentPlayer.name;
        this.elements.currentPlayerColor.style.backgroundColor = currentPlayer.color;
        
        // Update player list
        const playerList = this.elements.playerList;
        playerList.innerHTML = '';
        
        this.players.forEach((player, index) => {
            const playerItem = document.createElement('div');
            playerItem.className = 'player-item';
            if (index === this.currentPlayerIndex) {
                playerItem.classList.add('current');
            }
            
            playerItem.innerHTML = `
                <div class="player-name">
                    <div class="player-color-indicator" style="background-color: ${player.color}"></div>
                    ${player.name}
                </div>
                <div class="player-position">Square ${player.position}</div>
            `;
            
            playerList.appendChild(playerItem);
        });
    }
    
    updatePlayerPositions() {
        // Clear all player tokens
        document.querySelectorAll('.player-token').forEach(token => token.remove());
        
        // Add player tokens to their current positions
        this.players.forEach(player => {
            if (player.position > 0) {
                const square = document.getElementById(`square-${player.position}`);
                if (square) {
                    const playersContainer = square.querySelector('.players');
                    const token = document.createElement('div');
                    token.className = 'player-token';
                    token.style.backgroundColor = player.color;
                    token.dataset.playerId = player.id;
                    token.title = player.name;
                    playersContainer.appendChild(token);
                }
            }
        });
    }
    
    updateMessage(message) {
        this.elements.gameMessage.textContent = message;
        this.elements.gameMessage.classList.remove('fade-in');
        setTimeout(() => {
            this.elements.gameMessage.classList.add('fade-in');
        }, 10);
    }
    
    showWinModal(winner) {
        this.elements.winnerMessage.innerHTML = `🎉 ${winner.name} Wins! 🎉<br>Congratulations on reaching square 100!`;
        this.elements.winModal.classList.add('show');
        this.updateMessage(`Game Over! ${winner.name} is the winner!`);
    }
    
    closeWinModal() {
        this.elements.winModal.classList.remove('show');
    }
    
    playAgain() {
        this.closeWinModal();
        this.newGame();
    }
    
    newGame() {
        this.gameStarted = false;
        this.players = [];
        this.currentPlayerIndex = 0;
        
        // Reset display
        this.elements.gameSetup.style.display = 'block';
        this.elements.gameBoardContainer.style.display = 'none';
        this.elements.diceResult.textContent = '';
        this.elements.diceFace.textContent = '🎲';
        
        this.generatePlayerInputs();
    }
    
    resetGame() {
        if (!this.gameStarted) return;
        
        if (confirm('Are you sure you want to reset the current game?')) {
            // Reset all player positions
            this.players.forEach(player => {
                player.position = 0;
            });
            
            this.currentPlayerIndex = 0;
            this.updatePlayerPositions();
            this.updateGameDisplay();
            this.updateMessage(`Game reset! ${this.getCurrentPlayer().name}'s turn to start.`);
            this.elements.diceResult.textContent = '';
            this.elements.diceFace.textContent = '🎲';
        }
    }
    
    saveGame() {
        if (!this.gameStarted) {
            alert('No game in progress to save.');
            return;
        }
        
        const gameState = {
            players: this.players,
            currentPlayerIndex: this.currentPlayerIndex,
            gameStarted: this.gameStarted,
            timestamp: new Date().toISOString()
        };
        
        try {
            localStorage.setItem('snakeLadderGameState', JSON.stringify(gameState));
            this.updateMessage('Game saved successfully!');
            setTimeout(() => {
                this.updateMessage(`${this.getCurrentPlayer().name}'s turn! Roll the dice.`);
            }, 2000);
        } catch (error) {
            alert('Failed to save game. Local storage might be full.');
        }
    }
    
    loadGame() {
        try {
            const savedState = localStorage.getItem('snakeLadderGameState');
            if (!savedState) {
                alert('No saved game found.');
                return;
            }
            
            const gameState = JSON.parse(savedState);
            
            if (confirm('Loading a saved game will overwrite the current game. Continue?')) {
                this.players = gameState.players;
                this.currentPlayerIndex = gameState.currentPlayerIndex;
                this.gameStarted = gameState.gameStarted;
                
                // Update display
                this.elements.gameSetup.style.display = 'none';
                this.elements.gameBoardContainer.style.display = 'block';
                
                this.createGameBoard();
                this.updateGameDisplay();
                this.updateMessage(`Game loaded! ${this.getCurrentPlayer().name}'s turn.`);
            }
        } catch (error) {
            alert('Failed to load game. Save file might be corrupted.');
        }
    }
    
    loadGameState() {
        // Auto-load game state on page load if available
        try {
            const savedState = localStorage.getItem('snakeLadderGameState');
            if (savedState) {
                this.elements.loadBtn.style.display = 'inline-block';
            }
        } catch (error) {
            // Ignore errors
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SnakeLadderGame();
});

// Add some utility functions for better user experience
document.addEventListener('keydown', (e) => {
    // Press Space to roll dice
    if (e.code === 'Space' && document.getElementById('rollDiceBtn') && !document.getElementById('rollDiceBtn').disabled) {
        e.preventDefault();
        document.getElementById('rollDiceBtn').click();
    }
    
    // Press Escape to close modal
    if (e.code === 'Escape') {
        const winModal = document.getElementById('winModal');
        if (winModal && winModal.classList.contains('show')) {
            winModal.classList.remove('show');
        }
    }
});

// Add visual feedback for touch devices
if ('ontouchstart' in window) {
    document.addEventListener('touchstart', (e) => {
        if (e.target.classList.contains('btn')) {
            e.target.style.transform = 'scale(0.95)';
        }
    });
    
    document.addEventListener('touchend', (e) => {
        if (e.target.classList.contains('btn')) {
            setTimeout(() => {
                e.target.style.transform = '';
            }, 150);
        }
    });
}