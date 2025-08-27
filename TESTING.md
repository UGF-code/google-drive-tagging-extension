# 🧪 Google Drive Tagging Extension - Testing Todo List

## **🔐 Authentication Testing**

### **Initial Setup**
- [ ] Load extension in Chrome (`chrome://extensions/`)
- [ ] Enable Developer mode
- [ ] Click "Load unpacked" and select project folder
- [ ] Verify extension appears in list

### **OAuth Authentication**
- [ ] Go to Google Drive
- [ ] Click extension icon
- [ ] Click "Connect Google Drive"
- [ ] Grant OAuth permissions when prompted
- [ ] Verify status shows "Connected to Google Drive"
- [ ] Test "Reconnect" button functionality

## **📁 File Detection Testing**

### **Google Drive Files**
- [ ] Open any file in Google Drive
- [ ] Click extension icon
- [ ] Verify file name displays correctly
- [ ] Verify file ID displays correctly
- [ ] Test with different file types (images, PDFs, etc.)

### **Google Docs Integration**
- [ ] Open a Google Docs document
- [ ] Click extension icon
- [ ] Verify document is detected
- [ ] Verify document name displays

### **Google Sheets Integration**
- [ ] Open a Google Sheets file
- [ ] Click extension icon
- [ ] Verify spreadsheet is detected
- [ ] Verify spreadsheet name displays

### **Google Slides Integration**
- [ ] Open a Google Slides presentation
- [ ] Click extension icon
- [ ] Verify presentation is detected
- [ ] Verify presentation name displays

## **🏷️ Tag Management Testing**

### **Adding Tags**
- [ ] Type a simple tag (e.g., "test")
- [ ] Click "Add" button
- [ ] Verify tag appears in current tags list
- [ ] Verify tag input clears
- [ ] Test with Enter key
- [ ] Test with special characters in tags
- [ ] Test with spaces in tag names

### **Multiple Tags**
- [ ] Add 3-5 different tags to same file
- [ ] Verify all tags display correctly
- [ ] Verify tags are saved to file
- [ ] Test with duplicate tags (should be prevented)

### **Removing Tags**
- [ ] Add a tag to a file
- [ ] Click the "×" button on the tag
- [ ] Verify tag disappears from list
- [ ] Verify tag is removed from file
- [ ] Test removing multiple tags

### **Tag Persistence**
- [ ] Add tags to a file
- [ ] Close the file completely
- [ ] Reopen the same file
- [ ] Click extension icon
- [ ] Verify tags are still there
- [ ] Test persistence across browser sessions

## **🔍 Tag Suggestions Testing**

### **Suggestion Display**
- [ ] Add tags to one file
- [ ] Open a different file
- [ ] Verify previous tags appear as suggestions
- [ ] Test clicking on suggestion tags
- [ ] Verify suggestions work across different files

## **⚡ Performance & UI Testing**

### **Loading States**
- [ ] Click "Add" button
- [ ] Verify loading spinner appears
- [ ] Verify UI remains responsive during loading
- [ ] Test loading state duration

### **Error Handling**
- [ ] Try to tag a file you don't own
- [ ] Verify clear error message appears
- [ ] Test error message dismissal
- [ ] Test network error scenarios

### **Responsive Design**
- [ ] Resize browser window
- [ ] Verify popup adapts to different sizes
- [ ] Test on different screen resolutions
- [ ] Verify all elements remain accessible

### **Keyboard Navigation**
- [ ] Use Tab to navigate through popup
- [ ] Verify focus moves logically
- [ ] Test Enter key functionality
- [ ] Test Escape key functionality

## **🔄 Context Menu Testing**

### **Right-Click Integration**
- [ ] Right-click on a file in Google Drive
- [ ] Verify "Tag File" appears in context menu
- [ ] Click "Tag File" option
- [ ] Verify tagging dialog opens
- [ ] Test with multiple file selection

## **🔒 Security & Permissions Testing**

### **Permission Boundaries**
- [ ] Try to tag a shared read-only file
- [ ] Verify permission error message
- [ ] Test with files you don't have access to
- [ ] Verify no data corruption occurs

### **OAuth Token Management**
- [ ] Let OAuth token expire (if possible)
- [ ] Try to add a tag
- [ ] Verify re-authentication prompt
- [ ] Test re-authentication flow

## **🌐 Cross-Platform Testing**

### **Different File Types**
- [ ] Test with images (.jpg, .png, .gif)
- [ ] Test with documents (.pdf, .doc, .txt)
- [ ] Test with spreadsheets (.xlsx, .csv)
- [ ] Test with presentations (.pptx)
- [ ] Verify all file types work correctly

### **Different Google Services**
- [ ] Test on drive.google.com
- [ ] Test on docs.google.com
- [ ] Test on sheets.google.com
- [ ] Test on slides.google.com
- [ ] Verify consistent behavior across all

## **📊 Data Integrity Testing**

### **Tag Data Storage**
- [ ] Add tags with special characters (@, #, $, %, etc.)
- [ ] Add tags with emojis
- [ ] Add tags with multiple spaces
- [ ] Add very long tag names
- [ ] Verify all save and display correctly

### **Large Tag Lists**
- [ ] Add 10+ tags to a single file
- [ ] Verify all tags display properly
- [ ] Test UI overflow handling
- [ ] Verify performance remains good

## **🚨 Edge Case Testing**

### **Network Issues**
- [ ] Disconnect internet temporarily
- [ ] Try to add a tag
- [ ] Verify network error message
- [ ] Reconnect and test functionality

### **Invalid Scenarios**
- [ ] Try to add empty tags
- [ ] Try to add very long tags
- [ ] Test with invalid file IDs
- [ ] Test with corrupted data

### **Browser Compatibility**
- [ ] Test in Chrome (primary)
- [ ] Test in Edge (Chromium-based)
- [ ] Verify consistent behavior
- [ ] Note any browser-specific issues

## **📈 Performance Testing**

### **Speed Tests**
- [ ] Measure time to load extension popup
- [ ] Measure time to add a tag
- [ ] Measure time to load existing tags
- [ ] Test with many files open

### **Memory Usage**
- [ ] Monitor memory usage during operation
- [ ] Test with multiple files tagged
- [ ] Verify no memory leaks

## **🎯 User Experience Testing**

### **Intuitive Usage**
- [ ] Test with someone unfamiliar with the extension
- [ ] Verify they can figure out how to use it
- [ ] Note any confusing UI elements
- [ ] Test error message clarity

### **Accessibility**
- [ ] Test with screen readers (if available)
- [ ] Verify keyboard-only navigation works
- [ ] Test with high contrast mode
- [ ] Verify color-blind friendly design

## **📝 Test Results Documentation**

### **Create Test Report**
- [ ] Document all test results
- [ ] Note any bugs found
- [ ] Document performance metrics
- [ ] Create bug reports for issues
- [ ] Prioritize fixes needed

---

## **🏁 Testing Completion Checklist**

- [ ] All authentication tests passed
- [ ] All file detection tests passed
- [ ] All tag management tests passed
- [ ] All UI/UX tests passed
- [ ] All security tests passed
- [ ] All performance tests passed
- [ ] All edge cases handled
- [ ] Documentation updated
- [ ] Ready for production use

---

**Start Date:** ___________  
**Completed Date:** ___________  
**Tester:** ___________  
**Version Tested:** 1.0.0
