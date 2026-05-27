# ChatGPT Conversation PDF Exporter

A tiny Manifest V3 browser extension that adds an **Export PDF** button to ChatGPT. Clicking the button opens a print-ready version of the current conversation, then launches the browser print dialog so you can choose **Save as PDF**.

## Install locally

1. Open `chrome://extensions` or `edge://extensions`.
2. Enable **Developer mode**.
3. Choose **Load unpacked**.
4. Select this folder:
   `C:\Users\Tanmmay R Joseph\Documents\Codex\2026-05-27\hey-i-want-you-to-make`

## Use

1. Open a conversation on `https://chatgpt.com`.
2. Click **Export PDF** near the lower-right corner.
3. In the print dialog, choose **Save as PDF**.

## Notes

- The extension exports messages currently available in the page DOM.
- It supports `chatgpt.com` and the older `chat.openai.com` host.
- No build step or external dependency is required.
