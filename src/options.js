const apiKeyInput = document.getElementById('apiKey');
const saveButton = document.getElementById('saveButton');
const testButton = document.getElementById('testButton');
const clearButton = document.getElementById('clearButton');
const statusMessage = document.getElementById('statusMessage');
const apiStatus = document.getElementById('apiStatus');

// Load saved API key on page load
chrome.storage.sync.get(['geminiApiKey'], (data) => {
    if (data.geminiApiKey) {
        apiKeyInput.value = data.geminiApiKey;
        showApiStatus(true, 'API key configured ✓');
    } else {
        showApiStatus(false, 'No API key configured');
    }
});

saveButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
        showMessage('Please enter an API key', 'error');
        return;
    }

    chrome.storage.sync.set({ geminiApiKey: apiKey }, () => {
        showMessage('✓ Settings saved successfully!', 'success');
        showApiStatus(true, 'API key configured ✓');
        saveButton.textContent = '💾 Saved!';
        setTimeout(() => {
            saveButton.textContent = '💾 Save Settings';
        }, 2000);
    });
});

testButton.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
        showMessage('Please enter an API key first', 'error');
        return;
    }

    testButton.disabled = true;
    testButton.textContent = '⏳ Testing...';

    try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: 'Say "API working" in one word'
                    }]
                }]
            })
        });

        if (response.ok) {
            chrome.storage.sync.set({ geminiApiKey: apiKey }, () => {
                showMessage('✓ API key is valid and working!', 'success');
                showApiStatus(true, 'API key configured ✓');
            });
        } else {
            const errorData = await response.json();
            showMessage('✗ API key invalid: ' + (errorData.error?.message || 'Unknown error'), 'error');
            showApiStatus(false, 'API key invalid');
        }
    } catch (error) {
        showMessage('✗ Error testing API: ' + error.message, 'error');
        showApiStatus(false, 'Error connecting to API');
    } finally {
        testButton.disabled = false;
        testButton.textContent = '🧪 Test API';
    }
});

clearButton.addEventListener('click', () => {
    if (confirm('Are you sure? This will remove your API key.')) {
        chrome.storage.sync.remove(['geminiApiKey'], () => {
            apiKeyInput.value = '';
            showMessage('✓ API key cleared', 'success');
            showApiStatus(false, 'No API key configured');
        });
    }
});

function showMessage(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message ' + type;
    setTimeout(() => {
        statusMessage.className = 'status-message';
    }, 4000);
}

function showApiStatus(configured, message) {
    apiStatus.textContent = message;
    apiStatus.className = 'api-status' + (configured ? ' configured' : ' error');
}
