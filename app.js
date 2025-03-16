const cells = document.querySelectorAll(".cell");
const pieces = document.querySelectorAll(".piece");
const resetButton = document.getElementById("reset-button");
const undoButton = document.getElementById("undo-button");
const startButton = document.getElementById("start-button");
const timerDisplay = document.getElementById("timer");
const solvedMessage = document.getElementById("solved-message");
const timeTaken = document.getElementById("time-taken");

let draggedPiece = null;
const moveStack = []; // Stack to track moves
let timerInterval = null;
let startTime = null;
let isPuzzleStarted = false;

// Function to shuffle an array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Function to randomly rotate a piece
function rotateRandom(piece) {
  const rotations = [0, 90, 180, 270];
  const randomRotation =
    rotations[Math.floor(Math.random() * rotations.length)];
  piece.style.transform = `rotate(${randomRotation}deg)`;
}

// Randomly shuffle and rotate tiles on page load
function initializePuzzle() {
  const piecesArray = Array.from(pieces);

  // Shuffle the pieces
  shuffleArray(piecesArray);

  // Clear all cells
  cells.forEach((cell) => {
    cell.innerHTML = "";
  });

  // Append shuffled pieces to the .pieces container
  const piecesContainer = document.querySelector(".pieces");
  piecesContainer.innerHTML = ""; // Clear existing pieces
  piecesArray.forEach((piece) => {
    piecesContainer.appendChild(piece);
    rotateRandom(piece); // Randomly rotate the piece
  });

  // Clear the move stack
  moveStack.length = 0;
}

// Initialize the puzzle when the page loads
window.addEventListener("load", () => {
  console.log("Page loaded"); // Debugging
  initializePuzzle();
  // Disable dragging for pieces initially
  pieces.forEach((piece) => {
    piece.draggable = false;
  });
});

// Start Puzzle
startButton.addEventListener("click", () => {
  console.log("Start button clicked"); // Debugging
  if (!isPuzzleStarted) {
    isPuzzleStarted = true;
    startButton.disabled = true; // Disable start button after clicking
    startTimer();

    // Enable dragging for pieces
    pieces.forEach((piece) => {
      piece.draggable = true;
      console.log(`Piece ${piece.getAttribute("data-id")} is now draggable`); // Debugging
    });
  }
});

// Timer Functionality
function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    timerDisplay.textContent = `Time: ${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

// Drag and Drop Functionality
pieces.forEach((piece) => {
  piece.addEventListener("dragstart", (e) => {
    if (isPuzzleStarted) {
      draggedPiece = e.target;
      console.log(`Dragging piece ${draggedPiece.getAttribute("data-id")}`); // Debugging
    }
  });
});

cells.forEach((cell) => {
  cell.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  cell.addEventListener("drop", (e) => {
    if (isPuzzleStarted && draggedPiece && !cell.firstChild) {
      // Record the move
      const source = draggedPiece.parentElement; // Source container
      const destination = cell; // Destination cell
      moveStack.push({ tile: draggedPiece, source, destination });

      // Move the tile
      destination.appendChild(draggedPiece);
      draggedPiece = null;

      // Check if the puzzle is solved
      checkPuzzleSolved();
    }
  });
});

// Undo Functionality
undoButton.addEventListener("click", () => {
  if (isPuzzleStarted && moveStack.length > 0) {
    const lastMove = moveStack.pop(); // Get the last move
    const { tile, source, destination } = lastMove;

    // Move the tile back to its source
    source.appendChild(tile);
  }
});

// Reset Puzzle
resetButton.addEventListener("click", () => {
  if (isPuzzleStarted) {
    cells.forEach((cell) => {
      if (cell.firstChild) {
        document.querySelector(".pieces").appendChild(cell.firstChild);
      }
    });
    initializePuzzle();
    stopTimer();
    timerDisplay.textContent = "Time: 00:00";
    solvedMessage.classList.add("hidden");
    isPuzzleStarted = false;
    startButton.disabled = false; // Re-enable start button

    // Disable dragging for pieces
    pieces.forEach((piece) => {
      piece.draggable = false;
    });
  }
});

// Check if the puzzle is solved
function checkPuzzleSolved() {
  const isSolved = Array.from(cells).every((cell) => {
    const piece = cell.firstChild;
    return piece && piece.getAttribute("data-id") === cell.id.split("-")[1];
  });

  if (isSolved) {
    stopTimer();
    const elapsedTime = timerDisplay.textContent;
    timeTaken.textContent = elapsedTime;
    solvedMessage.classList.remove("hidden");
  }
}

// Rotation
pieces.forEach((piece) => {
  piece.addEventListener("dblclick", () => {
    if (isPuzzleStarted) {
      const computedStyle = window.getComputedStyle(piece);
      const transform = computedStyle.transform;

      let currentRotation = 0;
      if (transform && transform !== "none") {
        const values = transform.split("(")[1].split(")")[0].split(",");
        const a = parseFloat(values[0]);
        const b = parseFloat(values[1]);
        currentRotation = Math.round(Math.atan2(b, a) * (180 / Math.PI));
      }

      console.log(`Current Rotation: ${currentRotation}°`); // Debugging

      const newRotation = (currentRotation + 90) % 360;
      piece.style.transform = `rotate(${newRotation}deg)`;

      // Check if the puzzle is solved after rotation
      checkPuzzleSolved();
    }
  });
});
