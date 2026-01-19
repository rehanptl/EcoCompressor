🍃 Eco Prompt Compressor

🌍 Overview

Eco Prompt Compressor is a smart Chrome extension designed to shrink your AI prompts and your carbon footprint. By using AI to strip away redundant tokens, we help users save significant amounts of energy and water used by data centers with every request.

✨ Features

- 🔋 Eco Mode Toggle: Quickly switch compression on or off whenever you need it.
  
- 🤖 AI-Powered Compression: Uses Google Gemini 1.5 Flash to remove filler phrases while keeping 100% of your prompt's meaning.
  
- 📊 Token Analytics: See exactly how many tokens you saved and the percentage of efficiency gained.
  
- 💧 Eco-Impact Tracking: Real-time estimates of energy ($0.001$ kWh) and water ($0.5$ ml) saved per token reduction.

📂 File Structure
eco-prompt-compressor
├── src
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.css
│   ├── popup.js
│   ├── content-script.js
│   ├── service-worker.js
│   ├── config.example.js
│   ├── config.js (User Created) 🔑
│   └── utils.js
└── README.md

🚀 Installation 
Follow these exact commands in your terminal to get started:
1. git clone https://github.com/rehanptl/EcoCompressor.git
2. cd EcoCompressor/src
3. cp config.example.js config.js
4. open -e config.js
   - will need your own gemini api key 
5. Load in Chrome: 🌐
- Open chrome://extensions/
- Enable Developer mode (toggle in the top right).
- Click Load unpacked (top left).
- Select the src folder inside the EcoCompressor directory.

🛠️ How It Works
Selection: Highlight any text on a page and right-click to "Optimize Selection."

Processing: Our service worker sends the text to Gemini to be compressed into a "Green Prompt."

Results: The popup displays your savings in milliliters of water and watts of energy, making the invisible cost of AI visible.

⚠️ Safety & Notes
Privacy: Your API key is stored locally in config.js and is never uploaded to GitHub.

Heuristics: Token savings are calculated based on standard LLM average costs.










