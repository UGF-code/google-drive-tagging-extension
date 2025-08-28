# 📋 Google Drive Tagging Extension - Project Requirements

## 🎯 **Project Overview**
A Chrome extension that provides advanced tagging capabilities for Google Drive files, featuring nested tag templates, location-aware tag suggestions, and seamless integration with Google Docs, Sheets, Slides, and media files.

---

## 🏗️ **Core Architecture**

### **Current Foundation (Completed)**
- ✅ **Background Script**: Central controller for all Google Drive operations
- ✅ **Popup Script**: UI interface with message passing
- ✅ **Content Script**: Native Drive integration with message passing
- ✅ **Clean Architecture**: All communication via `chrome.runtime.sendMessage`
- ✅ **Google Drive API Integration**: Using `appProperties` for tag storage
- ✅ **Error Handling**: Comprehensive error management and user feedback

---

## 📋 **Phase 5 Requirements: Advanced Tag Template System**

### **1. Tag Display Location**

#### **Primary Display Areas:**
- **Google Docs**: Toolbar area (as marked in user screenshot)
- **Google Sheets**: Toolbar area
- **Google Slides**: Toolbar area
- **Images**: Toolbar area (when viewing in Drive)
- **Videos**: Toolbar area (when viewing in Drive)

#### **Secondary Display Areas:**
- **Right-click context menu**: Enhanced dialog with template support
- **Extension popup**: Template-aware tag management

#### **Display Behavior:**
- **Applied tags**: Show in toolbar area with remove (×) buttons
- **Add button**: Plus icon (+) to open tag selection interface
- **Layout**: Up to 10 tags per line (overflow handling to be determined later)
- **Real-time updates**: Tags update immediately when applied/removed
- **Tag movement**: When a tag is applied, it moves from available tags to applied tags section
- **Visual feedback**: Clear distinction between available and applied tags

### **2. Side Panel Integration**

#### **Access Method:**
- **Google Drive menu**: Always visible side panel
- **Location**: Integrated into Drive's native side panel interface
- **Purpose**: Template management and configuration
- **Default state**: Always visible (no toggle needed)
- **Integration**: Seamless integration with Drive's native interface

#### **Side Panel Features:**
- **Template creation/editing**
- **Folder assignment management**
- **Tag set organization**
- **Import/export functionality**
- **Project template overview**

### **3. Tag Template System**

#### **Template Structure:**
```javascript
// Global Tags (available everywhere)
global: {
  name: "General Tags",
  tags: ["urgent", "personal", "to send", "backup", "original", "edited", "upscaled"]
}

// Project-Specific Tags (folder-based)
projects: {
  "Trini Engineering Solutions": {
    folderId: "1ABC123...",
    folderPath: "/Trini Engineering/",
    tags: ["Equipment Image", "Spares", "Customer location"]
  },
  "Prak Hotel": {
    folderId: "2DEF456...", 
    folderPath: "/Prak Hotel/",
    tags: ["Room image", "winter", "summer", "activities", "amenities"]
  }
}
```

#### **Template Management:**
- **Manual folder assignment**: User manually assigns templates to specific folders
- **Ongoing management**: Templates can be created, edited, and deleted at any time
- **Project scope**: 10-12 projects to manage
- **No cross-account sharing**: Templates are account-specific
- **Template creation**: Separate config page accessible from Drive side panel
- **Folder assignment**: Manual assignment to relevant folders after template creation
- **Flexible organization**: Support for nested project structures

#### **Folder Organization:**
- **One main folder per project** with subfolders
- **Tag availability**: Project tags available across all subfolders within the project
- **No multi-folder files**: Files cannot be in multiple project folders simultaneously

### **4. Location Detection & Tag Display**

#### **Smart Detection:**
- **Current file location**: Parse URL to determine current folder
- **Project matching**: Match current folder to project templates
- **Tag set selection**: Show global tags + relevant project tags
- **Fallback behavior**: Show only global tags if no project match

#### **Display Logic:**
- **Global tags**: Always visible across all locations
- **Project tags**: Only visible when in project folder or subfolder
- **Applied tags**: Show current file's tags with remove functionality
- **Quick apply**: One-click tag application via buttons
- **Tag availability**: Project tags available across all subfolders within the project
- **Location awareness**: System automatically detects current file location and shows appropriate tags

### **5. User Interface Specifications**

#### **Toolbar Integration:**
```
┌─────────────────────────────────────┐
│ Applied Tags: [tag1] [×] [tag2] [×] [+] │
└─────────────────────────────────────┘
```

**Note**: Applied tags appear in the toolbar area as marked in user screenshot, with plus icon to add more tags.

#### **Tag Selection Interface:**
```
┌─────────────────────────────────────┐
│ Add Tags                            │
├─────────────────────────────────────┤
│ General Tags:                       │
│ [urgent] [personal] [to send]       │
│ [backup] [original] [edited]        │
│ [upscaled]                          │
├─────────────────────────────────────┤
│ Project Tags:                       │
│ [Equipment Image] [Spares]          │
│ [Customer location]                  │
├─────────────────────────────────────┤
│ [Cancel] [Apply Selected]           │
└─────────────────────────────────────┘
```

**Note**: Tags are displayed as quick buttons that can be clicked. When applied, tags move from available tags to applied tags section.

#### **Side Panel Template Manager:**
```
┌─────────────────────────────────────┐
│ Tag Template Manager                │
├─────────────────────────────────────┤
│ Global Tags: [Edit]                 │
│ [urgent] [personal] [to send]       │
│ [backup] [original] [edited]        │
│ [upscaled]                          │
├─────────────────────────────────────┤
│ Project Templates:                  │
│ 📁 Trini Engineering Solutions      │
│    [Equipment Image] [Spares]       │
│    [Customer location]              │
│    Folder: /Trini Engineering/      │
│    [Edit] [Delete]                  │
│                                     │
│ 📁 Prak Hotel                       │
│    [Room image] [winter] [summer]   │
│    [activities] [amenities]         │
│    Folder: /Prak Hotel/             │
│    [Edit] [Delete]                  │
├─────────────────────────────────────┤
│ [Add New Project] [Import/Export]   │
└─────────────────────────────────────┘
```

**Note**: Separate config page accessible from Drive side panel for managing tag sets and assigning them to folders.

### **6. Technical Implementation Requirements**

#### **6.1 Google Drive Side Panel**
- **Manifest v3 side panel** integration
- **Template CRUD operations** (Create, Read, Update, Delete)
- **Folder assignment interface**
- **Import/export functionality**
- **Real-time template updates**

#### **6.2 In-Page Tag Injection**
- **Content script** for Docs/Sheets/Slides/Media
- **Toolbar integration** with native Drive interface (as marked in user screenshot)
- **Real-time tag updates**
- **Quick button functionality**
- **Responsive design** for different screen sizes
- **Tag injection**: Applied tags appear in toolbar area with plus icon for adding more
- **Media support**: Images and videos when viewing in Drive

#### **6.3 Template Storage**
- **Google Drive API** for template storage
- **appProperties** for template configuration
- **Background script** for template management
- **Data synchronization** across all components

#### **6.4 Folder Detection**
- **URL parsing** for current file location
- **Project folder matching** algorithm
- **Subfolder inheritance** logic (tags available across all subfolders within project)
- **Fallback to global tags** when no project match
- **Location awareness**: Automatically detects current file location and shows appropriate tag sets
- **Project scope**: Each project has one main folder with subfolders

### **7. User Experience Requirements**

#### **7.1 Template Setup**
- **Ongoing management**: Templates can be modified at any time
- **Manual assignment**: User manually assigns templates to folders after creation
- **Flexible organization**: Support for 10-12 projects
- **Account-specific**: No cross-account template sharing
- **Template creation**: Separate config page accessible from Drive side panel
- **Folder assignment**: Manual assignment to relevant folders
- **Project structure**: Each project has one main folder with subfolders

#### **7.2 Tag Application**
- **One-click application**: Quick tag application via buttons
- **Visual feedback**: Clear indication of applied vs available tags
- **Remove functionality**: Easy tag removal with × buttons
- **Real-time updates**: Immediate UI updates when tags change
- **Tag movement**: When applied, tags move from available tags to applied tags section
- **Quick buttons**: Tags displayed as clickable buttons for fast application

#### **7.3 Error Handling**
- **Graceful degradation**: Fallback behavior when templates unavailable
- **User feedback**: Clear error messages and guidance
- **Data validation**: Prevent invalid template configurations
- **Recovery mechanisms**: Handle folder structure changes

### **8. Performance Requirements**

#### **8.1 Response Times**
- **Tag loading**: Under 1 second
- **Tag application**: Under 500ms
- **Template switching**: Under 2 seconds
- **Side panel loading**: Under 1 second

#### **8.2 Scalability**
- **Support for 10-12 projects** with 20-50 tags each
- **Efficient memory usage** for large tag sets
- **Fast folder detection** across complex folder structures
- **Smooth UI interactions** with no lag

### **9. Implementation Phases**

#### **Phase 5.1: Core Template System (3-4 weeks)**
1. **Template storage and management** (background script)
2. **Side panel interface** (template CRUD)
3. **Folder detection logic**
4. **Basic template switching**

#### **Phase 5.2: In-Page Integration (2-3 weeks)**
1. **Google Docs/Sheets/Slides toolbar injection**
2. **Media file toolbar integration**
3. **Quick button interface**
4. **Applied tags display**

#### **Phase 5.3: Polish & Testing (1-2 weeks)**
1. **UI/UX refinement**
2. **Performance optimization**
3. **Error handling**
4. **User testing and feedback**

### **10. Implementation Priorities & Exclusions**

#### **Priority Features (Phase 5):**
- ✅ **Template system** with nested tag organization
- ✅ **Location-aware tag display** (toolbar integration)
- ✅ **Side panel template management**
- ✅ **Quick button interface** for tag application
- ✅ **Manual folder assignment** for templates

#### **Excluded from Phase 5:**
- ❌ **Batch operations** (will be implemented after template system)
- ❌ **Collaboration features** (no cross-account sharing needed)
- ❌ **Advanced search** (will be implemented later)
- ❌ **Tag analytics** (will be implemented later)
- ❌ **Smart automation** (will be implemented later)

#### **Future Phases:**
- **Phase 6**: Batch operations for multi-file tagging
- **Phase 7**: Advanced search and filtering
- **Phase 8**: Tag analytics and insights
- **Phase 9**: Smart automation features

### **11. Success Criteria**

#### **11.1 Functional Requirements**
- ✅ **Template creation**: Users can create and manage tag templates
- ✅ **Folder assignment**: Templates can be assigned to specific folders
- ✅ **Location detection**: System correctly detects current file location
- ✅ **Tag display**: Tags appear in toolbar area as specified
- ✅ **Quick application**: One-click tag application works smoothly
- ✅ **Tag movement**: Applied tags move from available to applied section
- ✅ **Side panel management**: Template management accessible from Drive side panel

#### **11.2 User Experience Requirements**
- ✅ **Intuitive interface**: Easy to understand and use
- ✅ **Fast performance**: All operations complete quickly
- ✅ **Reliable operation**: No crashes or data loss
- ✅ **Consistent behavior**: Same experience across all file types
- ✅ **Quick button interface**: Tags displayed as clickable buttons
- ✅ **Visual feedback**: Clear distinction between available and applied tags

#### **11.3 Technical Requirements**
- ✅ **Clean architecture**: Maintains existing clean architecture
- ✅ **Error handling**: Comprehensive error management
- ✅ **Data persistence**: Tags and templates persist correctly
- ✅ **Cross-platform**: Works on all supported platforms
- ✅ **Google Drive API integration**: Uses appProperties for storage
- ✅ **Message passing**: All communication via chrome.runtime.sendMessage

---

## 🚀 **Next Steps**

### **Immediate Actions:**
1. **Review and approve requirements**
2. **Begin Phase 5.1 implementation**
3. **Create detailed technical specifications**
4. **Design UI/UX mockups**

### **Questions for Clarification:**
- **Overflow handling**: How to display more than 10 tags per line? (To be determined later)
- **Template validation**: Any naming conventions or restrictions?
- **Performance targets**: Specific response time requirements?
- **Testing approach**: Manual testing or automated testing?
- **Batch operations**: Will be implemented after template system is complete
- **Collaboration features**: Will be implemented last (no cross-account sharing needed)

---

**Ready to proceed with implementation?** 🎯
