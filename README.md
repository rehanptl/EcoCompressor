# Eco Prompt Compressor

## Overview
The Eco Prompt Compressor is a Chrome extension designed to help users compress their text input in editable fields while promoting eco-friendly practices. By reducing the number of tokens used in text, the extension estimates the energy and water savings associated with the reduction.

## Features
- **Eco Mode Toggle**: Easily switch Eco Mode on or off to enable or disable text compression.
- **Text Compression**: Automatically compresses text in focused editable elements when Eco Mode is enabled.
- **Token Estimation**: Provides estimates of tokens before and after compression, along with the percentage of tokens saved.
- **Eco Impact Estimates**: Displays rough estimates of energy and water saved based on the number of tokens saved.

## File Structure
```
eco-prompt-compressor
├── src
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.css
│   ├── popup.js
│   ├── content-script.js
│   ├── service-worker.js
│   └── utils.js
└── README.md
```

## How to Load Unpacked Extension
1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable "Developer mode" using the toggle in the top right corner.
3. Click on "Load unpacked" and select the `eco-prompt-compressor/src` directory.
4. The extension should now be loaded and ready for use.

## How It Works
- The extension injects a content script into web pages that detects focused editable elements (like textareas and contenteditable divs).
- When Eco Mode is enabled, pressing Enter or clicking the "Compress current text" button will trigger the compression of the text.
- The compression process uses deterministic heuristics to remove filler phrases, redundant whitespace, and verbose patterns while preserving important formatting and code blocks.
- The popup UI displays token estimates and eco impact statistics based on the compression results.

## Limitations and Safety Notes
- The token estimation is a rough heuristic and may not reflect the exact number of tokens used in different contexts.
- The compression rules are designed to be easily extendable, allowing for future improvements and adjustments.
- The extension does not rely on any external APIs or paid services, ensuring user privacy and data security.

Feel free to contribute to the project or suggest improvements!