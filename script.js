// JS Block: Interactivity and Three.js integration
// Handles window opening/closing/dragging, taskbar clock, boot screen, and Three.js for 3D background.
// Modular: Functions for each major feature to keep code reusable.

// Wait for DOM to load.
document.addEventListener('DOMContentLoaded', () => {
    // Boot screen: Hide after 2 seconds for nostalgic effect.
    setTimeout(() => {
        document.getElementById('boot-screen').style.display = 'none';
    }, 2000);

    // Taskbar clock: Update time every second.
    function updateTime() {
        const time = new Date().toLocaleTimeString();
        document.getElementById('taskbar-time').innerText = time;
    }
    updateTime();
    setInterval(updateTime, 1000);

    // Start button: Simple alert for demo; could open a menu.
    document.getElementById('start-button').addEventListener('click', () => {
        alert('Welcome to the Start Menu! (Expand as needed)');
    });

    // Icon clicks: Open corresponding window, position centered.
    const icons = document.querySelectorAll('.icon');
    icons.forEach(icon => {
        icon.addEventListener('click', () => {
            const windowId = icon.dataset.window;
            const win = document.getElementById(windowId);
            win.style.display = 'block';
            // Center window.
            win.style.left = `${(window.innerWidth - win.offsetWidth) / 2}px`;
            win.style.top = `${(window.innerHeight - win.offsetHeight) / 2 + 30}px`; // Offset for taskbar.
        });
    });

    // Window controls: Close, minimize (hide), maximize (full screen).
    const windows = document.querySelectorAll('.window');
    windows.forEach(win => {
        const closeBtn = win.querySelector('.close');
        const minBtn = win.querySelector('.minimize');
        const maxBtn = win.querySelector('.maximize');

        closeBtn.addEventListener('click', () => win.style.display = 'none');
        minBtn.addEventListener('click', () => win.style.display = 'none'); // Simple minimize (hide).
        maxBtn.addEventListener('click', () => {
            if (win.style.width === '100%') {
                win.style.width = '400px';
                win.style.height = '300px';
                win.style.left = '50%';
                win.style.top = '50%';
                win.style.transform = 'translate(-50%, -50%)';
            } else {
                win.style.width = '100%';
                win.style.height = 'calc(100% - 30px)'; // Account for taskbar.
                win.style.left = '0';
                win.style.top = '30px';
                win.style.transform = 'none';
            }
        });
    });

    // Draggable windows: Modular function to make any element draggable by a handle.
    function makeDraggable(element, handle) {
        let isDragging = false;
        let offsetX, offsetY;

        handle.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - element.getBoundingClientRect().left;
            offsetY = e.clientY - element.getBoundingClientRect().top;
            element.style.position = 'absolute'; // Ensure absolute for dragging.
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

    // Apply draggable to each window's titlebar.
    windows.forEach(win => {
        const titlebar = win.querySelector('.titlebar');
        makeDraggable(win, titlebar);
    });

    // Three.js Integration: Render a simple pseudo-3D background (rotating cube for retro wireframe effect).
    // Keeps interactivity minimal, visually consistent with 90s OS (like old screensavers).
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg'), alpha: true }); // Alpha for transparent bg.
    renderer.setSize(window.innerWidth, window.innerHeight - 30); // Adjust for taskbar.
    document.body.appendChild(renderer.domElement); // Already in HTML, but ensure.

    // Add a simple 3D cube with wireframe for nostalgic tech demo feel.
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    // Animation loop: Rotate cube slowly.
    function animate() {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
    }
    animate();

    // Handle window resize for responsiveness (update Three.js viewport).
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / (window.innerHeight - 30);
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight - 30);
    });
});
