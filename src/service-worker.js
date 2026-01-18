// This file is the service worker that handles background tasks like API calls

// Keep the API key hidden - never expose to content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'compressWithGemini') {
        compressWithGemini(request.text).then(result => {
            sendResponse(result);
        }).catch(error => {
            console.error('Gemini compression error:', error);
            sendResponse({ error: error.message });
        });
        return true; // Keep channel open for async response
    }
});

async function compressWithGemini(text) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(['geminiApiKey'], async (data) => {
            if (!data.geminiApiKey) {
                reject(new Error('No API key configured'));
                return;
            }

            try {
                const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + data.geminiApiKey, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `Compress this text to be as concise as possible while keeping the meaning. Remove filler words, redundancy, and unnecessary details. Output ONLY the compressed text, nothing else:\n\n${text}`
                            }]
                        }]
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error?.message || 'API error');
                }

                const data = await response.json();
                const compressedText = data.candidates[0].content.parts[0].text;
                resolve({ success: true, text: compressedText });
            } catch (error) {
                reject(error);
            }
        });
    });
}
