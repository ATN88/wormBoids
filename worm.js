class Worm {
    constructor(x, y, canvas) {
        this.x = x;
        this.y = y;
        this.segments = [];
        this.segmentLength = 10;
        this.numSegments = 30;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = 1.5;
        this.turnSpeed = 0.05;
        this.canvas = canvas;
        this.baseColor = `rgb(${Math.floor(Math.random() * 155)}, ${Math.floor(Math.random() * 55)}, ${Math.floor(Math.random() * 55)})`;
        this.attractRadius = 100;
        this.attractForceMultiplier = 0.1;
        this.headSize = 5;
        this.segmentSize = 3;

        for (let i = 0; i < this.numSegments; i++) {
            this.segments.push({ x: this.x - i * this.segmentLength * Math.cos(this.angle), y: this.y - i * this.segmentLength * Math.sin(this.angle) });
        }
    }

    update(boids) {
        this.angle += (Math.random() - 0.5) * this.turnSpeed;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        this.x = (this.x + this.canvas.width) % this.canvas.width;
        this.y = (this.y + this.canvas.height) % this.canvas.height;

        this.segments.unshift({ x: this.x, y: this.y });
        this.segments.pop();

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
    }

    draw(ctx) {
        for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];
            const segmentLightScale = Math.sin(Date.now() * 0.003 + Math.PI + i * 0.1) * 50;
            const segmentShadeVariation = calculateShadeVariation(this.baseColor, segmentLightScale);

            ctx.beginPath();
            ctx.arc(segment.x, segment.y, this.segmentSize, 0, Math.PI * 2);
            ctx.fillStyle = segmentShadeVariation;
            ctx.fill();
            ctx.closePath();
        }

        const headLightScale = Math.sin(Date.now() * 0.003 + Math.PI) * 50;
        const headShadeVariation = calculateShadeVariation(this.baseColor, headLightScale);

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.headSize, 0, Math.PI * 2);
        ctx.fillStyle = headShadeVariation;
        ctx.fill();
        ctx.closePath();
    }
}