# Google Drive Tagging Extension

A Chrome extension that adds powerful tagging capabilities to Google Drive, allowing you to organize and filter your files with custom tags.

## 🎯 Features

- **Tag Files**: Add multiple custom tags to any Google Drive file
- **Batch Operations**: Tag multiple files at once via right-click context menu
- **Smart Filtering**: Filter and search files by tags
- **Tag Management**: View, edit, and organize your tags
- **Personal Use**: Designed for individual creators managing their own Drive

## 🚀 Current Status

### ✅ Phase 1: Foundation (COMPLETED)
- [x] Chrome extension setup with Manifest v3
- [x] Google Drive API integration
- [x] OAuth authentication system
- [x] Basic tagging functionality
- [x] Modern popup UI with authentication
- [x] Content script for Drive page integration
- [x] Context menu integration
- [x] Tag storage in Drive's appProperties

### 🔄 Phase 2: Batch Operations (IN PROGRESS)
- [ ] Multi-file selection
- [ ] Bulk tagging operations
- [ ] Tag filtering and search
- [ ] Tag suggestions system

### 📋 Phase 3: Enhanced UX (PLANNED)
- [ ] Tag categories/grouping
- [ ] Advanced search with AND/OR logic
- [ ] Tag analytics dashboard
- [ ] Export/import tag data
- [ ] Performance optimizations

## 🛠 Getting Started

### Prerequisites

- Google Chrome browser
- Google Drive account
- Google Cloud Console access (for API setup)

### Quick Setup

1. **Follow the Setup Guide**: See [SETUP.md](SETUP.md) for detailed instructions
2. **Load the Extension**: 
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select this folder
3. **Configure Google API**: Set up OAuth credentials as described in SETUP.md
4. **Start Tagging**: Visit Google Drive and click the extension icon!

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
└── SETUP.md              # Setup guide
```

## 🎨 UI Features

### Modern Design
- Clean, intuitive interface
- Responsive layout
- Smooth animations and transitions
- Professional color scheme

### User Experience
- Authentication status indicator
- Loading states and error handling
- Tag suggestions and autocomplete
- Batch operation support
- Real-time file information

## 🔧 Technical Architecture

### Chrome Extension (Manifest v3)
- **Background Service Worker**: Handles authentication and API calls
- **Content Script**: Integrates with Google Drive pages
- **Popup Interface**: Main user interface for tag management
- **Context Menus**: Right-click integration for quick actions

### Google Drive API Integration
- **OAuth 2.0 Authentication**: Secure access to user's Drive
- **appProperties Storage**: Tags stored safely in file metadata
- **File Operations**: Read/write access to file properties
- **Search Capabilities**: Query files by tags

### Data Storage
- **Tags**: Stored in Google Drive's `appProperties` field
- **Local Cache**: Chrome storage for performance
- **No External Servers**: All data stays within Google ecosystem

## 🚀 Development

This is a learning project - I'll explain each concept as we build it together!

### Key Technologies

- **Chrome Extension Manifest v3**: Modern extension framework
- **Google Drive API**: File operations and metadata
- **JavaScript (ES6+)**: Core functionality
- **HTML5/CSS3**: User interface
- **OAuth 2.0**: Secure authentication

### Development Phases

1. **Foundation** ✅ - Basic extension setup and authentication
2. **Core Features** 🔄 - Tag management and file integration
3. **Advanced Features** 📋 - Search, batch operations, analytics

## 🔒 Security & Privacy

- **Minimal Permissions**: Only requests necessary Drive access
- **Secure Storage**: Tags stored in Google's secure appProperties
- **No External Data**: All operations happen within Google ecosystem
- **OAuth Security**: Uses Chrome's secure identity API

## 🤝 Contributing

This is a personal project, but feel free to learn from the code and adapt it for your own use!

## 📄 License

Personal use only - not for commercial distribution.

---

## 🎯 What's Working Now

✅ **Authentication**: Connect to Google Drive securely  
✅ **File Detection**: Automatically detect current file in Drive  
✅ **Tag Management**: Add/remove tags from files  
✅ **Modern UI**: Clean, responsive popup interface  
✅ **Context Menus**: Right-click integration  
✅ **Error Handling**: Graceful error management  
✅ **Local Storage**: Performance optimization  

## 🔄 Next Steps

1. **Test the current implementation** with your Google Drive
2. **Set up Google Cloud Console** following SETUP.md
3. **Try tagging some files** to see the system in action
4. **Provide feedback** on what features you'd like next

---

**Note**: This extension works by storing tags in Google Drive's `appProperties` field, so your tags are safe and won't interfere with your files.
