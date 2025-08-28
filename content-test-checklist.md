# 🧪 Content Script Test Checklist

## 📋 Current Content Script Analysis

### **Current Architecture Issues:**
- ❌ **Uses localStorage** for tag storage (same issue as old popup)
- ❌ **Direct tag operations** instead of message passing
- ❌ **No background script integration** for Google Drive API
- ❌ **Potential sync issues** between popup and content script

### **Current Features to Test:**

## 🔍 **Test 1: Content Script Loading**
- [x] **Check if content script loads** on Google Drive pages
- [x] **Verify console logs** show "🚀 CONTENT SCRIPT LOADED"
- [x] **Check initialization** on page load
- [ ] **Test navigation detection** (SPA behavior)

## 🔍 **Test 2: File Detection**
- [x] **Test file ID extraction** from different URL formats:
  -[x] Google Docs: `/d/fileId`
  - [x] Google Sheets: `/spreadsheets/d/fileId`
  - [x] Google Slides: `/presentation/d/fileId`
  - [ ] Drive file view: `/file/d/fileId`
- [x] **Test file name extraction** from page elements
- [ ] **Test file selection tracking** (multiple files)

## 🔍 **Test 3: Context Menu Integration**
- [x] **Test right-click context menu** creation
- [x] **Test "Tag File" menu item** functionality
- [x] **Test "Tag Current File" menu item** functionality
- [ ] **Test "Batch Tag" menu item** functionality
- [x] **Verify context menu appears** on file elements

## 🔍 **Test 4: Tag Dialog Functionality**
- [x] **Test dialog creation** and injection
- [x] **Test dialog styling** and appearance
- [x] **Test tag input field** functionality
- [x] **Test add tag button** functionality
  - [ ] **Test remove tag button** functionality
  - [ ] **Test dialog close** functionality

## 🔍 **Test 5: Tag Storage (Current localStorage)**
- [x] **Test adding tags** via dialog
  - [ ] **Test removing tags** via dialog
  - [x] **Test tag persistence** after page refresh
  - [x] **Test tag loading** when dialog opens
  - [ ] **Check localStorage keys** in DevTools
  - [x] **Test duplicate tag handling** ❌ **ISSUE: Shows success but doesn't add duplicate**

## 🔍 **Test 6: Message Handling**
- [ ] **Test message listener** setup
- [ ] **Test 'test' message** response
- [ ] **Test 'getCurrentFileName' message**
- [ ] **Test 'openTagDialog' message**
- [ ] **Test 'getCurrentTags' message**
- [ ] **Test 'storeTags' message**

## 🔍 **Test 7: Integration with Popup**
- [ ] **Test popup → content script** communication
- [ ] **Test content script → popup** communication
- [ ] **Test tag synchronization** between popup and dialog
- [ ] **Test file detection** from popup

## 🔍 **Test 8: Error Handling**
- [ ] **Test invalid file ID** handling
- [ ] **Test network error** handling
- [ ] **Test localStorage error** handling
- [ ] **Test dialog creation error** handling

## 🔍 **Test 9: Performance**
- [ ] **Test dialog opening speed**
- [ ] **Test tag loading speed**
- [ ] **Test memory usage** with many tags
- [ ] **Test page navigation** performance

---

## 📊 **Test Results Summary**

### **Working Features:**
- [x] Content script loads correctly on Google Drive pages
- [x] File ID extraction works for Docs, Sheets, Slides
- [x] File name extraction from page elements
- [x] Context menu creation and functionality
- [x] Tag dialog creation and styling
- [x] Tag input field and add button work
- [x] Tag persistence after page refresh
- [x] Tag loading when dialog opens

### **Issues Found:**
- [x] **Duplicate tag handling bug**: Shows "success" but doesn't actually add duplicate tags (function always returns true)
- [x] **Bulk/Batch operations**: Never implemented (not a bug, just missing feature)
- [ ] **Remove tag button**: Not tested yet
- [ ] **Dialog close functionality**: Not tested yet

### **Refactor Priorities:**
1. **High Priority**: Replace localStorage with message passing
2. **High Priority**: Integrate with background script for Google Drive API
3. **Medium Priority**: Improve error handling
4. **Low Priority**: Performance optimizations

### **Notes:**
- Add any observations during testing

---

## 🎯 **Next Steps After Testing:**
1. **Document current issues** found during testing
2. **Plan refactor approach** based on test results
3. **Start Phase 3.1** - Remove old logic
4. **Implement message passing** for all operations
5. **Test refactored functionality**

---

## 🚀 **How to Run Tests:**

### **Manual Testing Steps:**
1. **Open Google Drive** in Chrome
2. **Open DevTools** (F12) and check Console
3. **Navigate to different file types** (Docs, Sheets, Slides)
4. **Right-click on files** to test context menu
5. **Open tag dialog** and test tag operations
6. **Check localStorage** in DevTools Application tab
7. **Test popup integration** by opening extension popup

### **Console Commands:**
```javascript
// Test content script message handling
chrome.runtime.sendMessage({action: 'test', message: 'Hello from popup'});

// Test file detection
chrome.runtime.sendMessage({action: 'getCurrentFileName'});

// Test tag dialog
chrome.runtime.sendMessage({action: 'openTagDialog', fileId: 'test-file-id'});
```

---

**Test Date:** Today  
**Tester:** User  
**Overall Status:** **Needs Refactor** - localStorage issues and duplicate tag bug need fixing
