# 🧪 Google Drive Tagging Extension - Testing Todo List

## **🔐 Authentication Testing**

### **Initial Setup**
- [ ] Load extension in Chrome (`chrome://extensions/`)
- [ ] Enable Developer mode
- [ ] Click "Load unpacked" and select project folder
- [ ] Verify extension appears in list

### **OAuth Authentication**
- [x] Go to Google Drive
- [x] Click extension icon
- [x] Click "Connect Google Drive"
- [x] Grant OAuth permissions when prompted
- [x] Verify status shows "Connected to Google Drive"
- [ ] Test "Reconnect" button functionality

## **📁 File Detection Testing**

### **Google Drive Files**
- [x] Open any file in Google Drive
- [x] Click extension icon
- [x] Verify file name displays correctly
- [x] Verify file ID displays correctly
- [ ] Test with different file types (images, videos, PDFs, etc.)

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
- [x] Type a simple tag (e.g., "test")
- [x] Click "Add" button
- [x] Verify tag appears in current tags list
- [x] Verify tag input clears
- [x] Test with Enter key
- [x] Test with special characters in tags
- [x] Test with spaces in tag names

### **Multiple Tags**
- [x] Add 3-5 different tags to same file
- [x] Verify all tags display correctly
- [x] Verify tags are saved to file
- [x] Test with duplicate tags (should be prevented) - **FIXED: Duplicates prevented**

### **Removing Tags**
- [x] Add a tag to a file
- [x] Click the "×" button on the tag
- [x] Verify tag disappears from list
- [x] Verify tag is removed from file
- [x] Test removing multiple tags

### **Tag Persistence**
- [x] Add tags to a file
- [x] Close the file completely
- [x] Reopen the same file
- [x] Click extension icon
- [x] Verify tags are still there
- [ ] Test persistence across browser sessions

## **🔍 Tag Suggestions Testing**

### **Suggestion Display**
- [x] Add tags to one file
- [x] Open a different file
- [x] Verify previous tags appear as suggestions
- [x] Test clicking on suggestion tags
- [x] Verify suggestions work across different files - **ISSUE: Shows current file tags instead of global**

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
- [x] Right-click on a file in Google Drive
- [x] Verify "Tag File" appears in context menu
- [x] Click "Tag File" option
- [x] Verify tagging dialog opens
- [x] Test with multiple file selection

## **🔍 Edge Case Testing**

### **Different File Types**
- [x] **Images (JPG, PNG, GIF, etc.)**
  - [x] Upload an image to Google Drive
  - [x] Right-click on the image
  - [x] Verify "Tag File" appears in context menu
  - [x] Click "Tag File" and add tags
  - [x] Verify tags are saved and displayed
  - [x] Test with different image formats (JPG, PNG, GIF, WebP)

- [ ] **Videos (MP4, MOV, AVI, etc.)**
  - [ ] Upload a video to Google Drive
  - [ ] Right-click on the video
  - [ ] Verify "Tag File" appears in context menu
  - [ ] Click "Tag File" and add tags
  - [ ] Verify tags are saved and displayed
  - [ ] Test with different video formats (MP4, MOV, AVI, WebM)

- [ ] **Audio Files (MP3, WAV, etc.)**
  - [ ] Upload an audio file to Google Drive
  - [ ] Right-click on the audio file
  - [ ] Verify "Tag File" appears in context menu
  - [ ] Click "Tag File" and add tags
  - [ ] Verify tags are saved and displayed

- [x] **Google Docs Documents**
  - [x] Right-click on a Google Docs file
  - [x] Verify "Tag File" appears in context menu
  - [x] Click "Tag File" and add tags
  - [x] Verify tags are saved and displayed

- [x] **PDF Documents**
  - [x] Upload a PDF to Google Drive
  - [x] Right-click on the PDF
  - [x] Verify "Tag File" appears in context menu
  - [x] Click "Tag File" and add tags
  - [x] Verify tags are saved and displayed

- [ ] **Compressed Files (ZIP, RAR, etc.)**
  - [ ] Upload a compressed file to Google Drive
  - [ ] Right-click on the compressed file
  - [ ] Verify "Tag File" appears in context menu
  - [ ] Click "Tag File" and add tags
  - [ ] Verify tags are saved and displayed

### **File Size and Performance**
- [ ] Test with very large files (>100MB)
- [ ] Test with many files in a folder
- [ ] Test performance when adding tags to multiple files quickly

### **Special Characters and Names**
- [ ] Test with files containing special characters in names
- [ ] Test with files with very long names
- [ ] Test with files with emoji in names

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
