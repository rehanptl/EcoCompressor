const ecoModeToggle = document.getElementById('ecoModeToggle');
const compressButton = document.getElementById('compressButton');
const previewBefore = document.getElementById('previewBefore');
const previewAfter = document.getElementById('previewAfter');

const ENERGY_PER_TOKEN_WH = 0.00002;
const WATER_PER_WH_ML = 0.5;

let ecoMode = false;

function estimateTokens(text) {
    return Math.ceil(text.length / 4);
}

function updateStats(beforeText, afterText) {
    const beforeTokens = estimateTokens(beforeText);
    const afterTokens = estimateTokens(afterText);
    const tokensSaved = beforeTokens - afterTokens;
    const energySavedWh = tokensSaved * ENERGY_PER_TOKEN_WH;
    const waterSavedMl = energySavedWh * WATER_PER_WH_ML;
    const savingsPercent = beforeTokens > 0 ? ((tokensSaved / beforeTokens) * 100).toFixed(1) : 0;

    document.getElementById('tokensBefore').textContent = beforeTokens;
    document.getElementById('tokensAfter').textContent = afterTokens;
    document.getElementById('tokensSaved').textContent = tokensSaved;
    document.getElementById('tokensSavedPercentage').textContent = `${savingsPercent}%`;
    document.getElementById('energySaved').textContent = energySavedWh.toFixed(6);
    document.getElementById('waterSaved').textContent = waterSavedMl.toFixed(6);

    const beforePreview = beforeText.length > 150 ? beforeText.substring(0, 150) + '...' : beforeText;
    const afterPreview = afterText.length > 150 ? afterText.substring(0, 150) + '...' : afterText;

    previewBefore.textContent = beforePreview || 'No text found';
    previewAfter.textContent = afterPreview || 'No text found';
}

ecoModeToggle.addEventListener('change', (event) => {
    ecoMode = event.target.checked;
    chrome.storage.sync.set({ ecoMode });
});

compressButton.addEventListener('click', () => {
    compressButton.disabled = true;
    compressButton.textContent = '⏳ Processing...';
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || !tabs[0]) {
            showToast('❌ No active tab found', 'error');
            resetButton();
            return;
        }
        
        chrome.tabs.sendMessage(tabs[0].id, { action: 'compressText', ecoMode }, (response) => {
            resetButton();
            
            if (chrome.runtime.lastError) {
                console.error('Error:', chrome.runtime.lastError);
                showToast('❌ Error: Content script not loaded. Refresh the page and try again.', 'error');
                return;
            }
            
            if (response) {
                updateStats(response.beforeText, response.afterText);
                showToast(`✓ Compressed! Saved ${response.tokensSaved} tokens`);
            } else {
                showToast('❌ No text found. Focus on a text field or select text.', 'error');
            }
        });
    });
});

function resetButton() {
    compressButton.disabled = false;
    compressButton.textContent = '✨ Compress Text';
}

// Add settings button
const settingsButton = document.createElement('button');
settingsButton.textContent = '⚙️ Settings';
settingsButton.style.cssText = 'position: fixed; bottom: 16px; right: 16px; padding: 8px 12px; font-size: 12px; background: #667eea;';
settingsButton.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
});
document.body.appendChild(settingsButton);

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.className = 'toast';
    if (type === 'error') {
        toast.style.background = '#f44336';
    }
    document.body.appendChild(toast);
    setTimeout(() => {
        if (document.body.contains(toast)) {
            document.body.removeChild(toast);
        }
    }, 4000);
}

// Load saved settings on popup open
chrome.storage.sync.get(['ecoMode'], (data) => {
    ecoMode = data.ecoMode || false;
    ecoModeToggle.checked = ecoMode;
});