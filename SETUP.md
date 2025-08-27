# Google Drive Tagging Extension - Setup Guide

This guide will walk you through setting up the Google Drive Tagging Extension for your personal use.

## 🚀 Quick Start

### 1. Set Up Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit [https://console.cloud.google.com/](https://console.cloud.google.com/)
   - Sign in with your Google account

2. **Create a New Project**
   - Click on the project dropdown at the top
   - Click "New Project"
   - Name it something like "Drive Tagging Extension"
   - Click "Create"

3. **Enable Google Drive API**
   - In the left sidebar, go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click on it and press "Enable"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Chrome Extension" as the application type
   - Name it "Drive Tagging Extension"
   - For "Application ID", you'll need your extension ID (we'll get this in step 2)

### 2. Load the Extension

1. **Open Chrome Extensions**
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)

2. **Load the Extension**
   - Click "Load unpacked"
   - Select the folder containing this extension
   - Note the extension ID that appears (looks like: `abcdefghijklmnopqrstuvwxyz`)

3. **Update the Client ID**
   - Go back to Google Cloud Console
   - In your OAuth 2.0 credentials, add your extension ID
   - Copy the Client ID (looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)

4. **Update the Extension**
   - Open `manifest.json` in this project
   - Replace `YOUR_CLIENT_ID_HERE` with your actual Client ID
   - Open `background/background.js`
   - Replace `YOUR_CLIENT_ID_HERE` with your actual Client ID
   - Reload the extension in Chrome

### 3. Test the Extension

1. **Go to Google Drive**
   - Visit [https://drive.google.com](https://drive.google.com)
   - Open any file (document, image, etc.)

2. **Use the Extension**
   - Click the extension icon in your Chrome toolbar
   - Click "Connect Google Drive" to authenticate
   - Grant the necessary permissions
   - Start tagging files!

## 🔧 Configuration Details

### Required Permissions

The extension requests these permissions:

- **`identity`**: For OAuth authentication with Google
- **`storage`**: For local caching of tags and settings
- **`contextMenus`**: For right-click context menu integration
- **`activeTab`**: For accessing the current Google Drive tab

### OAuth Scopes

The extension uses these Google Drive API scopes:

- **`https://www.googleapis.com/auth/drive.file`**: Access to files created by the app
- **`https://www.googleapis.com/auth/drive.metadata.readonly`**: Read-only access to file metadata

### File Storage

Tags are stored in Google Drive's `appProperties` field for each file. This means:
- ✅ Tags are safe and won't interfere with your files
- ✅ Tags are backed up with your Drive
- ✅ Tags are accessible from any device
- ✅ No external storage required

## 🛠 Troubleshooting

### Common Issues

1. **"Authentication failed"**
   - Make sure you've updated the Client ID in both `manifest.json` and `background.js`
   - Check that the extension ID is added to your OAuth credentials
   - Try revoking permissions and re-authenticating

2. **"Cannot tag files"**
   - Ensure you have edit permissions on the file
   - Check that the file isn't shared as "View only"
   - Try refreshing the page and re-authenticating

3. **Extension not working on Drive**
   - Make sure you're on a Google Drive page (`drive.google.com`)
   - Check the browser console for error messages
   - Try reloading the extension

### Debug Mode

To enable debug logging:

1. Open Chrome DevTools (F12)
2. Go to the Console tab
3. Look for messages starting with "Drive Tagging Extension"

### Reset Extension

If you need to start fresh:

1. Go to `chrome://extensions/`
2. Find the extension and click "Remove"
3. Clear browser data for Google Drive
4. Reload the extension

## 📁 Project Structure

```
├── manifest.json          # Extension configuration
├── background/
│   └── background.js      # Service worker (authentication, API calls)
├── popup/
│   ├── popup.html         # Extension popup UI
│   ├── popup.css          # Popup styles
│   └── popup.js           # Popup functionality
├── content/
│   └── content.js         # Drive page integration
├── utils/
│   └── drive-api.js       # Drive API utilities
├── icons/                 # Extension icons (placeholder)
├── README.md             # Project overview
└── SETUP.md              # This setup guide
```

## 🔒 Security Notes

- The extension only requests minimal permissions needed for tagging
- Tags are stored securely in Google Drive's appProperties
- No data is sent to external servers
- OAuth tokens are handled securely by Chrome's identity API

## 🚀 Next Steps

Once you have the basic extension working:

1. **Test with different file types** (images, documents, etc.)
2. **Try batch operations** (select multiple files)
3. **Explore tag suggestions** and search features
4. **Customize the UI** to your preferences

## 📞 Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your Google Cloud Console setup
3. Ensure you have the latest version of Chrome
4. Try the troubleshooting steps above

---

**Note**: This is a personal productivity tool. The extension is designed for individual use and doesn't include collaboration features or cloud storage of tag data beyond Google Drive's built-in appProperties.
