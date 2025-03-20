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
//let numBoids = 50;
let numWorms = 1;
const boidSize = 1.5;
const boidResize = 1;
const maxSpeed = 1;
const maxForce = 0.2;
const viewRadius = 75;
const separationRadius = 30;
const alignmentWeight = 0.1;
const cohesionWeight = 0.2;
const separationWeight = 0.3;
const mouseInfluence = 0.1; // make negative to have the mouse repel
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


// to avoid boids congregating in mouse's last know position <-- Not working very well - needs fixing
let isMouseOverCanvas = false;
canvas.addEventListener('mouseover', () => {
    isMouseOverCanvas = true;
});
canvas.addEventListener('mouseout', () => {
    isMouseOverCanvas = false;
});


function update() {
    for (const worm of worms) {
        worm.update(boids, worms); // Pass the 'worms' array here!
    }

    for (let i = boids.length - 1; i >= 0; i--){
        boids[i].update(boids, worms, mouseX, mouseY, canvas.height, isMouseOverCanvas ? mouseInfluence : 0);
    }

    lightScale = Math.sin(Date.now() * 0.001) * 30 - 20;
    wormLightScale = Math.sin(Date.now() * 0.0003 + Math.PI) * 50 - 50;
    checkAndSpawnBoids()
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    // Clip the canvas to a circle
    createCircularClip(ctx, canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2);
    
    boids.forEach(boid => {
        // Layered drawing
        boid.draw(1.25, 2.5, lightScale *2, ctx);
        boid.draw(0, 1, (lightScale+40) *2, ctx);
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
    const cursorSize = boidSize*5; // Match the boid size
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
    const oscillatingColor = calculateShadeVariation("rgb(0, 0, 68)", lightScale); // Use same color as the background

    canvasContainerElement.style.borderColor = oscillatingColor;
    borderAnimationId = requestAnimationFrame(animateBorderColor);
}

canvasContainerElement.addEventListener('mouseover', () => {
    animateBorderColor();
});

canvasContainerElement.addEventListener('mouseout', () => {
    cancelAnimationFrame(borderAnimationId);
    canvasContainerElement.style.borderColor = '#000044'; // Reset to the original hover color
});

// Slider integration
const boidSlider = document.getElementById('boidSlider');
const boidCountLabel = document.getElementById('boidCountLabel');
const wormSlider = document.getElementById('wormSlider');
const wormCountLabel = document.getElementById('wormCountLabel');

// Initialize numBoids with the slider's initial value
let numBoids = parseInt(boidSlider.value);
boidCountLabel.textContent = numBoids;
wormCountLabel.textContent = numWorms;

// Function to update boid count based on the slider value
function updateBoidCount() {
    numBoids = parseInt(boidSlider.value);
    boidCountLabel.textContent = numBoids;
    checkAndSpawnBoids(); // Let checkAndSpawnBoids handle the rest
checkAndSpawnWorms();
}

            function updateWormCount() {
                numWorms = parseInt(wormSlider.value);
                wormCountLabel.textContent = numWorms;
                checkAndSpawnWorms();
            }

// Initial check
initialize();
checkAndSpawnBoids();

// Add event listener to the slider
boidSlider.addEventListener('input', updateBoidCount);
wormSlider.addEventListener('input', updateWormCount);

function checkAndSpawnBoids() {
	//console.log(boids.length, numBoids);
    if (boids.length < numBoids) {
        // Add boids until boids.length === numBoids
        while (boids.length < numBoids) {
            // Use the oscillating color logic here
            const baseColor = `rgb(${Math.floor(Math.random() * 55)}, ${Math.floor(Math.random() * 55)}, ${Math.floor(Math.random() * 255)})`;
            boids.push(new Boid(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                maxSpeed,
                alignmentWeight,
                cohesionWeight,
                separationWeight,
                maxForce,
                mouseInfluence,
                separationRadius,
                viewRadius,
                canvas,
                baseColor // Pass the calculated baseColor
            ));
        }
    } else if (boids.length > numBoids) {
        // Remove boids until boids.length === numBoids
        boids.splice(numBoids, boids.length - numBoids);
    }
}

            function checkAndSpawnWorms() {
                if (worms.length < numWorms) {
                    while (worms.length < numWorms) {
                        worms.push(new Worm(Math.random() * canvas.width, Math.random() * canvas.height, canvas));
                    }
                } else if (worms.length > numWorms) {
                    worms.splice(numWorms, worms.length - numWorms);
                }
            }

updateCursor();

//setInterval(checkAndSpawnBoids, 1000); // 5000 milliseconds = 5 seconds

animate();
