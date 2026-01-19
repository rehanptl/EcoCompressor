// ULTRA-SIMPLE CONTENT SCRIPT
// Synchronous compression only - no API, no async, no complexity

console.log('Content script loaded');

function estimateTokens(text) {
    return Math.ceil(text.length / 4);
}

function compressAggressively(text) {
    if (!text) return text;
    
    let s = text.toLowerCase();
    s = s.replace(/["'`\[\]\(\){}<>]/g, '');
    s = s.replace(/[?!]{2,}/g, '?');
    s = s.replace(/[.,;:!—–]/g, '');

    const stop = new Set([
        'a','an','the','and','or','but','so','as','at','be','by','for','from','in','of','on','with','about','above','after','before','between','during','until','while','through','to','into','over','under','up','down','out','this','that','these','those','i','you','he','she','it','we','they','me','him','her','my','your','our','their','is','are','was','were','am','been','being','do','does','did','have','has','had','will','would','should','could','can','may','might','must','not','dont','don't','cant','can't','wont','won't','doesnt','doesn't','didnt','didn't','please','thanks','thank','hello','hi','hey','yeah','ok','okay','like','just','really','very','actually','basically','kind','sort','i'm','im','ive','i've','we','us','know','think','believe','opinion','mean'
    ]);

    const words = s.split(/\s+/).map(w => w.replace(/[^a-z0-9_\-]/g, '')).filter(Boolean);
    const content = words.filter(w => !stop.has(w));

    if (content.length === 0) {
        const longest = words.sort((a,b)=>b.length-a.length).slice(0,3);
        return longest.join(' ').trim();
    }

    const questionWords = ['why','how','what','where','when','which','who'];
    const q = content.find(w => questionWords.includes(w));
    const out = [];
    if (q) out.push(q);
    for (const w of content) {
        if (out.length >= 3) break;
        if (w === q) continue;
        out.push(w);
    }

    return out.join(' ').trim();
}

// SYNCHRONOUS message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action !== 'compressText') return;
    
    console.log('compressText request received');
    
    let beforeText = '';
    let afterText = '';
    let activeElement = document.activeElement;
    
    // Check focused element first
    if (activeElement && (
        activeElement.tagName === 'TEXTAREA' ||
        (activeElement.tagName === 'INPUT' && typeof activeElement.value === 'string') ||
        activeElement.isContentEditable
    )) {
        beforeText = (typeof activeElement.value === 'string' ? activeElement.value : '') || activeElement.textContent || '';
        
        if (beforeText.trim()) {
            console.log('Compressing focused element');
            afterText = compressAggressively(beforeText);
            
            // Update element
            if (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT') {
                activeElement.value = afterText;
                activeElement.dispatchEvent(new Event('input', { bubbles: true }));
                activeElement.dispatchEvent(new Event('change', { bubbles: true }));
            } else {
                activeElement.innerText = afterText;
            }
            
            const tokensSaved = estimateTokens(beforeText) - estimateTokens(afterText);
            console.log('Response:', { before: beforeText.substring(0,40), after: afterText, tokens: tokensSaved });
            sendResponse({
                beforeText,
                afterText,
                tokensSaved
            });
            return;
        }
    }
    
    // Check selected text
    const selection = window.getSelection();
    const selectedText = selection.toString();
    
    if (selectedText && selectedText.trim().length > 0) {
        beforeText = selectedText;
        console.log('Compressing selected text');
        afterText = compressAggressively(beforeText);
        
        try {
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const textNode = document.createTextNode(afterText);
                range.deleteContents();
                range.insertNode(textNode);
                selection.removeAllRanges();
            }
        } catch (e) {
            console.log('Could not replace DOM:', e);
        }
        
        const tokensSaved = estimateTokens(beforeText) - estimateTokens(afterText);
        console.log('Response:', { before: beforeText.substring(0,40), after: afterText, tokens: tokensSaved });
        sendResponse({
            beforeText,
            afterText,
            tokensSaved
        });
        return;
    }
    
    console.log('No text found');
    sendResponse(null);
});
