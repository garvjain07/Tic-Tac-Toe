const cells = [...document.querySelectorAll(".cell")];
const resetBtn = document.querySelector("#reset-btn");
const scoreResetBtn = document.querySelector("#score-reset-btn");
const themeBtn = document.querySelector("#theme-btn");
const difficulty = document.querySelector("#difficulty");
const difficultyWrap = document.querySelector("#difficulty-wrap");
const modeButtons = [...document.querySelectorAll(".mode-button")];
const statusText = document.querySelector("#status-text");
const status = document.querySelector("#status");
const scoreX = document.querySelector("#score-x");
const scoreO = document.querySelector("#score-o");
const scoreDraw = document.querySelector("#score-draw");
const scoreXCard = document.querySelector("#score-x-card");
const scoreOCard = document.querySelector("#score-o-card");
const oLabel = document.querySelector("#o-label");
const celebration = document.querySelector("#celebration");

const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

let board = Array(9).fill("");
let currentPlayer = "X";
let gameOver = false;
let botThinking = false;
let mode = "bot";
let scores = { X: 0, O: 0, draw: 0 };

try {
    const savedScores = JSON.parse(localStorage.getItem("ttt-scores"));
    if (savedScores) scores = { X: savedScores.X || 0, O: savedScores.O || 0, draw: savedScores.draw || 0 };
} catch (_) {}

function saveScores() {
    try { localStorage.setItem("ttt-scores", JSON.stringify(scores)); } catch (_) {}
}

function updateScores() {
    scoreX.textContent = scores.X;
    scoreO.textContent = scores.O;
    scoreDraw.textContent = scores.draw;
}

function getResult(state = board) {
    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (state[a] && state[a] === state[b] && state[a] === state[c]) {
            return { winner: state[a], pattern };
        }
    }
    return state.every(Boolean) ? { winner: "draw", pattern: [] } : null;
}

function setStatus(text, thinking = false) {
    statusText.textContent = text;
    status.classList.toggle("thinking", thinking);
}

function updateTurnCards() {
    scoreXCard.classList.toggle("active", !gameOver && currentPlayer === "X");
    scoreOCard.classList.toggle("active", !gameOver && currentPlayer === "O");
}

function playMove(index, player) {
    if (board[index] || gameOver) return false;
    board[index] = player;
    const cell = cells[index];
    cell.textContent = player;
    cell.classList.add(player.toLowerCase());
    cell.disabled = true;
    cell.setAttribute("aria-label", `${cell.getAttribute("aria-label")}, ${player}`);

    const result = getResult();
    if (result) {
        finishGame(result);
        return true;
    }

    currentPlayer = player === "X" ? "O" : "X";
    updateTurnCards();
    if (mode === "bot" && currentPlayer === "O") {
        botThinking = true;
        setStatus("AI is thinking...", true);
        cells.forEach(cell => { cell.disabled = true; });
        window.setTimeout(makeBotMove, 420);
    } else {
        if (mode === "bot") {
            cells.forEach((cell, index) => {
                if (!board[index]) cell.disabled = false;
            });
        }
        setStatus(mode === "bot" ? "Your turn" : `${currentPlayer}'s turn`);
    }
    return true;
}

function finishGame(result) {
    gameOver = true;
    botThinking = false;
    cells.forEach(cell => { cell.disabled = true; });

    if (result.winner === "draw") {
        scores.draw++;
        setStatus("It's a draw");
    } else {
        scores[result.winner]++;
        const playerName = mode === "bot"
            ? (result.winner === "X" ? "You win!" : "AI wins")
            : `Player ${result.winner} wins!`;
        setStatus(playerName);
        result.pattern.forEach(index => {
            cells[index].classList.add("win");
            if (result.winner === "O") cells[index].classList.add("o-win");
        });
        if (result.winner === "X" || mode === "human") celebrate();
    }

    updateScores();
    saveScores();
    updateTurnCards();
}

function emptyIndexes(state = board) {
    return state.map((value, index) => value ? null : index).filter(index => index !== null);
}

function findTacticalMove(player) {
    for (const index of emptyIndexes()) {
        const copy = [...board];
        copy[index] = player;
        if (getResult(copy)?.winner === player) return index;
    }
    return null;
}

function makeBotMove() {
    if (gameOver || mode !== "bot") return;
    const level = difficulty.value;
    let move = null;

    if (level === "easy") {
        const open = emptyIndexes();
        move = open[Math.floor(Math.random() * open.length)];
    } else {
        const winMove = findTacticalMove("O");
        const blockMove = findTacticalMove("X");
        if (level === "hard") {
            move = winMove ?? blockMove ?? getMinimaxMove();
        } else {
            move = winMove ?? blockMove;
            if (move === null && Math.random() < 0.35) {
                const open = emptyIndexes();
                move = open[Math.floor(Math.random() * open.length)];
            } else if (move === null) {
                move = getMinimaxMove();
            }
        }
    }

    botThinking = false;
    if (move !== null) playMove(move, "O");
}

function getMinimaxMove() {
    const open = emptyIndexes();
    if (open.length === 9) return [0, 2, 4, 6, 8][Math.floor(Math.random() * 5)];

    let bestScore = -Infinity;
    let moves = [];
    for (const index of open) {
        board[index] = "O";
        const score = minimax(board, false, 0);
        board[index] = "";
        if (score > bestScore) {
            bestScore = score;
            moves = [index];
        } else if (score === bestScore) {
            moves.push(index);
        }
    }
    return moves[Math.floor(Math.random() * moves.length)];
}

function minimax(state, isMaximizing, depth) {
    const result = getResult(state);
    if (result) {
        if (result.winner === "O") return 10 - depth;
        if (result.winner === "X") return depth - 10;
        return 0;
    }

    if (isMaximizing) {
        let best = -Infinity;
        for (const index of state.map((v, i) => v ? null : i).filter(v => v !== null)) {
            state[index] = "O";
            best = Math.max(best, minimax(state, false, depth + 1));
            state[index] = "";
        }
        return best;
    }

    let best = Infinity;
    for (const index of state.map((v, i) => v ? null : i).filter(v => v !== null)) {
        state[index] = "X";
        best = Math.min(best, minimax(state, true, depth + 1));
        state[index] = "";
    }
    return best;
}

function resetRound() {
    board = Array(9).fill("");
    currentPlayer = "X";
    gameOver = false;
    botThinking = false;
    cells.forEach((cell, index) => {
        cell.textContent = "";
        cell.disabled = false;
        cell.className = "cell";
        const labels = ["Top left", "Top center", "Top right", "Middle left", "Center", "Middle right", "Bottom left", "Bottom center", "Bottom right"];
        cell.setAttribute("aria-label", labels[index]);
    });
    setStatus(mode === "bot" ? "Your turn" : "Player X's turn");
    updateTurnCards();
}

function celebrate() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const colors = ["#7567b8", "#cf7ba8", "#f2ca73", "#78bfa5"];
    celebration.innerHTML = "";
    for (let i = 0; i < 36; i++) {
        const piece = document.createElement("span");
        piece.className = "confetti";
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.background = colors[i % colors.length];
        piece.style.setProperty("--drift", `${Math.random() * 180 - 90}px`);
        piece.style.animationDelay = `${Math.random() * 0.35}s`;
        celebration.appendChild(piece);
    }
    window.setTimeout(() => { celebration.innerHTML = ""; }, 2400);
}

cells.forEach(cell => {
    cell.addEventListener("click", () => {
        if (botThinking || gameOver) return;
        const index = Number(cell.dataset.index);
        if (mode === "bot") {
            playMove(index, "X");
        } else {
            playMove(index, currentPlayer);
        }
    });
});

modeButtons.forEach(button => {
    button.addEventListener("click", () => {
        mode = button.dataset.mode;
        modeButtons.forEach(item => {
            const active = item === button;
            item.classList.toggle("active", active);
            item.setAttribute("aria-pressed", String(active));
        });
        difficultyWrap.hidden = mode === "human";
        oLabel.innerHTML = mode === "bot" ? "AI <b>O</b>" : "Player <b>O</b>";
        resetRound();
    });
});

resetBtn.addEventListener("click", resetRound);
scoreResetBtn.addEventListener("click", () => {
    scores = { X: 0, O: 0, draw: 0 };
    saveScores();
    updateScores();
    resetRound();
});

themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    try { localStorage.setItem("ttt-theme", document.body.classList.contains("dark") ? "dark" : "light"); } catch (_) {}
});

try {
    if (localStorage.getItem("ttt-theme") === "dark") document.body.classList.add("dark");
} catch (_) {}

difficulty.addEventListener("change", resetRound);
updateScores();
updateTurnCards();

