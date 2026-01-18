# 🌱 Eco Prompt Compressor

A Chrome extension that intelligently compresses text prompts to reduce token usage and estimate environmental impact.

## Features

✨ **Smart Compression**
- Uses Google Gemini AI for intelligent text compression (with API key)
- Regex-based fallback compression when no API key is configured
- Maintains meaning while reducing token count

📊 **Environmental Impact Tracking**
- Estimates tokens saved
- Calculates energy savings (in Wh)
- Calculates water savings (in mL)
- Shows compression percentage

🔐 **Privacy-First Design**
- API key stored locally, never exposed to websites
- All processing stays within the extension
- API key kept hidden in the background service worker

## Installation

### From GitHub

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/eco-prompt-compressor.git
   cd eco-prompt-compressor
   ```

2. **Open Chrome Extensions**
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)

3. **Load Unpacked**
   - Click "Load unpacked"
   - Select the `src` folder
   - The extension will appear in your toolbar!

## Usage

### Basic Compression (No API Key)
1. Click the extension icon
2. Focus on a text field or select text
3. Click "✨ Compress Text"
4. See the results and stats

### With Gemini AI (Better Compression)
1. Get a free API key: [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click the extension → ⚙️ Settings
3. Paste your API key and click "💾 Save Settings"
4. (Optional) Click "🧪 Test API" to verify it works
5. Now compress text - it uses intelligent Gemini compression!

## File Structure

```
src/
├── manifest.json          # Extension configuration
├── popup.html             # Popup UI
├── popup.js              # Popup logic
├── popup.css             # Popup styling
├── content-script.js     # Content script for text detection
├── service-worker.js     # Background worker for API calls
├── options.html          # Settings page
├── options.js            # Settings logic
├── icon16.png            # Extension icon (16x16)
├── icon48.png            # Extension icon (48x48)
└── icon128.png           # Extension icon (128x128)
```

## How It Works

1. **User selects/focuses text** and clicks "Compress"
2. **Content script** detects the text from the page
3. **Service worker** receives the text
4. **If API key exists**: Sends to Gemini API for intelligent compression
5. **If no API key**: Uses regex patterns to remove filler words
6. **Result** is displayed in the popup and optionally replaced in the original field

## API Key Security

Your Gemini API key is:
- ✅ Stored only in your Chrome browser (sync storage)
- ✅ Never sent to any server except Google's Gemini API
- ✅ Never exposed to websites you visit
- ✅ Never logged or saved elsewhere

## Compression Examples

**Without API Key (Regex):**
```
Before: "Can you please explain this very important concept in a lot of detail?"
After:  "Explain this important concept in detail?"
Saved:  ~60% tokens
```

**With Gemini API (Intelligent):**
```
Before: "Can you please explain this very important concept in a lot of detail?"
After:  "Explain this concept."
Saved:  ~80% tokens (better understanding of meaning)
```

## Privacy & Environment

This extension helps:
- 🌍 Reduce AI API costs
- 💨 Lower carbon footprint of AI computations
- 💧 Reduce water usage in data centers
- 📉 Minimize unnecessary API calls

## Development

To modify the extension:

1. Edit files in the `src/` folder
2. Go to `chrome://extensions/`
3. Click the refresh button on the extension
4. Test your changes

## License

MIT License - Feel free to use and modify!

## Contributing

Have ideas? Found a bug? Feel free to open an issue or submit a PR!

## Troubleshooting

**"No text field found"**
- Make sure you're focused on a text input/textarea
- Or select text on the page before clicking compress

**"Content script not loaded"**
- Refresh the webpage
- Reload the extension at `chrome://extensions/`

**Gemini API not working**
- Check your API key at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
- Make sure the key is still active (hasn't been revoked)
- Click "🧪 Test API" in settings to verify

## Support

For issues and questions, please open an issue on GitHub.

---

Made with 🌱 to help reduce digital carbon footprint
