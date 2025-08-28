# 🧪 Popup Functionality Test Checklist

## **Test Environment**
- [ ] Extension reloaded with new background script
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
- [ ] Go to Google Drive
- [ ] Open a document/spreadsheet
- [ ] Click extension icon
- [ ] Check if file name is detected
- [ ] Check if file ID is shown
- [ ] Verify "Not on Google Drive" doesn't appear

### **Test 4: Google Docs/Sheets/Slides**
- [ ] Open a Google Doc
- [ ] Click extension icon
- [ ] Check if file is detected
- [ ] Repeat for Google Sheets
- [ ] Repeat for Google Slides

## **🏷️ Tag Operations Tests**

### **Test 5: Add Tag**
- [ ] Select a file in Google Drive
- [ ] Open extension popup
- [ ] Type a tag name in the input field
- [ ] Click "Add" button
- [ ] Check if tag appears in the list
- [ ] Check if input field clears
- [ ] Check console for success/error messages

### **Test 6: Remove Tag**
- [ ] Add a tag (from Test 5)
- [ ] Click the "×" button next to the tag
- [ ] Check if tag is removed from list
- [ ] Check console for success/error messages

### **Test 7: Duplicate Tags**
- [ ] Try to add the same tag twice
- [ ] Check if duplicate is prevented
- [ ] Check if error message appears

## **🖱️ Context Menu Tests**

### **Test 8: Right-Click Menu**
- [ ] Go to Google Drive
- [ ] Right-click on a file
- [ ] Check if "Tag File" appears in context menu
- [ ] Click "Tag File"
- [ ] Check if dialog opens
- [ ] Check if file is detected in dialog

### **Test 9: Dialog Operations**
- [ ] Open tag dialog (from Test 8)
- [ ] Try to add a tag in the dialog
- [ ] Check if tag appears in dialog
- [ ] Click "Save" button
- [ ] Check if dialog closes
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

**Overall Status:** [ ] Working / [ ] Partially Working / [ ] Not Working

**Ready for Refactor:** [ ] Yes / [ ] No (explain why)

**Priority Issues:** List any critical issues that need fixing before refactor
