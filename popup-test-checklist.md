# 🧪 Popup Functionality Test Checklist

## **Test Environment**
- [x] Extension reloaded with new background script
- [ ] Browser console open for monitoring
- [ ] Google Drive accessible

## **🔐 Authentication Tests**

### **Test 1: Initial Authentication**
- [ ] Open extension popup
- [ ] Check if "Connect Google Drive" button is visible
- [ ] Click "Connect Google Drive"
- [ ] Check if authentication popup appears
- [ ] Complete authentication
- [ ] Verify popup shows "Connected" status
- [ ] Check console for any errors

### **Test 2: Authentication Status**
- [ ] Close and reopen popup
- [ ] Check if still shows "Connected"
- [ ] Check if file detection works
- [ ] Verify no authentication errors

## **📁 File Detection Tests**

### **Test 3: Google Drive File**
- [x] Go to Google Drive
- [x] Open a document/spreadsheet
- [x] Click extension icon
- [x] Check if file name is detected
- [x] Check if file ID is shown
- [x] Verify "Not on Google Drive" doesn't appear

### **Test 4: Google Docs/Sheets/Slides**
- [x] Open a Google Doc
- [x] Click extension icon
- [x] Check if file is detected
- [x] Repeat for Google Sheets
- [x] Repeat for Google Slides

## **🏷️ Tag Operations Tests**

### **Test 5: Add Tag**
- [x] Select a file in Google Drive
- [x] Open extension popup
- [x] Type a tag name in the input field
- [x] Click "Add" button
- [x] Check if tag appears in the list
- [x] Check if input field clears
- [x] Check console for success/error messages

### **Test 6: Remove Tag**
- [x] Add a tag (from Test 5)
- [x] Click the "×" button next to the tag
- [x] Check if tag is removed from list
- [x] Check console for success/error messages

### **Test 7: Duplicate Tags**
- [x] Try to add the same tag twice
- [x] Check if duplicate is prevented
- [x] Check if error message appears

## **🖱️ Context Menu Tests**

### **Test 8: Right-Click Menu**
- [x] Go to Google Drive
- [x] Right-click on a file
- [x] Check if "Tag File" appears in context menu
- [x] Click "Tag File"
- [x] Check if dialog opens
- [x] Check if file is detected in dialog

### **Test 9: Dialog Operations**
- [x] Open tag dialog (from Test 8)
- [x] Try to add a tag in the dialog
- [x] Check if tag appears in dialog
- [x] Click "Save" button
- [x] Check if dialog closes
- [ ] Reopen popup and check if tag persists

## **🔍 Error Handling Tests**

### **Test 10: Network Errors**
- [ ] Disconnect internet
- [ ] Try to add a tag
- [ ] Check if appropriate error message appears
- [ ] Reconnect internet
- [ ] Try again

### **Test 11: Permission Errors**
- [ ] Try to tag a file you don't own
- [ ] Check if permission error appears
- [ ] Check if error message is helpful

## **📊 Test Results Summary**

### **✅ Working Features:**
- [ ] Authentication
- [ ] File detection
- [ ] Tag adding
- [ ] Tag removing
- [ ] Context menu
- [ ] Dialog operations
- [ ] Error handling

### **❌ Issues Found:**
- [ ] List any problems here
- [ ] Note error messages
- [ ] Document unexpected behavior

### **📝 Notes:**
- [ ] Performance observations
- [ ] UI/UX feedback
- [ ] Suggestions for improvement

---

## **🎯 Test Completion**

**Overall Status:** [x] Partially Working / [ ] Working / [ ] Not Working

**Ready for Refactor:** [x] Yes / [ ] No (explain why)

**Priority Issues:** 
- **Critical**: Popup and dialog tag sync issue needs to be fixed during refactor
- **High**: Popup tags don't persist - needs to use background script storage
- **Medium**: Ensure both interfaces show consistent data
