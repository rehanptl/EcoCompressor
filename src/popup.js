document.addEventListener('DOMContentLoaded', () => {
    const compressBtn = document.getElementById('compressBtn');
    const status = document.getElementById('status');
    const statsArea = document.getElementById('statsArea');
    const wordsArea = document.getElementById('wordsArea'); // New container

    // UI Elements
    const tokensSavedDisplay = document.getElementById('tokensSaved');
    const waterSavedDisplay = document.getElementById('waterSaved');
    const energySavedDisplay = document.getElementById('energySaved');
    const carbonSavedDisplay = document.getElementById('carbonSaved');
    const treesSavedDisplay = document.getElementById('treesSaved');

    compressBtn.addEventListener('click', async () => {
        status.textContent = "♻️ Calculating Eco-Impact...";
        status.style.color = "#059669"; 
        
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => window.getSelection().toString()
        }, (results) => {
            if (!results || !results[0] || !results[0].result) {
                status.textContent = "⚠️ Please highlight text to optimize.";
                status.style.color = "#ef4444"; 
                return;
            }

            const originalText = results[0].result;
            const originalWordCount = originalText.trim().split(/\s+/).length;

            chrome.runtime.sendMessage({ 
                action: 'compressWithGemini', 
                text: originalText 
            }, (response) => {
                
                if (response.error) {
                    status.textContent = "❌ Error: " + response.error;
                    status.style.color = "#ef4444";
                    return;
                }

                const compressedText = response.compressed;
                const newWordCount = compressedText.trim().split(/\s+/).length;
                const wordsRemoved = originalWordCount - newWordCount;

                // --- ECO IMPACT MATH ---
                // 1. Water: 1 word ~ 0.5ml (Cooling data centers)
                const waterSaved = (wordsRemoved * 0.5).toFixed(1);

                // 2. Energy: 1 word ~ 1.2 Joules (Transmission/Processing)
                const energySaved = (wordsRemoved * 1.2).toFixed(1);

                // 3. Carbon: 1 Joule ~ 0.4mg CO2
                const carbonSaved = (energySaved * 400).toFixed(0); 

                // 4. Trees: Paper equivalence (500 words = 1 sheet)
                const treesSaved = (wordsRemoved * 0.002).toFixed(3); 

                // Update UI
                statsArea.style.display = 'grid'; // Show the 2x2 grid
                wordsArea.style.display = 'block'; // Show the bottom stat
                
                tokensSavedDisplay.textContent = wordsRemoved > 0 ? wordsRemoved : 0;
                waterSavedDisplay.textContent = (wordsRemoved > 0 ? waterSaved : 0) + " ml";
                energySavedDisplay.textContent = (wordsRemoved > 0 ? energySaved : 0) + " J";
                carbonSavedDisplay.textContent = (wordsRemoved > 0 ? carbonSaved : 0) + " mg";
                treesSavedDisplay.textContent = (wordsRemoved > 0 ? treesSaved : 0);

                status.textContent = "✨ Impact Verified: Efficiency Increased";
                status.style.color = "#059669";

                // Replace text on page
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: (newText) => {
                        const range = window.getSelection().getRangeAt(0);
                        range.deleteContents();
                        range.insertNode(document.createTextNode(newText));
                    },
                    args: [compressedText]
                });
            });
        });
    });
});