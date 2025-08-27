# 🎯 Google Drive Tagging Extension - Development TODO

## 🏗️ New Architecture Strategy

### **Core Principle: Clean Separation of Concerns**
- **Background Script**: Central controller for all Google Drive operations
- **Popup Script**: UI-only interface with message passing
- **Content Script**: Native Drive integration with message passing
- **Communication**: Unified via `chrome.runtime.sendMessage` API

---

## 📋 Phase 1: Architecture Refactor (IN PROGRESS)

### **1.1 Background Script - Central Controller**
- [x] **Backup current background script** as `background-old.js`
- [x] **Create new background script** with clean message handling
- [x] **Implement OAuth authentication** management
- [x] **Add Google Drive API operations**:
  - [x] `getFileTags(fileId)` - Retrieve tags from appProperties
  - [x] `addTagToFile(fileId, tag)` - Add tag to file
  - [x] `removeTagFromFile(fileId, tag)` - Remove tag from file
  - [x] `updateFileTags(fileId, tags)` - Update all tags for file
- [x] **Add message handler** for all operations
- [x] **Test authentication flow**
- [x] **Test basic tag CRUD operations**

### **1.2 Message System Design**
- [ ] **Define message types**:
  - [ ] `getTags` - Get tags for a file
  - [ ] `addTag` - Add tag to file
  - [ ] `removeTag` - Remove tag from file
  - [ ] `updateTags` - Update all tags for file
  - [ ] `checkAuth` - Check authentication status
- [ ] **Implement message validation**
- [ ] **Add error handling** for all message types
- [ ] **Test message passing** between components

### **1.3 Testing Background Script**
- [ ] **Test OAuth authentication**
- [ ] **Test tag CRUD operations** via message passing
- [ ] **Test error handling**
- [ ] **Verify Google Drive API integration**

---

## 📋 Phase 2: Popup Script Refactor

### **2.1 Remove Old Logic**
- [ ] **Remove localStorage operations**
- [ ] **Remove direct API calls**
- [ ] **Remove chrome.scripting.executeScript calls**
- [ ] **Clean up debugging code**

### **2.2 Implement Message Passing**
- [ ] **Add message sending** for all operations
- [ ] **Implement response handling**
- [ ] **Add loading states** during message operations
- [ ] **Add error handling** for failed messages

### **2.3 UI Updates**
- [ ] **Update tag display** to use message responses
- [ ] **Update add tag functionality**
- [ ] **Update remove tag functionality**
- [ ] **Add authentication status** display
- [ ] **Test all UI interactions**

### **2.4 Testing Popup**
- [ ] **Test tag loading** via message passing
- [ ] **Test tag adding** via message passing
- [ ] **Test tag removing** via message passing
- [ ] **Test error scenarios**
- [ ] **Test authentication flow**

---

## 📋 Phase 3: Content Script Refactor

### **3.1 Remove Old Logic**
- [ ] **Remove localStorage operations**
- [ ] **Remove direct API calls**
- [ ] **Clean up debugging code**
- [ ] **Remove complex sync logic**

### **3.2 Implement Message Passing**
- [ ] **Add message sending** for tag operations
- [ ] **Implement response handling**
- [ ] **Update dialog functionality** to use messages
- [ ] **Add loading states** during operations

### **3.3 UI Integration**
- [ ] **Update dialog tag display**
- [ ] **Update add tag in dialog**
- [ ] **Update remove tag in dialog**
- [ ] **Test context menu integration**

### **3.4 Testing Content Script**
- [ ] **Test right-click context menu**
- [ ] **Test dialog tag operations**
- [ ] **Test file detection**
- [ ] **Test error handling**

---

## 📋 Phase 4: Integration Testing

### **4.1 End-to-End Testing**
- [ ] **Test popup → background → Drive API**
- [ ] **Test content script → background → Drive API**
- [ ] **Test authentication flow** across all components
- [ ] **Test error scenarios** across all components

### **4.2 Performance Testing**
- [ ] **Test message response times**
- [ ] **Test with multiple files**
- [ ] **Test with large tag lists**
- [ ] **Test memory usage**

### **4.3 Edge Case Testing**
- [ ] **Test with no internet connection**
- [ ] **Test with expired tokens**
- [ ] **Test with invalid file IDs**
- [ ] **Test with special characters in tags**

---

## 📋 Phase 5: Advanced Features (Future)

### **5.1 Batch Operations**
- [ ] **Multi-file selection**
- [ ] **Bulk tag operations**
- [ ] **Batch tag management**

### **5.2 Search and Filtering**
- [ ] **Tag-based file search**
- [ ] **Filter by multiple tags**
- [ ] **Search suggestions**

### **5.3 Enhanced UX**
- [ ] **Tag categories**
- [ ] **Tag analytics**
- [ ] **Export/import functionality**

---

## 🎯 Success Criteria

### **Phase 1 Complete When:**
- [ ] Background script handles all Google Drive operations
- [ ] Message system works reliably
- [ ] Authentication flow is stable
- [ ] Basic tag CRUD operations work

### **Phase 2 Complete When:**
- [ ] Popup works entirely via message passing
- [ ] No localStorage or direct API calls in popup
- [ ] All UI interactions work smoothly
- [ ] Error handling is robust

### **Phase 3 Complete When:**
- [ ] Content script works entirely via message passing
- [ ] Dialog operations work reliably
- [ ] Context menu integration is stable
- [ ] No localStorage operations in content script

### **Phase 4 Complete When:**
- [ ] All components work together seamlessly
- [ ] Performance is acceptable
- [ ] Error handling works across all scenarios
- [ ] Extension is ready for production use

---

## 🔧 Technical Notes

### **Message Format:**
```javascript
// Request
{
  action: 'getTags|addTag|removeTag|updateTags|checkAuth',
  fileId: 'string',
  tag: 'string', // for addTag/removeTag
  tags: ['array'] // for updateTags
}

// Response
{
  success: boolean,
  data: any,
  error: 'string' // if success: false
}
```

### **File Structure:**
```
├── background/
│   ├── background.js      # New clean architecture
│   └── background-old.js  # Backup of old version
├── popup/
│   ├── popup.js          # Refactored for message passing
│   ├── popup.html        # No changes needed
│   └── popup.css         # No changes needed
├── content/
│   └── content.js        # Refactored for message passing
└── manifest.json         # No changes needed
```

---

## 📝 Development Notes

- **Keep old components working** during refactor
- **Test each phase thoroughly** before moving to next
- **Document any issues** found during development
- **Update this TODO** as tasks are completed
- **Commit frequently** with clear messages
