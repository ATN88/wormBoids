class Boid {
    constructor(x, y, maxSpeed, alignmentWeight, cohesionWeight, separationWeight, maxForce, mouseInfluence, separationRadius, viewRadius, canvas, baseColor) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() * 20) * maxSpeed;
        this.vy = (Math.random() * 20) * maxSpeed;
        this.baseColor = baseColor;//set base color from parameter
        this.alignmentWeight = alignmentWeight;
        this.cohesionWeight = cohesionWeight*(Math.random()+1);
        this.separationWeight = separationWeight;
        this.maxForce = maxForce;
        this.mouseInfluence = mouseInfluence;
        this.separationRadius = separationRadius;
        this.viewRadius = viewRadius;
        this.canvas = canvas;
        this.maxSpeed = maxSpeed*(Math.random()+1);
    }

    update(boids, predators, mouseX, mouseY, canvasHeight, mouseInfluence) { 
        let alignment = this.calculateAlignment(boids);
        let cohesion = this.calculateCohesion(boids);
        let separation = this.calculateSeparation(boids);
        let flee = this.calculateFlee(predators);

        alignment = limitForce(alignment, this.maxForce);
        cohesion = limitForce(cohesion, this.maxForce);
        separation = limitForce(separation, this.maxForce);
        flee = limitForce(flee, this.maxForce * 4 * Math.random());

        this.vx += alignment[0] * this.alignmentWeight + cohesion[0] * this.cohesionWeight + separation[0] * this.separationWeight + flee[0];
        this.vy += alignment[1] * this.alignmentWeight + cohesion[1] * this.cohesionWeight + separation[1] * this.separationWeight + flee[1];

        let speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        let randomSpeedFactor = 0.5 + Math.random() * 1;
        let targetSpeed = this.maxSpeed * randomSpeedFactor;

        if (speed > targetSpeed) {
            this.vx = (this.vx / speed) * targetSpeed;
            this.vy = (this.vy / speed) * targetSpeed;
        }

        const rect = this.canvas.getBoundingClientRect();
        const dx = mouseX - this.x - rect.left;
        const dy = mouseY - this.y - rect.top;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let combinedForce = [0, 0];
        combinedForce[0] = alignment[0] * this.alignmentWeight + cohesion[0] * this.cohesionWeight + separation[0] * this.separationWeight;
        combinedForce[1] = alignment[1] * this.alignmentWeight + cohesion[1] * this.cohesionWeight + separation[1] * this.separationWeight;

        combinedForce = limitForce(combinedForce, this.maxForce);
        this.vx += combinedForce[0];
        this.vy += combinedForce[1];

        const xMargin = 200;
        const yMargin = 10;
        let forceX = 0;
        let forceY = 0;

        if (this.x < xMargin) {
            forceX = (xMargin - this.x) * this.maxSpeed * 0.001;
        } else if (this.x > this.canvas.width - xMargin) {
            forceX = (this.x - (this.canvas.width - xMargin)) * this.maxSpeed * 0.0001 * -1;
        }

        if (this.y < yMargin) {
            forceY = (yMargin - this.y) * this.maxSpeed * 0.1;
        } else if (this.y > canvasHeight - yMargin) { //Replaced seaFloorY with canvasHeight
            forceY = (canvasHeight - yMargin - this.y) * this.maxSpeed * 0.1;
        }

        this.vx += forceX;
        this.vy += forceY;

        let mouseForce = [0, 0];
        const mouseAffectRadius = 200;

        if (dist > 0 && dist < mouseAffectRadius) {
            const forceMagnitude = this.maxForce * (1 - (dist / mouseAffectRadius));
            mouseForce = limitForce([dx / dist, dy / dist], forceMagnitude);
        }

        this.vx += mouseForce[0] * this.mouseInfluence;
        this.vy += mouseForce[1] * this.mouseInfluence;

        speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > this.maxSpeed) {
            this.vx = (this.vx / speed) * this.maxSpeed;
            this.vy = (this.vy / speed) * this.maxSpeed;
        }

        this.x += this.vx;
        this.y += this.vy;

        this.x = (this.x + this.canvas.width) % this.canvas.width;
        this.y = (this.y + this.canvas.height) % this.canvas.height;
    }

    calculateAlignment(boids) {
        let avgX = 0, avgY = 0;
        let nearbyBoids = 0;

        for (const other of boids) {
            if (other !== this) {
                const dx = other.x - this.x;
                const dy = other.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.viewRadius) {
                    avgX += other.vx;
                    avgY += other.vy;
                    nearbyBoids++;
                }
            }
        }

        if (nearbyBoids > 0) {
            avgX /= nearbyBoids;
            avgY /= nearbyBoids;
            return [avgX, avgY];
        } else {
            return [0, 0];
        }
    }

    calculateCohesion(boids) {
        let avgX = 0, avgY = 0;
        let nearbyBoids = 0;

        for (const other of boids) {
            if (other !== this) {
                const dx = other.x - this.x;
                const dy = other.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.viewRadius) {
                    avgX += other.x;
                    avgY += other.y;
                    nearbyBoids++;
                }
            }
        }

        if (nearbyBoids > 0) {
            avgX /= nearbyBoids;
            avgY /= nearbyBoids;
            return [avgX - this.x, avgY - this.y];
        } else {
            return [0, 0];
        }
    }

    calculateSeparation(boids) {
        let sepX = 0, sepY = 0;
        let nearbyBoidsCount = 0;

        for (const other of boids) {
            if (other !== this) {
                const dx = other.x - this.x;
                const dy = other.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > 0 && dist < this.separationRadius) {
                    sepX -= dx / dist;
                    sepY -= dy / dist;
                    nearbyBoidsCount++;
                }
            }
        }

        const separationMagnitude = Math.sqrt(sepX * sepX + sepY * sepY);

        let adjustedSeparationMagnitude = separationMagnitude;
        if (nearbyBoidsCount > 0) {
            adjustedSeparationMagnitude += (1 + nearbyBoidsCount);
        }

        if (separationMagnitude > 0) {
            sepX = (sepX / separationMagnitude) * adjustedSeparationMagnitude;
            sepY = (sepY / separationMagnitude) * adjustedSeparationMagnitude;
        }

        return [sepX, sepY];
    }

    draw(offset, boidResize, lightScale, ctx) {
        let offsetX = 0;
        let offsetY = 0;

        if (offset !== 0) {
            offsetX = -2 * offset * (this.vx / Math.sqrt(this.vx * this.vx + this.vy * this.vy));
            offsetY = -2 * offset * (this.vy / Math.sqrt(this.vx * this.vx + this.vy * this.vy));
        }

        ctx.beginPath();
        ctx.arc(this.x + offsetX, this.y + offsetY, boidSize * boidResize, 0, Math.PI * 2);

        const shadeVariation = calculateShadeVariation(this.baseColor, lightScale);

        ctx.fillStyle = shadeVariation;
        ctx.fill();
        ctx.closePath();
    }


    calculateFlee(predators) {
        let fleeX = 0, fleeY = 0;
        let fleeRadius = 100;

        for (const predator of predators) {
            const dx = predator.x - this.x;
            const dy = predator.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < fleeRadius) {
                fleeX -= dx / dist;
                fleeY -= dy / dist;
            }
        }

        return [fleeX, fleeY];
    }
}