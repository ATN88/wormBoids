function limitForce(force, maxForce) {
    let magnitude = Math.sqrt(force[0] * force[0] + force[1] * force[1]);
    if (magnitude > maxForce) {
        force[0] = (force[0] / magnitude) * maxForce;
        force[1] = (force[1] / magnitude) * maxForce;
    }
    return force;
}

function calculateShadeVariation(baseColor, lightScale) {
    const rgb = baseColor.match(/\d+/g).map(Number);
    let r = rgb[0];
    let g = rgb[1];
    let b = rgb[2];

    const minLightScale = -50; // Adjust for minimum darkness
    const maxLightScale = 200;  // Adjust for maximum lightness
    const minBrightness = 20; // Set minimum brightness here

    // Clamp lightScale within the defined limits
    lightScale = Math.max(minLightScale, Math.min(maxLightScale, lightScale));

    // Adjust all RGB components
    r = Math.max(minBrightness, Math.min(255, r - lightScale)); // Reduced multiplier
    g = Math.max(minBrightness, Math.min(255, g - lightScale)); // Reduced multiplier
    b = Math.max(minBrightness, Math.min(255, b - lightScale)); // Reduced multiplier

    return `rgb(${r}, ${g}, ${b})`;
}
