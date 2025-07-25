// JS Block: Interactivity
// Updated: Window positioning adjusted for bottom taskbar. Maximize sets top to 0.
// Time is already added and updating.
// Added: Offset for new windows and z-index for bringing to front on click/open.
// Added: Bring window to front on mousedown anywhere on the window.
// Added: Snake game in snake-window with canvas, controls, and logic.
// Added: Larger initial size for Snake window, start button, and in-app game over display.
// Added: Taskbar items for open windows.
// Mobile improvements: Touch dragging for windows, touchstart for z-index, swipe controls for Snake, dynamic canvas resizing.
// New: Removed cascading offset for true centering, moved resizeSnakeCanvas after display:block for visibility fix, increased snake window size to 500px.
// Re-added small cascading offset for multiple windows.
// New: Adjusted window centering to avoid bottom-left corner, using transform and pre-display block.
// New: Removed Three.js cube code entirely.
// New: Added Minesweeper game logic with gamemodes, timer, grid generation, reveal/flag mechanics, win/loss detection.
// For Minesweeper: Uses buttons for cells, contextmenu for flagging, touch support (tap to reveal, long-press to flag).
// New: Added high score mechanics for Snake (higher scores better) and Minesweeper (lower times better, only on wins). Uses localStorage; prompts for 3-letter name after game end; displays top 10.
// New: Replaced browser prompt with in-game name input form styled as Win95 window; Minesweeper timer now in ms precision (performance.now()), displayed to 3 decimals.
// New: High scores integrated into game over/win divs without separate windows; displayed after game end until restart; fixed Snake canvas resize glitch by calling resize after full UI reset.
// New: High scores show on Snake app open under start button; on game end, prompt name, then update and return to start menu with high scores.
// Fix: Restored Minesweeper restart buttons to call reset + start; ensured timer updates real-time with requestAnimationFrame; centered grid in CSS; tightened icon hitboxes with flex/reduced padding/pointer-events.

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('boot-screen').style.display = 'none';
    }, 2000);

    function updateTime() {
        const time = new Date().toLocaleTimeString();
        document.getElementById('taskbar-time').innerText = time;
    }
    updateTime();
    setInterval(updateTime, 1000);

    document.getElementById('start-button').addEventListener('click', () => {
        alert('Welcome to the Start Menu! (Expand as needed)');
    });

    let maxZ = 10; // Global z-index counter
    let offsetCounter = 0; // Global offset for cascading windows

    const icons = document.querySelectorAll('.icon');
    icons.forEach(icon => {
        icon.addEventListener('click', () => {
            const windowId = icon.dataset.window;
            const win = document.getElementById(windowId);
            if (win.style.display !== 'block') {
                // Set display block first to ensure correct dimensions
                win.style.display = 'block';
                // For Snake window, set larger size and show high scores
                if (windowId === 'snake-window') {
                    win.style.width = '500px';
                    win.style.height = '500px';
                    resetSnakeUI();
                    displaySnakeHighScores(); // Show high scores on open
                    snakeHighScoresDiv.style.display = 'block';
                }
                // For Minesweeper window, set size and reset UI
                if (windowId === 'minesweeper-window') {
                    win.style.width = '600px';
                    win.style.height = '500px';
                    resetMinesweeperUI();
                }
                // Cascade offset (smaller to stay near center)
                offsetCounter = (offsetCounter + 20) % 100; // Increment by 20px, reset after 100px
                // Center window with transform for precise positioning
                win.style.left = '50%';
                win.style.top = '50%';
                win.style.transform = `translate(-50%, -50%) translate(${offsetCounter}px, ${offsetCounter}px)`;
                addTaskbarItem(windowId);
                // Resize snake canvas after window is visible
                if (windowId === 'snake-window') {
                    resizeSnakeCanvas();
                }
            }
            win.style.zIndex = maxZ++;
        });
    });

    const windows = document.querySelectorAll('.window');
    windows.forEach(win => {
        // Bring to front on mousedown or touchstart anywhere on the window
        win.addEventListener('mousedown', () => {
            win.style.zIndex = maxZ++;
        });
        win.addEventListener('touchstart', () => {
            win.style.zIndex = maxZ++;
        });

        const closeBtn = win.querySelector('.close');
        const minBtn = win.querySelector('.minimize');
        const maxBtn = win.querySelector('.maximize');

        closeBtn.addEventListener('click', () => {
            win.style.display = 'none';
            removeTaskbarItem(win.id);
            if (win.id === 'snake-window') {
                stopSnakeGame();
            }
            if (win.id === 'minesweeper-window') {
                stopMinesweeperGame();
            }
        });
        minBtn.addEventListener('click', () => {
            win.style.display = 'none';
            if (win.id === 'snake-window') {
                stopSnakeGame();
            }
            if (win.id === 'minesweeper-window') {
                stopMinesweeperGame();
            }
        });
        maxBtn.addEventListener('click', () => {
            if (win.style.width === '100%') {
                win.style.width = '600px';
                win.style.height = '400px';
                win.style.left = '50%';
                win.style.top = '50%';
                win.style.transform = 'translate(-50%, -50%)';
                if (win.id === 'snake-window') {
                    win.style.width = '500px';
                    win.style.height = '500px';
                    resizeSnakeCanvas();
                }
                if (win.id === 'minesweeper-window') {
                    resetMinesweeperGrid(); // Resize grid on maximize/restore
                }
            } else {
                win.style.width = '100%';
                win.style.height = 'calc(100% - 40px)'; // Adjust for taller taskbar
                win.style.left = '0';
                win.style.top = '0';
                win.style.transform = 'none';
                if (win.id === 'snake-window') {
                    resizeSnakeCanvas();
                }
                if (win.id === 'minesweeper-window') {
                    resetMinesweeperGrid(); // Resize grid on maximize
                }
            }
        });
    });

    function makeDraggable(element, handle) {
        let isDragging = false;
        let offsetX, offsetY;

        function startDrag(e) {
            e.preventDefault();
            isDragging = true;
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            offsetX = clientX - element.getBoundingClientRect().left;
            offsetY = clientY - element.getBoundingClientRect().top;
            element.style.position = 'absolute';
        }

        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                const clientX = e.clientX || (e.touches && e.touches[0].clientX);
                const clientY = e.clientY || (e.touches && e.touches[0].clientY);
                element.style.left = `${clientX - offsetX}px`;
                element.style.top = `${clientY - offsetY}px`;
                element.style.transform = 'none'; // Reset transform during drag
            }
        }

        function endDrag() {
            isDragging = false;
        }

        handle.addEventListener('mousedown', startDrag);
        handle.addEventListener('touchstart', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);
    }

    windows.forEach(win => {
        const titlebar = win.querySelector('.titlebar');
        makeDraggable(win, titlebar);
    });

    function addTaskbarItem(windowId) {
        const openApps = document.getElementById('open-apps');
        if (document.getElementById(`taskbar-${windowId}`)) return;

        const win = document.getElementById(windowId);
        const title = win.querySelector('.titlebar span').textContent;
        const iconSrc = document.querySelector(`.icon[data-window="${windowId}"] img`).src;

        const appBtn = document.createElement('button');
        appBtn.id = `taskbar-${windowId}`;
        appBtn.classList.add('taskbar-app');
        appBtn.innerHTML = `<img src="${iconSrc}" alt="${title}"> <span>${title}</span>`;
        appBtn.addEventListener('click', () => {
            if (win.style.display === 'block') {
                win.style.display = 'none';
                if (windowId === 'snake-window') {
                    stopSnakeGame();
                }
                if (windowId === 'minesweeper-window') {
                    stopMinesweeperGame();
                }
            } else {
                win.style.display = 'block';
                win.style.zIndex = maxZ++;
                if (windowId === 'snake-window') {
                    resetSnakeUI();
                    resizeSnakeCanvas();
                    displaySnakeHighScores(); // Show high scores on re-open
                    snakeHighScoresDiv.style.display = 'block';
                }
                if (windowId === 'minesweeper-window') {
                    resetMinesweeperUI();
                }
            }
        });
        openApps.appendChild(appBtn);
    }

    function removeTaskbarItem(windowId) {
        const btn = document.getElementById(`taskbar-${windowId}`);
        if (btn) btn.remove();
    }

    // Snake Game Logic (unchanged)

    // Minesweeper Game Logic
    let minesweeperTimerInterval;
    let minesweeperStartTime = 0;
    let minesweeperTime = 0;
    let minesweeperGrid;
    let minesweeperMines;
    let minesweeperRevealed;
    let minesweeperFlags;
    let minesweeperGameActive = false;
    const minesweeperStartBtn = document.getElementById('minesweeper-start');
    const minesweeperModeSelect = document.getElementById('minesweeper-mode');
    const minesweeperGridDiv = document.getElementById('minesweeper-grid');
    const minesweeperTimerDiv = document.getElementById('minesweeper-timer');
    const minesweeperFlagsDiv = document.getElementById('minesweeper-flags');
    const minesweeperGameOverDiv = document.getElementById('minesweeper-gameover');
    const minesweeperWinDiv = document.getElementById('minesweeper-win');
    const minesweeperRestartBtn = document.getElementById('minesweeper-restart');
    const minesweeperRestartWinBtn = document.getElementById('minesweeper-restart-win');
    const minesweeperNameInputDiv = document.getElementById('minesweeperNameInput');
    const minesweeperNameField = document.getElementById('minesweeperNameField');
    const minesweeperNameSubmit = document.getElementById('minesweeperNameSubmit');
    let touchTimer;
    let currentMinesweeperTime = 0;

    function resetMinesweeperUI() {
        minesweeperStartBtn.style.display = 'block';
        minesweeperModeSelect.style.display = 'block';
        minesweeperGridDiv.style.display = 'none';
        minesweeperTimerDiv.style.display = 'none';
        minesweeperFlagsDiv.style.display = 'none';
        minesweeperGameOverDiv.style.display = 'none';
        minesweeperWinDiv.style.display = 'none';
        minesweeperNameInputDiv.style.display = 'none';
        minesweeperTime = 0;
        minesweeperTimerDiv.innerText = 'Time: 0';
        minesweeperFlagsDiv.innerText = 'Flags: 0';
        minesweeperGridDiv.innerHTML = ''; // Clear grid on reset
        minesweeperGridDiv.style.pointerEvents = 'auto'; // Re-enable clicks
    }

    function startMinesweeperGame() {
        const mode = minesweeperModeSelect.value;
        let rows, cols, mines;
        if (mode === 'beginner') {
            rows = 9; cols = 9; mines = 10;
        } else if (mode === 'intermediate') {
            rows = 16; cols = 16; mines = 40;
        } else {
            rows = 16; cols = 30; mines = 99;
        }

        generateMinesweeperGrid(rows, cols, mines);
        minesweeperStartBtn.style.display = 'none';
        minesweeperModeSelect.style.display = 'none';
        minesweeperGridDiv.style.display = 'grid';
        minesweeperTimerDiv.style.display = 'block';
        minesweeperFlagsDiv.style.display = 'block';
        minesweeperGameActive = true;
        minesweeperStartTime = performance.now();
        minesweeperTimerInterval = requestAnimationFrame(updateMinesweeperTimer);
    }

    function updateMinesweeperTimer() {
        minesweeperTime = (performance.now() - minesweeperStartTime) / 1000;
        minesweeperTimerDiv.innerText = `Time: ${minesweeperTime.toFixed(3)}`;
        if (minesweeperGameActive) {
            requestAnimationFrame(updateMinesweeperTimer);
        }
    }

    function stopMinesweeperGame(isWin = false) {
        cancelAnimationFrame(minesweeperTimerInterval);
        minesweeperGameActive = false;
        if (isWin) {
            currentMinesweeperTime = minesweeperTime;
            minesweeperNameInputDiv.style.display = 'block';
            minesweeperNameField.focus();
        } else {
            displayMinesweeperHighScores(isWin); // On loss, display in game over div
        }
    }

    function generateMinesweeperGrid(rows, cols, numMines) {
        minesweeperGrid = Array.from({length: rows}, () => Array(cols).fill(0));
        minesweeperRevealed = Array.from({length: rows}, () => Array(cols).fill(false));
        minesweeperFlags = Array.from({length: rows}, () => Array(cols).fill(false));
        minesweeperMines = new Set();

        // Place mines
        while (minesweeperMines.size < numMines) {
            const r = Math.floor(Math.random() * rows);
            const c = Math.floor(Math.random() * cols);
            minesweeperMines.add(`${r},${c}`);
        }

        // Calculate numbers
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (minesweeperMines.has(`${r},${c}`)) continue;
                let count = 0;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (dr === 0 && dc === 0) continue;
                        if (minesweeperMines.has(`${r+dr},${c+dc}`)) count++;
                    }
                }
                minesweeperGrid[r][c] = count;
            }
        }

        // Render grid
        minesweeperGridDiv.innerHTML = '';
        minesweeperGridDiv.style.gridTemplateRows = `repeat(${rows}, 20px)`;
        minesweeperGridDiv.style.gridTemplateColumns = `repeat(${cols}, 20px)`;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = document.createElement('button');
                cell.classList.add('minesweeper-cell');
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.addEventListener('click', handleMinesweeperReveal);
                cell.addEventListener('contextmenu', handleMinesweeperFlag);
                // Touch support: tap for reveal, long-press for flag
                cell.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    touchTimer = setTimeout(() => handleMinesweeperFlag(e), 500);
                });
                cell.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    clearTimeout(touchTimer);
                    if (e.target.classList.contains('revealed')) return;
                    handleMinesweeperReveal(e);
                });
                minesweeperGridDiv.appendChild(cell);
            }
        }
        updateFlagsCount();
    }

    function handleMinesweeperReveal(e) {
        if (!minesweeperGameActive) return;
        const cell = e.target;
        const r = parseInt(cell.dataset.row);
        const c = parseInt(cell.dataset.col);
        if (minesweeperFlags[r][c] || minesweeperRevealed[r][c]) return;

        if (minesweeperMines.has(`${r},${c}`)) {
            cell.classList.add('mine');
            revealAllMines();
            minesweeperGameOverDiv.style.display = 'block';
            stopMinesweeperGame(false); // Loss, no save
            return;
        }

        revealCell(r, c);
        checkWin();
    }

    function handleMinesweeperFlag(e) {
        e.preventDefault();
        if (!minesweeperGameActive) return;
        const cell = e.target;
        const r = parseInt(cell.dataset.row);
        const c = parseInt(cell.dataset.col);
        if (minesweeperRevealed[r][c]) return;

        minesweeperFlags[r][c] = !minesweeperFlags[r][c];
        cell.classList.toggle('flagged');
        cell.innerText = minesweeperFlags[r][c] ? '🚩' : '';
        updateFlagsCount();
    }

    function revealCell(r, c) {
        if (r < 0 || r >= minesweeperGrid.length || c < 0 || c >= minesweeperGrid[0].length || minesweeperRevealed[r][c] || minesweeperFlags[r][c]) return;
        minesweeperRevealed[r][c] = true;
        const cell = minesweeperGridDiv.querySelector(`[data-row="${r}"][data-col="${c}"]`);
        cell.classList.add('revealed');
        cell.innerText = minesweeperGrid[r][c] > 0 ? minesweeperGrid[r][c] : '';
        if (minesweeperGrid[r][c] === 0) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    revealCell(r + dr, c + dc);
                }
            }
        }
    }

    function revealAllMines() {
        minesweeperMines.forEach(pos => {
            const [r, c] = pos.split(',').map(Number);
            const cell = minesweeperGridDiv.querySelector(`[data-row="${r}"][data-col="${c}"]`);
            cell.classList.add('mine');
            cell.innerText = '💣';
        });
    }

    function checkWin() {
        let revealedCount = 0;
        minesweeperRevealed.forEach(row => row.forEach(rev => { if (rev) revealedCount++; }));
        if (revealedCount === (minesweeperGrid.length * minesweeperGrid[0].length - minesweeperMines.size)) {
            minesweeperWinDiv.style.display = 'block';
            stopMinesweeperGame(true); // Win, handle high score
        }
    }

    function updateFlagsCount() {
        let count = 0;
        minesweeperFlags.forEach(row => row.forEach(flag => { if (flag) count++; }));
        minesweeperFlagsDiv.innerText = `Flags: ${count}`;
    }

    function resetMinesweeperGrid() {
        // Re-generate grid on resize/maximize
        if (minesweeperGameActive) {
            startMinesweeperGame();
        }
    }

    // High score functions for Minesweeper
    function saveMinesweeperHighScore(name, time) {
        let highScores = JSON.parse(localStorage.getItem('minesweeperHighScores')) || [];
        highScores.push({ name, time });
        highScores.sort((a, b) => a.time - b.time); // Sort ascending (lower time better)
        highScores = highScores.slice(0, 10); // Keep top 10
        localStorage.setItem('minesweeperHighScores', JSON.stringify(highScores));
    }

    function displayMinesweeperHighScores(isWin) {
        const highScores = JSON.parse(localStorage.getItem('minesweeperHighScores')) || [];
        const targetDiv = isWin ? minesweeperWinDiv : minesweeperGameOverDiv;
        targetDiv.querySelectorAll('.high-score-list').forEach(el => el.remove());
        let highScoreHTML = '<div class="high-score-list"><h3>Top 10 Minesweeper Times</h3><ul>' + 
            highScores.map((hs, i) => `<li>${i + 1}. ${hs.name} - ${hs.time.toFixed(3)}s</li>`).join('') + 
            '</ul></div>';
        targetDiv.insertAdjacentHTML('beforeend', highScoreHTML); // Append to game over/win for integrated display
    }

    // Minesweeper name input submission (only on win)
    minesweeperNameField.addEventListener('input', () => {
        minesweeperNameField.value = minesweeperNameField.value.toUpperCase().substring(0, 3);
    });

    minesweeperNameSubmit.addEventListener('click', () => {
        const name = minesweeperNameField.value;
        if (/^[A-Z]{3}$/.test(name)) {
            saveMinesweeperHighScore(name, currentMinesweeperTime);
            minesweeperNameInputDiv.style.display = 'none';
            displayMinesweeperHighScores(true); // Display after save
        } else {
            alert('Invalid name! Must be exactly 3 uppercase letters.');
        }
    });

    // Event listeners for Minesweeper
    minesweeperStartBtn.addEventListener('click', startMinesweeperGame);
    minesweeperRestartBtn.addEventListener('click', () => {
        resetMinesweeperUI();
        startMinesweeperGame();
    });
    minesweeperRestartWinBtn.addEventListener('click', () => {
        resetMinesweeperUI();
        startMinesweeperGame();
    });

    window.addEventListener('resize', () => {
        if (document.getElementById('snake-window').style.display === 'block') {
            resizeSnakeCanvas();
        }
        if (document.getElementById('minesweeper-window').style.display === 'block') {
            resetMinesweeperGrid();
        }
    });
});
