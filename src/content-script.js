// This file contains the content script logic for the Eco Prompt Compressor extension.

const ENERGY_PER_TOKEN_WH = 0.00002;
const WATER_PER_WH_ML = 0.5;

// Function to estimate tokens based on text length
function estimateTokens(text) {
    return Math.ceil(text.length / 4);
}

// Function to compress text based on defined heuristics (regex-based fallback)
function compressTextRegex(text) {
    if (!text) return text;
    
    let result = text;
    
    // Remove filler phrases and unnecessary words
    const fillerPatterns = [
        /\b(please|can you|could you|would you|I was wondering if|I was thinking|just to let you know|by the way|I think|I believe|I think that|in my opinion)\b/gi,
        /\b(very|really|quite|rather|somewhat|fairly|pretty|just|simply|basically|actually|literally)\b\s+/gi,
        /\b(at this point in time|in this day and age|in order to|due to the fact that)\b/gi,
        /\b(and also|also|as well)\b/gi,
        /\b(the|a|an)\b\s+/gi  // Remove articles
    ];
    
    fillerPatterns.forEach(pattern => {
        result = result.replace(pattern, '');
    });
    
    // Replace verbose patterns with shorter versions
    const verbosePatterns = [
        { regex: /in a very detailed manner/gi, replacement: 'in detail' },
        { regex: /step by step/gi, replacement: 'step-by-step' },
        { regex: /a lot of/gi, replacement: 'many' },
        { regex: /in order to/gi, replacement: 'to' },
        { regex: /is able to/gi, replacement: 'can' },
        { regex: /is not able to/gi, replacement: "can't" },
        { regex: /does not/gi, replacement: "doesn't" },
        { regex: /do not/gi, replacement: "don't" },
        { regex: /will not/gi, replacement: "won't" },
        { regex: /cannot/gi, replacement: "can't" },
        { regex: /have to/gi, replacement: 'must' },
        { regex: /in addition/gi, replacement: 'plus' },
        { regex: /however/gi, replacement: 'but' },
        { regex: /furthermore/gi, replacement: 'plus' },
        { regex: /regarding/gi, replacement: 'about' },
        { regex: /concerning/gi, replacement: 'about' },
        { regex: /whether or not/gi, replacement: 'if' },
        { regex: /as a result/gi, replacement: 'so' },
        { regex: /for the purpose of/gi, replacement: 'for' }
    ];
    
    verbosePatterns.forEach(pattern => {
        result = result.replace(pattern.regex, pattern.replacement);
    });
    
    // Remove extra whitespace and normalize
    result = result.replace(/\s+/g, ' ').trim();
    
    return result;
}

console.log('Eco Prompt Compressor content script loaded');

// Listen for messages from the popup to compress text
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received:', request.action);
    
    if (request.action === 'compressText') {
        let activeElement = document.activeElement;
        let beforeText = '';
        let afterText = '';
        
        console.log('Active element:', activeElement?.tagName);
        
        // First, check if there's a focused input/textarea/contenteditable
        if (activeElement && (activeElement.tagName === 'TEXTAREA' || 
            (activeElement.tagName === 'INPUT' && activeElement.type === 'text') || 
            activeElement.isContentEditable)) {
            
            beforeText = activeElement.value || activeElement.innerText;
            console.log('Got text from focused element:', beforeText.substring(0, 50));
            
            if (beforeText.trim()) {
                // Try to compress with Gemini API first
                chrome.runtime.sendMessage({ action: 'compressWithGemini', text: beforeText }, (response) => {
                    if (response && response.success) {
                        afterText = response.text;
                        updateElementAndRespond(activeElement, beforeText, afterText, sendResponse);
                    } else {
                        // Fallback to regex compression
                        afterText = compressTextRegex(beforeText);
                        updateElementAndRespond(activeElement, beforeText, afterText, sendResponse);
                    }
                });
                return true;
            }
        }
        
        // Check if there's any selected text on the page
        const selection = window.getSelection();
        const selectedText = selection.toString();
        
        console.log('Selected text:', selectedText.substring(0, 50));
        
        if (selectedText && selectedText.trim().length > 0) {
            beforeText = selectedText;
            
            // Try Gemini API first
            chrome.runtime.sendMessage({ action: 'compressWithGemini', text: beforeText }, (response) => {
                if (response && response.success) {
                    afterText = response.text;
                } else {
                    afterText = compressTextRegex(beforeText);
                }
                
                console.log('Compressed selected text');
                
                // Try to replace the selected text in the DOM
                try {
                    if (selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        const textNode = document.createTextNode(afterText);
                        range.deleteContents();
                        range.insertNode(textNode);
                        selection.removeAllRanges();
                        console.log('Text replaced in DOM');
                    }
                } catch (e) {
                    console.log('Could not replace selected text:', e);
                }
                
                const tokensSaved = estimateTokens(beforeText) - estimateTokens(afterText);
                sendResponse({
                    beforeText,
                    afterText,
                    tokensSaved
                });
            });
            return true;
        }
        
        console.log('No text found');
        sendResponse(null);
        return true;
    }
});

function updateElementAndRespond(element, beforeText, afterText, sendResponse) {
    // Update the focused element with compressed text
    if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
        element.value = afterText;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
        element.innerText = afterText;
    }
    
    const tokensSaved = estimateTokens(beforeText) - estimateTokens(afterText);
    console.log('Sending response:', { beforeText: beforeText.substring(0, 50), tokensSaved });
    sendResponse({
        beforeText,
        afterText,
        tokensSaved
    });
}