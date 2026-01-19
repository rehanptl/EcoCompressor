// Utility functions for text compression and token estimation

const ENERGY_PER_TOKEN_WH = 0.00002; // Default energy saved per token in watt-hours
const WATER_PER_WH_ML = 0.5; // Default water saved per watt-hour in milliliters

const fillerPhrases = [
    /please\s+/gi,
    /can you\s+/gi,
    /I was wondering if\s+/gi,
    /could you\s+/gi,
    /I would like to\s+/gi,
    /would you mind\s+/gi,
];

const verbosePatterns = [
    { regex: /in a very detailed manner/gi, replacement: 'in detail' },
    { regex: /step by step/gi, replacement: 'step-by-step' },
];

function compressText(text) {
    // Remove filler phrases
    fillerPhrases.forEach(phrase => {
        text = text.replace(phrase, '');
    });

    // Remove repeated whitespace
    text = text.replace(/\s+/g, ' ').trim();

    // Replace verbose patterns
    verbosePatterns.forEach(pattern => {
        text = text.replace(pattern.regex, pattern.replacement);
    });

    // Prefer imperative verbs
    text = text.replace(/Can you\s+/gi, '').replace(/Could you\s+/gi, '');

    return text;
}

function estimateTokens(text) {
    return Math.ceil(text.length / 4);
}

function calculateEcoImpact(tokensSaved) {
    const energySavedWh = tokensSaved * ENERGY_PER_TOKEN_WH;
    const waterSavedMl = energySavedWh * WATER_PER_WH_ML;
    return { energySavedWh, waterSavedMl };
}

export { compressText, estimateTokens, calculateEcoImpact };