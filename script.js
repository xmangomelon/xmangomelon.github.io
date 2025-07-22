// JS Block: Interactivity and Three.js integration
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
// New: Added win.scrollTop = 0 to ensure content starts at top.
// New: Added touch events to buttons for mobile functionality.

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
                // For Snake window, set larger size
                if (windowId === 'snake-window') {
                    win.style.width = '500px';
                    win.style.height = '500px';
                    resetSnakeUI();
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
                // Scroll window content to top
                win.scrollTop = 0;
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

        // Add touch events for buttons on mobile
        closeBtn.addEventListener('touchstart', () => {
            win.style.display = 'none';
            removeTaskbarItem(win.id);
            if (win.id === 'snake-window') {
                stopSnakeGame();
            }
        });
        closeBtn.addEventListener('click', () => {
            win.style.display = 'none';
            removeTaskbarItem(win.id);
            if (win.id === 'snake-window') {
                stopSnakeGame();
            }
        });

        minBtn.addEventListener('touchstart', () => {
            win.style.display = 'none';
            if (win.id === 'snake-window') {
                stopSnakeGame();
            }
        });
        minBtn.addEventListener('click', () => {
            win.style.display = 'none';
            if (win.id === 'snake-window') {
                stopSnakeGame();
            }
        });

        maxBtn.addEventListener('touchstart', () => {
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
            } else {
                win.style.width = '100%';
                win.style.height = 'calc(100% - 40px)'; // Adjust for taller taskbar
                win.style.left = '0';
                win.style.top = '0';
                win.style.transform = 'none';
                if (win.id === 'snake-window') {
                    resizeSnakeCanvas();
                }
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
            } else {
                win.style.width = '100%';
                win.style.height = 'calc(100% - 40px)'; // Adjust for taller taskbar
                win.style.left = '0';
                win.style.top = '0';
                win.style.transform = 'none';
                if (win.id === 'snake-window') {
                    resizeSnakeCanvas();
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
            } else {
                win.style.display = 'block';
                win.style.zIndex = maxZ++;
                if (windowId === 'snake-window') {
                    resetSnakeUI();
                    resizeSnakeCanvas();
                }
            }
        });
        openApps.appendChild(appBtn);
    }

    function removeTaskbarItem(windowId) {
        const btn = document.getElementById(`taskbar-${windowId}`);
        if (btn) btn.remove();
    }

    // Snake Game Logic
    let snakeGameInterval;
    let snake = [{x: 10, y: 10}]; // Initial snake position
    let food = {x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20)};
    let direction = {x: 0, y: 0}; // Initial direction (stopped)
    let blockSize = 16;
    const gridSize = 20;
    const canvas = document.getElementById('snakeCanvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    const scoreElement = document.getElementById('snakeScore');
    const startButton = document.getElementById('snakeStartButton');
    const gameOverDiv = document.getElementById('snakeGameOver');
    const finalScoreElement = document.getElementById('snakeFinalScore');
    const restartButton = document.getElementById('snakeRestart');
    let score = 0;
    let touchStartX = 0;
    let touchStartY = 0;

    function resizeSnakeCanvas() {
        const content = document.querySelector('#snake-window .content');
        let availableSize = Math.min(content.clientWidth - 20, content.clientHeight - 100, 480); // Increased max to 480px
        if (availableSize <= 0) {
            availableSize = 320; // Fallback default if size is 0 (hidden)
        }
        canvas.width = availableSize;
        canvas.height = availableSize;
        blockSize = availableSize / gridSize; // Scale block size dynamically
    }

    function resetSnakeUI() {
        startButton.style.display = 'block';
        canvas.style.display = 'none';
        scoreElement.style.display = 'none';
        gameOverDiv.style.display = 'none';
    }

    function startSnakeGame() {
        // Reset game state
        snake = [{x: 10, y: 10}];
        food = {x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20)};
        direction = {x: 1, y: 0}; // Start moving right
        score = 0;
        updateScore();

        canvas.style.display = 'block';
        scoreElement.style.display = 'block';
        gameOverDiv.style.display = 'none';

        // Keyboard controls (arrow keys)
        document.addEventListener('keydown', handleKeyDown);

        // Touch controls (swipe on canvas)
        canvas.addEventListener('touchstart', handleTouchStart);
        canvas.addEventListener('touchend', handleTouchEnd);

        // Game loop (100ms interval for retro speed)
        snakeGameInterval = setInterval(updateSnakeGame, 100);
    }

    function stopSnakeGame() {
        clearInterval(snakeGameInterval);
        document.removeEventListener('keydown', handleKeyDown);
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchend', handleTouchEnd);
        resetSnakeUI();
    }

    function handleKeyDown(e) {
        switch (e.key) {
            case 'ArrowUp': if (direction.y === 0) direction = {x: 0, y: -1}; break;
            case 'ArrowDown': if (direction.y === 0) direction = {x: 0, y: 1}; break;
            case 'ArrowLeft': if (direction.x === 0) direction = {x: -1, y: 0}; break;
            case 'ArrowRight': if (direction.x === 0) direction = {x: 1, y: 0}; break;
        }
    }

    function handleTouchStart(e) {
        e.preventDefault();
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }

    function handleTouchEnd(e) {
        e.preventDefault();
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        const deltaY = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 20 && direction.x === 0) direction = {x: 1, y: 0}; // Right (threshold to avoid tiny swipes)
            else if (deltaX < -20 && direction.x === 0) direction = {x: -1, y: 0}; // Left
        } else {
            if (deltaY > 20 && direction.y === 0) direction = {x: 0, y: 1}; // Down
            else if (deltaY < -20 && direction.y === 0) direction = {x: 0, y: -1}; // Up
        }
    }

    function updateSnakeGame() {
        // Move snake
        const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};

        // Check collisions
        if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize || snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            finalScoreElement.innerText = score;
            canvas.style.display = 'none';
            scoreElement.style.display = 'none';
            gameOverDiv.style.display = 'block';
            stopSnakeGame();
            return;
        }

        snake.unshift(head);

        // Eat food
        if (head.x === food.x && head.y === food.y) {
            score++;
            updateScore();
            food = {x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20)};
        } else {
            snake.pop();
        }

        // Draw
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00FF00'; // Snake color
        snake.forEach(segment => {
            ctx.fillRect(segment.x * blockSize, segment.y * blockSize, blockSize, blockSize);
        });
        ctx.fillStyle = '#FF0000'; // Food color
        ctx.fillRect(food.x * blockSize, food.y * blockSize, blockSize, blockSize);
    }

    function updateScore() {
        scoreElement.innerText = 'Score: ' + score;
    }

    // Event listeners for start and restart buttons
    if (startButton) {
        startButton.addEventListener('click', () => {
            startButton.style.display = 'none';
            resizeSnakeCanvas();
            startSnakeGame();
        });
    }

    if (restartButton) {
        restartButton.addEventListener('click', () => {
            resizeSnakeCanvas();
            startSnakeGame();
        });
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg'), alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight - 40); // Adjust for taller taskbar

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    function animate() {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / (window.innerHeight - 40); // Adjust for taller taskbar
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight - 40);
        if (document.getElementById('snake-window').style.display === 'block') {
            resizeSnakeCanvas();
        }
    });
});
