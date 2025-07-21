// JS Block: Interactivity and Three.js integration
// Updated: Window positioning adjusted for bottom taskbar. Maximize sets top to 0.
// Time is already added and updating.
// Added: Offset for new windows and z-index for bringing to front on click/open.
// Added: Bring window to front on mousedown anywhere on the window.
// Added: Snake game in snake-window with canvas, controls, and logic.
// Added: Larger initial size for Snake window, start button, and in-app game over display.
// Added: Taskbar items for open windows.

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
                // Cascade offset for new windows
                offsetCounter = (offsetCounter + 20) % 120; // Increment by 20px, reset after 100px to avoid drifting too far
                const baseLeft = (window.innerWidth - win.offsetWidth) / 2 + offsetCounter;
                const baseTop = (window.innerHeight - win.offsetHeight - 40) / 2 + offsetCounter; // Adjust for taller taskbar
                win.style.left = `${baseLeft}px`;
                win.style.top = `${baseTop}px`;

                // Make Snake window larger on open
                if (windowId === 'snake-window') {
                    win.style.width = '400px';
                    win.style.height = '400px';
                    resetSnakeUI(); // Show start button initially
                }

                addTaskbarItem(windowId);
            }
            win.style.display = 'block';
            // Bring to front on open
            win.style.zIndex = maxZ++;
        });
    });

    const windows = document.querySelectorAll('.window');
    windows.forEach(win => {
        // Bring to front on mousedown anywhere on the window
        win.addEventListener('mousedown', () => {
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
        });
        minBtn.addEventListener('click', () => {
            win.style.display = 'none';
            if (win.id === 'snake-window') {
                stopSnakeGame();
            }
        });
        maxBtn.addEventListener('click', () => {
            if (win.style.width === '100%') {
                win.style.width = '400px';
                win.style.height = '300px';
                win.style.left = '50%';
                win.style.top = '50%';
                win.style.transform = 'translate(-50%, -50%)';
                if (win.id === 'snake-window') {
                    win.style.height = '400px'; // Keep taller for Snake
                }
            } else {
                win.style.width = '100%';
                win.style.height = 'calc(100% - 40px)'; // Adjust for taller taskbar
                win.style.left = '0';
                win.style.top = '0';
                win.style.transform = 'none';
            }
        });
    });

    function makeDraggable(element, handle) {
        let isDragging = false;
        let offsetX, offsetY;

        handle.addEventListener('mousedown', (e) => {
            // Bring to front on click (mousedown on titlebar) - already handled by window mousedown
            isDragging = true;
            offsetX = e.clientX - element.getBoundingClientRect().left;
            offsetY = e.clientY - element.getBoundingClientRect().top;
            element.style.position = 'absolute';
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                element.style.left = `${e.clientX - offsetX}px`;
                element.style.top = `${e.clientY - offsetY}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
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
    let score = 0;
    const blockSize = 16;
    const gridSize = 20;
    const canvas = document.getElementById('snakeCanvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    const scoreElement = document.getElementById('snakeScore');
    const startButton = document.getElementById('snakeStartButton');
    const gameOverDiv = document.getElementById('snakeGameOver');
    const finalScoreElement = document.getElementById('snakeFinalScore');
    const restartButton = document.getElementById('snakeRestart');

    if (canvas) {
        canvas.width = blockSize * gridSize;
        canvas.height = blockSize * gridSize;
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

        // Game loop (100ms interval for retro speed)
        snakeGameInterval = setInterval(updateSnakeGame, 100);
    }

    function stopSnakeGame() {
        clearInterval(snakeGameInterval);
        document.removeEventListener('keydown', handleKeyDown);
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
            startSnakeGame();
        });
    }

    if (restartButton) {
        restartButton.addEventListener('click', () => {
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
    });
});
