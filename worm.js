class Worm {
    constructor(x, y, canvas) {
        this.x = x;
        this.y = y;
        this.segments = [];
        this.segmentLength = 10;
        this.numSegments = 30;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = 1.5;
        this.maxSpeed = 5; // Add maxSpeed property
        this.turnSpeed = 0.05;
        this.canvas = canvas;
        this.baseColor = `rgb(${Math.floor(Math.random() * 155)}, ${Math.floor(Math.random() * 55)}, ${Math.floor(Math.random() * 55)})`;
        this.attractRadius = 250;
        this.attractForceMultiplier = 0.1;
        this.headSize = 5;
        this.segmentSize = 3;

        this.repulsionRadius = 300; // Adjust as needed
        this.repulsionStrength = 0.005; // Adjust as needed

        this.flash = false;
        this.flashTimer = 0;
        this.flashOpacity = 1; // Add opacity variable

        for (let i = 0; i < this.numSegments; i++) {
            this.segments.push({
                x: this.x - i * this.segmentLength * Math.cos(this.angle),
                y: this.y - i * this.segmentLength * Math.sin(this.angle)
            });
        }
    }

    calculateRepulsion(worms) {
        let repulsionForce = {
            x: 0,
            y: 0
        };

        for (const other of worms) {
            if (other !== this) {
                const dx = other.x - this.x;
                const dy = other.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > 0 && dist < this.repulsionRadius) {
                    const forceMagnitude = this.repulsionStrength * (1 - dist / this.repulsionRadius);
                    repulsionForce.x -= (dx / dist) * forceMagnitude;
                    repulsionForce.y -= (dy / dist) * forceMagnitude;
                }
            }
        }

        return repulsionForce;
    }

    update(boids, worms) {
        this.angle += (Math.random() - 0.5) * this.turnSpeed;

        // Find the closest boid (for speed adjustment)
        let closestBoid = null;
        let closestDist = Infinity;

        for (const boid of boids) {
            const dx = boid.x - this.x;
            const dy = boid.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < closestDist) {
                closestDist = dist;
                closestBoid = boid;
            }
        }

        if (closestBoid) {
            // Adjust speed based on distance
            this.speed = Math.min(this.maxSpeed, 1.5 + (1 - (closestDist / this.attractRadius)) * 1.5);
        } else {
            this.speed = 1.5; // Reset to default speed if no boids are nearby
        }

        // Calculate attractForce and adjust angle
        let attractForce = [0, 0];

        for (const boid of boids) {
            const dx = boid.x - this.x;
            const dy = boid.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < this.attractRadius) {
                attractForce[0] += dx / dist;
                attractForce[1] += dy / dist;
            }
        }

        if (attractForce[0] !== 0 || attractForce[1] !== 0) {
            const targetAngle = Math.atan2(attractForce[1], attractForce[0]);
            let angleDiff = targetAngle - this.angle;

            if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

            this.angle += angleDiff * this.attractForceMultiplier;
        }

        const repulsion = this.calculateRepulsion(worms);
        this.x -= repulsion.x;
        this.y -= repulsion.y;

        // Move the worm based on the adjusted angle and speed
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        this.x = (this.x + this.canvas.width) % this.canvas.width;
        this.y = (this.y + this.canvas.height) % this.canvas.height;

        this.segments.unshift({
            x: this.x,
            y: this.y
        });
        this.segments.pop();

        // Collision detection and boid removal
        for (let i = boids.length - 1; i >= 0; i--) {
            const boid = boids[i];
            const dx = boid.x - this.x;
            const dy = boid.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < this.headSize + 5) {
                boids.splice(i, 1);
                this.numSegments += 10;
                this.segments.unshift({
                    x: this.x,
                    y: this.y
                });
                this.flash = true;
                this.flashTimer = 15;
                this.flashOpacity = 1; // Reset opacity when flash starts

                // Conditional tail removal
                if (this.segments.length > this.numSegments) {
                    this.segments.pop();
                }

                // Trigger flash
                this.flash = true;
                this.flashTimer = 15; // Adjust flash duration as needed
            }
        }
    }
    draw(ctx) {
        for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];
            const segmentLightScale = Math.sin(Date.now() * 0.003 + Math.PI + i * 0.1) * 50;
            const segmentShadeVariation = calculateShadeVariation(this.baseColor, segmentLightScale);

            // Calculate segment size based on index
            const segmentSize = this.segmentSize * (1 - i / this.segments.length * 0.7); // Adjust 0.7 for tapering

            ctx.beginPath();
            ctx.arc(segment.x, segment.y, segmentSize, 0, Math.PI * 2);
            ctx.fillStyle = segmentShadeVariation;
            ctx.fill();
            ctx.closePath();
        }

        if (this.flash) {
            const flashShadeVariation = calculateShadeVariation(this.baseColor, -255);

            // Adjust opacity based on flash timer
            this.flashOpacity = this.flashTimer / 15; // Linear fade

            // Apply opacity
            ctx.globalAlpha = this.flashOpacity;

            // Save, translate, rotate, and draw Bezier curve (same as before)
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.beginPath();
            ctx.moveTo(-this.headSize * 1.5, 0);
            ctx.bezierCurveTo(-this.headSize * 0.5, -this.headSize, this.headSize * 0.5, -this.headSize, this.headSize * 1.5, 0);
            ctx.bezierCurveTo(this.headSize * 0.5, this.headSize, -this.headSize * 0.5, this.headSize, -this.headSize * 1.5, 0);
            ctx.fillStyle = flashShadeVariation;
            ctx.fill();
            ctx.closePath();
            ctx.restore();

            // Reset globalAlpha
            ctx.globalAlpha = 1;

            this.flashTimer--;
            if (this.flashTimer <= 0) {
                this.flash = false;
            }
        } else {
            const headLightScale = Math.sin(Date.now() * 0.003 + Math.PI) * 50;
            const headShadeVariation = calculateShadeVariation(this.baseColor, headLightScale);

            // Save the current context state
            ctx.save();

            // Translate to the worm's center
            ctx.translate(this.x, this.y);

            // Rotate the context based on the worm's angle
            ctx.rotate(this.angle);

            ctx.beginPath();
            ctx.moveTo(-this.headSize * 1.5, 0); // Left point (relative to the translated center)
            ctx.bezierCurveTo(
                -this.headSize * 0.5, -this.headSize * 1.2,
                this.headSize * 0.5, -this.headSize * 1.2,
                this.headSize * 1.2, 0
            ); // Top curve
            ctx.bezierCurveTo(
                this.headSize * 0.5, this.headSize * 1.2,
                -this.headSize * 0.5, this.headSize * 1.2,
                -this.headSize * 1.2, 0
            ); // Bottom curve
            ctx.fillStyle = headShadeVariation;
            ctx.fill();
            ctx.closePath();

            // Restore the context to its previous state
            ctx.restore();
        }
    }
}
