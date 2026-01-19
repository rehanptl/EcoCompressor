importScripts('config.js');
// service-worker.js (2026 UPDATED VERSION)
console.log('Eco Compressor: Service Worker Loaded');

// 🟢 PASTE YOUR FRESH KEY HERE


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'compressWithGemini') {
        compressWithGemini(request.text)
            .then(result => sendResponse({ compressed: result }))
            .catch(error => {
                console.error('Gemini Failure:', error);
                sendResponse({ error: "Check Console", compressed: "Error: " + error.message });
            });
        return true; 
    }
});

async function compressWithGemini(text) {
    try {
        const systemRules = `
            ACT AS: A data compression algorithm.
            RULES: Remove grammar. Remove politeness. Merge ideas but keep meaning, keep questions as questions, and dont just summarize 
            Example: "Hello my name is jeff" -> "name is jeff"
        `;

        // 🚀 CHANGED TO: 'gemini-2.5-flash-lite'
        // This is the current free-tier standard as of Jan 2026.
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${self.CONFIG.API_KEY}`, 
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ 
                        role: "user", 
                        parts: [{ text: systemRules + "\n\nINPUT TO COMPRESS:\n" + text }] 
                    }],
                    generationConfig: { temperature: 0.4, maxOutputTokens: 100 }
                })
            }
        );

        const data = await response.json();

        // 🛑 HANDLE "TOO MANY REQUESTS" (429 ERROR)
        if (response.status === 429) {
            return "Error: Daily limit reached. Try tomorrow.";
        }

        if (!response.ok) {
            throw new Error(data.error?.message || `API Error: ${response.status}`);
        }

        return data.candidates[0].content.parts[0].text.trim();

    } catch (error) {
        throw error;
    }
}