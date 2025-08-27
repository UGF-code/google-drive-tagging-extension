// Google Drive Tagging Extension - Content Script
// This script runs on Google Drive pages and integrates with the Drive interface

console.log('🚀 CONTENT SCRIPT LOADED - VERSION WITH DEBUGGING');

class DriveContentScript {
    constructor() {
        this.currentFileId = null;
        this.selectedFiles = [];
        this.isInitialized = false;
        
        this.initialize();
    }

    // Initialize the content script
    initialize() {
        // Wait for the page to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupIntegration());
        } else {
            this.setupIntegration();
        }

        // Listen for navigation changes (SPA behavior)
        this.observeNavigation();
        
        // Listen for messages from popup and background
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
        });
    }

    // Setup integration with Google Drive
    setupIntegration() {
        if (this.isInitialized) return;
        
        console.log('Setting up Google Drive Tagging integration...');
        console.log('Current URL:', window.location.href);
        console.log('Document ready state:', document.readyState);
        
        // Extract current file ID from URL
        this.updateCurrentFile();
        
        // Add custom styling for our UI elements
        this.injectStyles();
        
        // Setup file selection tracking
        this.setupFileSelection();
        
        // Setup context menu integration
        this.setupContextMenu();
        
        // Test if we can inject custom context menu
        this.injectCustomContextMenu();
        
        this.isInitialized = true;
    }

    // Observe navigation changes in Google Drive (SPA)
    observeNavigation() {
        // Watch for URL changes
        let lastUrl = location.href;
        new MutationObserver(() => {
            const url = location.href;
            if (url !== lastUrl) {
                lastUrl = url;
                this.updateCurrentFile();
            }
        }).observe(document, { subtree: true, childList: true });
    }

    // Update current file information
    updateCurrentFile() {
        const fileId = this.extractFileIdFromUrl();
        
        if (fileId !== this.currentFileId) {
            this.currentFileId = fileId;
            
            // Log file change locally instead of sending message
            console.log('File changed to:', fileId, 'Name:', this.getCurrentFileName());
        }
    }

    // Extract file ID from current URL
    extractFileIdFromUrl() {
        const url = window.location.href;
        
        // Handle different Google Drive URL formats
        const patterns = [
            /\/d\/([a-zA-Z0-9-_]+)/,  // /d/fileId (Google Docs, Sheets, Slides)
            /id=([a-zA-Z0-9-_]+)/,    // ?id=fileId
            /\/file\/d\/([a-zA-Z0-9-_]+)/,  // /file/d/fileId
            /\/document\/d\/([a-zA-Z0-9-_]+)/,  // /document/d/fileId (Google Docs)
            /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,  // /spreadsheets/d/fileId (Google Sheets)
            /\/presentation\/d\/([a-zA-Z0-9-_]+)/   // /presentation/d/fileId (Google Slides)
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return match[1];
            }
        }
        
        return null;
    }

    // Get current file name from the page
    getCurrentFileName() {
        // Try different selectors for file name
        const selectors = [
            '[data-target="docs-title-input"]',
            '.docs-title-input',
            '[aria-label*="title"]',
            'h1',
            '.title'
        ];
        
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                const text = element.textContent || element.value || element.getAttribute('aria-label');
                if (text && text.trim()) {
                    return text.trim();
                }
            }
        }
        
        return 'Untitled File';
    }

    // Setup file selection tracking
    setupFileSelection() {
        // Watch for file selection changes in Drive
        const observer = new MutationObserver(() => {
            this.updateSelectedFiles();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'aria-selected']
        });
    }

    // Update selected files list
    updateSelectedFiles() {
        // Look for selected file elements in Drive
        const selectedElements = document.querySelectorAll('[aria-selected="true"], .selected, [data-selected="true"]');
        
        this.selectedFiles = Array.from(selectedElements).map(element => {
            const fileId = this.extractFileIdFromElement(element);
            const fileName = this.extractFileNameFromElement(element);
            
            return {
                id: fileId,
                name: fileName,
                element: element
            };
        }).filter(file => file.id && file.name);
        
                // Log selection change locally instead of sending message
        if (this.selectedFiles.length > 0) {
          console.log('Files selected:', this.selectedFiles.length, 'files');
        }
    }

    // Extract file ID from DOM element
    extractFileIdFromElement(element) {
        // Try different attributes and data properties
        const attributes = ['data-id', 'data-file-id', 'data-item-id', 'id'];
        
        for (const attr of attributes) {
            const value = element.getAttribute(attr);
            if (value && this.isValidFileId(value)) {
                return value;
            }
        }
        
        // Try to extract from href if it's a link
        const link = element.querySelector('a[href*="/d/"]') || element.closest('a[href*="/d/"]');
        if (link) {
            const match = link.href.match(/\/d\/([a-zA-Z0-9-_]+)/);
            if (match) {
                return match[1];
            }
        }
        
        return null;
    }

    // Extract file name from DOM element
    extractFileNameFromElement(element) {
        // Try different text content selectors
        const textSelectors = [
            '[data-target="docs-title-input"]',
            '.docs-title-input',
            '.title',
            '[aria-label]',
            'span',
            'div'
        ];
        
        for (const selector of textSelectors) {
            const textElement = element.querySelector(selector) || element;
            const text = textElement.textContent || textElement.getAttribute('aria-label');
            if (text && text.trim() && text.length < 100) {
                return text.trim();
            }
        }
        
        return 'Untitled File';
    }

    // Validate file ID format
    isValidFileId(id) {
        return /^[a-zA-Z0-9-_]+$/.test(id) && id.length > 10;
    }

    // Setup context menu integration
    setupContextMenu() {
        // Add custom context menu items for our extension
        document.addEventListener('contextmenu', (event) => {
            const target = event.target;
            const fileId = this.extractFileIdFromElement(target) || this.currentFileId;
            
            if (fileId) {
                // Store file ID for context menu actions
                this.contextMenuFileId = fileId;
            }
        });
    }

    // Handle messages from popup and background
    handleMessage(request, sender, sendResponse) {
        switch (request.action) {
            case 'getCurrentFileName':
                sendResponse({
                    fileName: this.getCurrentFileName(),
                    fileId: this.currentFileId
                });
                break;
                
            case 'openTagDialog':
                this.openTagDialog(request.fileId);
                break;
                
            case 'openTagDialogForClickedFile':
                this.openTagDialogForClickedFile(request.pageUrl, request.linkUrl);
                break;
                
            case 'openBatchTagDialog':
                this.openBatchTagDialog(request.selection);
                break;
                
            case 'openPopup':
                // This would open our custom popup overlay
                this.openCustomPopup();
                break;
                
            default:
                console.log('Unknown message action:', request.action);
        }
    }

    // Open tag dialog for a specific file
    openTagDialog(fileId) {
        console.log('🎯 openTagDialog called with fileId:', fileId);
        
        // Create a modal dialog for tagging
        const dialog = this.createTagDialog(fileId);
        console.log('🎯 Dialog created:', dialog);
        
        document.body.appendChild(dialog);
        console.log('🎯 Dialog appended to body');
        
        // Focus on the dialog
        const input = dialog.querySelector('.tag-input');
        if (input) {
            input.focus();
            console.log('🎯 Input focused');
        } else {
            console.error('🎯 Input not found in dialog');
        }
    }

    // Open tag dialog for clicked file (from context menu)
    openTagDialogForClickedFile(pageUrl, linkUrl) {
        let fileId = null;
        
        // Try to extract file ID from link URL
        if (linkUrl) {
            fileId = this.extractFileIdFromUrl(linkUrl);
        }
        
        // If no file ID from link, try to detect from current page
        if (!fileId) {
            fileId = this.extractFileIdFromUrl(pageUrl);
        }
        
        // If still no file ID, try to detect from recently clicked element
        if (!fileId) {
            // Look for file elements in the page
            const fileElements = document.querySelectorAll('[data-target="docs-title-input"], [data-id], a[href*="/d/"]');
            if (fileElements.length > 0) {
                // Use the first file element found
                fileId = this.extractFileIdFromElement(fileElements[0]);
            }
        }
        
        if (fileId) {
            this.openTagDialog(fileId);
        } else {
            // Show error dialog
            this.showErrorDialog('Could not detect file. Please open the file first or use the extension popup.');
        }
    }

    // Open batch tag dialog
    openBatchTagDialog(selection) {
        // Create a modal dialog for batch tagging
        const dialog = this.createBatchTagDialog(selection);
        document.body.appendChild(dialog);
    }

    // Create tag dialog
    createTagDialog(fileId) {
        const dialog = document.createElement('div');
        dialog.className = 'drive-tagging-dialog';
        dialog.innerHTML = `
            <div class="dialog-overlay">
                <div class="dialog-content">
                    <div class="dialog-header">
                        <h3>Tag File</h3>
                        <button class="dialog-close">×</button>
                    </div>
                    <div class="dialog-body">
                        <div class="tag-input-container">
                            <input type="text" class="tag-input" placeholder="Add a tag...">
                            <button class="add-tag-btn">Add</button>
                        </div>
                        <div class="current-tags"></div>
                    </div>
                    <div class="dialog-footer">
                        <button class="dialog-cancel">Cancel</button>
                        <button class="dialog-save">Save</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners
        this.setupDialogEvents(dialog, fileId);
        
        return dialog;
    }

    // Create batch tag dialog
    createBatchTagDialog(selection) {
        const dialog = document.createElement('div');
        dialog.className = 'drive-tagging-dialog';
        dialog.innerHTML = `
            <div class="dialog-overlay">
                <div class="dialog-content">
                    <div class="dialog-header">
                        <h3>Batch Tag Files</h3>
                        <button class="dialog-close">×</button>
                    </div>
                    <div class="dialog-body">
                        <p>Batch tagging will be implemented in the next phase.</p>
                    </div>
                    <div class="dialog-footer">
                        <button class="dialog-cancel">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners
        this.setupDialogEvents(dialog);
        
        return dialog;
    }

    // Setup dialog event listeners
    setupDialogEvents(dialog, fileId = null) {
        const closeBtn = dialog.querySelector('.dialog-close');
        const cancelBtn = dialog.querySelector('.dialog-cancel');
        const saveBtn = dialog.querySelector('.dialog-save');
        const overlay = dialog.querySelector('.dialog-overlay');
        
        // Close dialog
        const closeDialog = () => {
            dialog.remove();
        };
        
        closeBtn?.addEventListener('click', closeDialog);
        cancelBtn?.addEventListener('click', closeDialog);
        saveBtn?.addEventListener('click', () => {
            console.log('Save button clicked');
            closeDialog();
        });
        overlay?.addEventListener('click', (e) => {
            if (e.target === overlay) closeDialog();
        });
        
        // Handle tag input
        if (fileId) {
            const tagInput = dialog.querySelector('.tag-input');
            const addBtn = dialog.querySelector('.add-tag-btn');
            const currentTags = dialog.querySelector('.current-tags');
            
            console.log('Dialog elements found:', {
                tagInput: !!tagInput,
                addBtn: !!addBtn,
                currentTags: !!currentTags
            });
            
            // Load current tags
            this.loadFileTags(fileId).then(tags => {
                this.renderTagsInDialog(currentTags, tags);
            });
            
            // Add tag
            const addTag = async () => {
                const tagText = tagInput.value.trim();
                console.log('Add button clicked with tag:', tagText, 'for file:', fileId);
                
                if (tagText) {
                    console.log('Adding tag:', tagText, 'to file:', fileId);
                    try {
                        const success = await this.addTagToFile(fileId, tagText);
                        console.log('addTagToFile returned:', success);
                        
                        if (success) {
                            tagInput.value = '';
                            console.log('Tag added successfully');
                            
                            // Show success message
                            const successMsg = document.createElement('div');
                            successMsg.textContent = `Tag "${tagText}" added successfully!`;
                            successMsg.style.cssText = `
                                position: fixed;
                                top: 20px;
                                right: 20px;
                                background: #4CAF50;
                                color: white;
                                padding: 10px 20px;
                                border-radius: 4px;
                                z-index: 10002;
                                font-size: 14px;
                            `;
                            document.body.appendChild(successMsg);
                            
                            // Remove success message after 3 seconds
                            setTimeout(() => {
                                successMsg.remove();
                            }, 3000);
                        } else {
                            console.error('addTagToFile returned false');
                            alert('Failed to add tag. Please try again.');
                        }
                    } catch (error) {
                        console.error('Failed to add tag:', error);
                        alert('Failed to add tag. Please try again.');
                    }
                } else {
                    console.log('No tag text provided');
                }
            };
            
            if (addBtn) {
                console.log('Adding click listener to Add button');
                console.log('Add button element:', addBtn);
                console.log('Add button HTML:', addBtn.outerHTML);
                
                // Test if button is clickable with multiple event types
                addBtn.addEventListener('click', addTag);
                addBtn.addEventListener('click', () => {
                    console.log('🎯 ADD BUTTON CLICKED - TEST EVENT');
                });
                addBtn.addEventListener('mousedown', () => {
                    console.log('🎯 ADD BUTTON MOUSEDOWN - TEST EVENT');
                });
                addBtn.addEventListener('mouseup', () => {
                    console.log('🎯 ADD BUTTON MOUSEUP - TEST EVENT');
                });
                
                // Test if button is disabled or has pointer events
                console.log('Add button disabled:', addBtn.disabled);
                console.log('Add button pointer-events:', window.getComputedStyle(addBtn).pointerEvents);
                console.log('Add button display:', window.getComputedStyle(addBtn).display);
                console.log('Add button visibility:', window.getComputedStyle(addBtn).visibility);
            } else {
                console.error('Add button not found!');
            }
            
            if (tagInput) {
                console.log('Adding keypress listener to tag input');
                tagInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') addTag();
                });
            } else {
                console.error('Tag input not found!');
            }
        }
    }

    // Load file tags
    async loadFileTags(fileId) {
        try {
            // Load from localStorage only
            const storageKey = `drive_tags_${fileId}`;
            const localTags = localStorage.getItem(storageKey);
            
            if (localTags) {
                const tags = JSON.parse(localTags);
                console.log('Loaded tags from localStorage:', tags);
                return tags;
            }
            
            console.log('No tags found for file:', fileId);
            return [];
        } catch (error) {
            console.error('Failed to load file tags:', error);
            return [];
        }
    }

    // Add tag to file
    async addTagToFile(fileId, tag) {
        try {
            console.log('Attempting to add tag:', tag, 'to file:', fileId);
            
            // Load current tags from localStorage
            const storageKey = `drive_tags_${fileId}`;
            const localTags = localStorage.getItem(storageKey);
            const currentTags = localTags ? JSON.parse(localTags) : [];
            
            // Add new tag
            const newTags = [...currentTags, tag];
            
            // Store in localStorage
            localStorage.setItem(storageKey, JSON.stringify(newTags));
            
            console.log('Tags stored locally:', newTags);
            
            // Update the dialog immediately
            const dialog = document.querySelector('.drive-tagging-dialog');
            const currentTagsElement = dialog?.querySelector('.current-tags');
            if (currentTagsElement) {
                this.renderTagsInDialog(currentTagsElement, newTags);
            }
            
            return true;
        } catch (error) {
            console.error('Failed to add tag:', error);
            return false;
        }
    }

    // Render tags in dialog
    renderTagsInDialog(container, tags) {
        console.log('Rendering tags in dialog:', tags, 'Container:', container);
        
        if (tags.length === 0) {
            console.log('No tags to render, showing "No tags yet"');
            container.innerHTML = '<div class="no-tags">No tags yet</div>';
            return;
        }
        
        const html = tags.map(tag => `
            <div class="tag">
                <span>${this.escapeHtml(tag)}</span>
                <button class="tag-remove" data-tag="${this.escapeHtml(tag)}">×</button>
            </div>
        `).join('');
        
        console.log('Setting container HTML:', html);
        container.innerHTML = html;
        console.log('Tags rendered successfully');
    }

    // Open custom popup overlay
    openCustomPopup() {
        // This would create a custom popup overlay on the Drive page
        console.log('Custom popup would open here');
    }

    // Show error dialog
    showErrorDialog(message) {
        const dialog = document.createElement('div');
        dialog.className = 'drive-tagging-dialog';
        dialog.innerHTML = `
            <div class="dialog-overlay">
                <div class="dialog-content">
                    <div class="dialog-header">
                        <h3>Error</h3>
                        <button class="dialog-close">×</button>
                    </div>
                    <div class="dialog-body">
                        <p>${message}</p>
                    </div>
                    <div class="dialog-footer">
                        <button class="dialog-cancel">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners
        this.setupDialogEvents(dialog);
        document.body.appendChild(dialog);
    }

    // Inject custom context menu into Google Drive
    injectCustomContextMenu() {
        console.log('Attempting to inject custom context menu...');
        
        // Create custom context menu
        const customMenu = document.createElement('div');
        customMenu.id = 'drive-tagging-context-menu';
        customMenu.className = 'drive-tagging-context-menu';
        customMenu.innerHTML = `
            <div class="menu-item" data-action="tagFile">
                <span class="menu-icon">🏷️</span>
                <span class="menu-text">Tag File</span>
            </div>
            <div class="menu-item" data-action="batchTag">
                <span class="menu-icon">📋</span>
                <span class="menu-text">Batch Tag Files</span>
            </div>
        `;
        
        // Add event listeners
        customMenu.addEventListener('click', (e) => {
            const action = e.target.closest('.menu-item')?.dataset.action;
            console.log('Custom menu clicked, action:', action);
            
            if (action === 'tagFile') {
                console.log('Opening tag dialog for file ID:', this.currentFileId);
                this.openTagDialog(this.currentFileId);
            } else if (action === 'batchTag') {
                console.log('Opening batch tag dialog');
                this.openBatchTagDialog();
            }
        });
        
        // Hide menu when clicking outside
        document.addEventListener('click', () => {
            customMenu.style.display = 'none';
        });
        
        // Add to page
        document.body.appendChild(customMenu);
        console.log('Custom context menu injected');
        
        // Override Google Drive's context menu
        this.overrideGoogleDriveContextMenu();
    }

    // Override Google Drive's context menu
    overrideGoogleDriveContextMenu() {
        console.log('Attempting to override Google Drive context menu...');
        
        // Listen for right-click events
        document.addEventListener('contextmenu', (e) => {
            console.log('Right-click detected on:', e.target);
            
            // Check if we're on a file element
            const fileElement = e.target.closest('[data-target="docs-title-input"], [data-id], a[href*="/d/"]');
            if (fileElement) {
                console.log('File element detected, showing custom menu');
                
                // Don't prevent default - let Google Drive's menu show too
                // e.preventDefault();
                // e.stopPropagation();
                
                // Show our custom menu after a short delay
                setTimeout(() => {
                    const customMenu = document.getElementById('drive-tagging-context-menu');
                    if (customMenu) {
                        customMenu.style.display = 'block';
                        customMenu.style.left = e.pageX + 'px';
                        customMenu.style.top = e.pageY + 'px';
                    }
                }, 100);
            }
        });
    }

    // Inject custom styles
    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .drive-tagging-dialog {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
            }
            
            .dialog-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .dialog-content {
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow: hidden;
            }
            
            .dialog-header {
                padding: 20px;
                border-bottom: 1px solid #e9ecef;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .dialog-header h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
            }
            
            .dialog-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #6c757d;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
            }
            
            .dialog-close:hover {
                background: #f8f9fa;
            }
            
            .dialog-body {
                padding: 20px;
                max-height: 400px;
                overflow-y: auto;
            }
            
            .dialog-footer {
                padding: 20px;
                border-top: 1px solid #e9ecef;
                display: flex;
                gap: 10px;
                justify-content: flex-end;
            }
            
            .tag-input-container {
                display: flex;
                gap: 8px;
                margin-bottom: 15px;
            }
            
            .tag-input {
                flex: 1;
                padding: 8px 12px;
                border: 1px solid #ced4da;
                border-radius: 6px;
                font-size: 14px;
            }
            
            .add-tag-btn {
                padding: 8px 16px;
                background: #667eea;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
            }
            
            .current-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }
            
            .tag {
                background: #e3f2fd;
                color: #1976d2;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .tag-remove {
                background: none;
                border: none;
                color: #1976d2;
                cursor: pointer;
                font-size: 14px;
                padding: 0;
                width: 16px;
                height: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
            }
            
            .tag-remove:hover {
                background: #1976d2;
                color: white;
            }
            
            .no-tags {
                color: #6c757d;
                font-style: italic;
            }
            
            .dialog-cancel, .dialog-save {
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
            }
            
            .dialog-cancel {
                background: #6c757d;
                color: white;
            }
            
            .dialog-save {
                background: #667eea;
                color: white;
            }
            
            /* Custom Context Menu Styles */
            .drive-tagging-context-menu {
                position: fixed;
                background: white;
                border: 1px solid #ddd;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                z-index: 10001;
                display: none;
                min-width: 150px;
                padding: 8px 0;
            }
            
            .drive-tagging-context-menu .menu-item {
                display: flex;
                align-items: center;
                padding: 8px 16px;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            
            .drive-tagging-context-menu .menu-item:hover {
                background-color: #f5f5f5;
            }
            
            .drive-tagging-context-menu .menu-icon {
                margin-right: 8px;
                font-size: 16px;
            }
            
            .drive-tagging-context-menu .menu-text {
                font-size: 14px;
                color: #333;
            }
        `;
        
        document.head.appendChild(style);
    }

    // Utility function to escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the content script
new DriveContentScript();
