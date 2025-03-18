const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const widthHeight = 600;

canvas.width = widthHeight;
canvas.height = widthHeight; // Make it square for a perfect circle

const canvasContainer = document.getElementById('canvas-container');
canvasContainer.style.width = canvas.width + 'px';
canvasContainer.style.height = canvas.height + 'px';
canvasContainer.style.overflow = 'hidden'; // Hide overflow

// Function to create a circular clipping region
function createCircularClip(ctx, centerX, centerY, radius) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
}

let boids = [];
let worms = [];
const numBoids = 200;
const numWorms = 2;
const boidSize = 1.5;
const boidResize = 1;
const maxSpeed = 2;
const maxForce = 0.2;
const viewRadius = 100;
const separationRadius = 30;
const alignmentWeight = 0.1;
const cohesionWeight = 0.1;
const separationWeight = 0.2;
const mouseInfluence = -1.5;
let mouseX = 0;
let mouseY = 0;
let lightScale = 0;
let wormLightScale = 0;

function initialize() {
    for (let i = 0; i < numBoids; i++) {
        const baseColor = `rgb(${Math.floor(Math.random() * 55)}, ${Math.floor(Math.random() * 55)}, ${Math.floor(Math.random() * 255)})`;
        boids.push(new Boid(Math.random() * canvas.width, Math.random() * canvas.height, maxSpeed, alignmentWeight, cohesionWeight, separationWeight, maxForce, mouseInfluence, separationRadius, viewRadius, canvas, baseColor));
    }
    for (let i = 0; i < numWorms; i++) {
        worms.push(new Worm(Math.random() * canvas.width, Math.random() * canvas.height, canvas));
    }
}

function update() {
    boids.forEach(boid => {
        boid.update(boids, worms, mouseX, mouseY, canvas.height);
    });
    worms.forEach(worm => {
        worm.update(boids);
    });
    lightScale = Math.sin(Date.now() * 0.001) * 30-20;
    wormLightScale = Math.sin(Date.now() * 0.003 + Math.PI) * 50;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    // Clip the canvas to a circle
    createCircularClip(ctx, canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2);
    
    boids.forEach(boid => {
        // Layered drawing
        boid.draw(1.25, 2.5, lightScale, ctx);
        boid.draw(0, 1, lightScale+20, ctx);
    });
    worms.forEach(worm => {
        worm.draw(ctx);
    });
}

function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
}

canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});


function createCircleCursor() {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    const cursorSize = 10; // Match the boid size
    tempCanvas.width = cursorSize;
    tempCanvas.height = cursorSize;

    tempCtx.clearRect(0, 0, cursorSize, cursorSize);

    const lightScale = Math.sin(Date.now() * 0.001) * 50; // Oscillating light scale

    // Generate a random color
    const randomColor = calculateShadeVariation("rgb(55, 55, 255)", lightScale);

    // Draw a filled circle
    tempCtx.fillStyle = randomColor;
    tempCtx.beginPath();
    tempCtx.arc(cursorSize / 2, cursorSize / 2, cursorSize / 2, 0, Math.PI * 2);
    tempCtx.fill();

    // Draw a filled circle
    tempCtx.fillStyle = 'darkblue';
    tempCtx.beginPath();
    tempCtx.arc(cursorSize / 4, cursorSize / 4, cursorSize / 4, 0, Math.PI * 2);
    tempCtx.fill();


    const cursorDataURL = tempCanvas.toDataURL();

    canvas.style.cursor = `url('${cursorDataURL}') ${cursorSize / 2} ${cursorSize / 2}, auto`;
}

// Call createCircleCursor periodically to update the cursor color
function updateCursor() {
    createCircleCursor();
    requestAnimationFrame(updateCursor);
}

const canvasContainerElement = document.getElementById('canvas-container');
let borderAnimationId; // Variable to store the animation frame ID

function animateBorderColor() {
    const lightScale = Math.sin(Date.now() * 0.001) * 50;
    const oscillatingColor = calculateShadeVariation("rgb(55, 55, 128)", lightScale); // Use a gray base color

    canvasContainerElement.style.borderColor = oscillatingColor;
    borderAnimationId = requestAnimationFrame(animateBorderColor);
}

canvasContainerElement.addEventListener('mouseover', () => {
    animateBorderColor();
});

canvasContainerElement.addEventListener('mouseout', () => {
    cancelAnimationFrame(borderAnimationId);
    canvasContainerElement.style.borderColor = 'darkgray'; // Reset to the original hover color
});

updateCursor();

initialize();
animate();