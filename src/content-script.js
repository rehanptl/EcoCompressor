// content-script.js

// 1. Better Token Estimation
function estimateTokens(text) {
    return Math.ceil(text.length / 4);
}

// 2. The API Caller
async function compressWithAPI(text) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            { action: 'compressWithGemini', text: text },
            (response) => {
                // Check if Chrome failed to send the message (Service Worker asleep/dead)
                if (chrome.runtime.lastError) {
                    console.error("Connection Error:", chrome.runtime.lastError.message);
                    reject(new Error("Service Worker not responding"));
                    return;
                }
                
                if (response && response.compressed) {
                    resolve(response.compressed);
                } else {
                    console.error("API Error Details:", response ? response.error : "Unknown error");
                    reject(new Error(response?.error || "API failed"));
                }
            }
        );
    });
}

// 3. The "Dumb" Fallback (NOW AGGRESSIVE)
function compressTextRegex(text) {
    if (!text) return text;
    console.log('⚠️ API FAILED - RUNNING FALLBACK REGEX');
    
    let result = text.toLowerCase();
    
    // Remove "I", "my", "is", "are" - be brutal
    result = result.replace(/\b(i|my|mine|me|you|your|he|she|it|we|they|is|are|was|were|am|be|been)\b/g, '');
    
    // Remove politeness
    result = result.replace(/\b(please|thanks|thank you|hello|hi|hey|idk|sorry)\b/g, '');
    
    // Remove articles/connectors
    result = result.replace(/\b(a|an|the|and|but|so|or|for|nor)\b/g, '');
    
    // Clean up spaces
    result = result.replace(/[^\w\s]/g, ''); // Remove punctuation
    result = result.replace(/\s+/g, ' ').trim();
    
    return result;
}

// 4. Message Listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'compressText') {
        let activeElement = document.activeElement;
        let beforeText = '';

        // Get Text
        if (activeElement && (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT' || activeElement.isContentEditable)) {
            beforeText = activeElement.value || activeElement.innerText;
        } else {
            beforeText = window.getSelection().toString();
        }

        if (!beforeText || !beforeText.trim()) {
            sendResponse(null);
            return true;
        }

        console.log('Attempting to compress:', beforeText);

        // Try API first, then Fallback
        compressWithAPI(beforeText)
            .then(compressed => {
                console.log('✅ API SUCCESS');
                updatePageAndRespond(activeElement, beforeText, compressed, sendResponse);
            })
            .catch(error => {
                console.warn('❌ API FAILED, USING FALLBACK. Reason:', error);
                const fallbackText = compressTextRegex(beforeText);
                updatePageAndRespond(activeElement, beforeText, fallbackText, sendResponse);
            });

        return true; // Keep channel open
    }
});

function updatePageAndRespond(element, before, after, sendResponse) {
    // Update DOM if possible
    if (element) {
        if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
            element.value = after;
            element.dispatchEvent(new Event('input', { bubbles: true }));
        } else if (element.isContentEditable) {
            element.innerText = after;
        }
    } else {
        // Handle selection replacement
        try {
            const range = window.getSelection().getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(after));
        } catch(e) {}
    }

    const tokensSaved = estimateTokens(before) - estimateTokens(after);
    sendResponse({
        beforeText: before,
        afterText: after,
        tokensSaved: tokensSaved
    });
}