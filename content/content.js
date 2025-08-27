// Google Drive Tagging Extension - Content Script
// This script runs on Google Drive pages and integrates with the Drive interface

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
        
        // Extract current file ID from URL
        this.updateCurrentFile();
        
        // Add custom styling for our UI elements
        this.injectStyles();
        
        // Setup file selection tracking
        this.setupFileSelection();
        
        // Setup context menu integration
        this.setupContextMenu();
        
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
            
            // Notify popup about file change
            chrome.runtime.sendMessage({
                action: 'fileSelected',
                fileId: fileId,
                fileName: this.getCurrentFileName()
            });
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
        
                // Notify popup about selection change
        if (this.selectedFiles.length > 0) {
          try {
            chrome.runtime.sendMessage({
              action: 'batchFilesSelected',
              files: this.selectedFiles
            });
          } catch (error) {
            console.log('Could not send message to popup (popup may be closed):', error);
          }
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
        // Create a modal dialog for tagging
        const dialog = this.createTagDialog(fileId);
        document.body.appendChild(dialog);
        
        // Focus on the dialog
        const input = dialog.querySelector('.tag-input');
        if (input) {
            input.focus();
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
        const overlay = dialog.querySelector('.dialog-overlay');
        
        // Close dialog
        const closeDialog = () => {
            dialog.remove();
        };
        
        closeBtn?.addEventListener('click', closeDialog);
        cancelBtn?.addEventListener('click', closeDialog);
        overlay?.addEventListener('click', (e) => {
            if (e.target === overlay) closeDialog();
        });
        
        // Handle tag input
        if (fileId) {
            const tagInput = dialog.querySelector('.tag-input');
            const addBtn = dialog.querySelector('.add-tag-btn');
            const currentTags = dialog.querySelector('.current-tags');
            
            // Load current tags
            this.loadFileTags(fileId).then(tags => {
                this.renderTagsInDialog(currentTags, tags);
            });
            
            // Add tag
            const addTag = () => {
                const tagText = tagInput.value.trim();
                if (tagText) {
                    this.addTagToFile(fileId, tagText);
                    tagInput.value = '';
                }
            };
            
            addBtn?.addEventListener('click', addTag);
            tagInput?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') addTag();
            });
        }
    }

    // Load file tags
    async loadFileTags(fileId) {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'getFileTags',
                fileId: fileId
            });
            
            return response.success ? response.tags : [];
        } catch (error) {
            console.error('Failed to load file tags:', error);
            return [];
        }
    }

    // Add tag to file
    async addTagToFile(fileId, tag) {
        try {
            const currentTags = await this.loadFileTags(fileId);
            const newTags = [...currentTags, tag];
            
            const response = await chrome.runtime.sendMessage({
                action: 'updateFileTags',
                fileId: fileId,
                tags: newTags
            });
            
            if (response.success) {
                // Update the dialog
                const dialog = document.querySelector('.drive-tagging-dialog');
                const currentTagsElement = dialog?.querySelector('.current-tags');
                if (currentTagsElement) {
                    this.renderTagsInDialog(currentTagsElement, newTags);
                }
            }
        } catch (error) {
            console.error('Failed to add tag:', error);
        }
    }

    // Render tags in dialog
    renderTagsInDialog(container, tags) {
        if (tags.length === 0) {
            container.innerHTML = '<div class="no-tags">No tags yet</div>';
            return;
        }
        
        container.innerHTML = tags.map(tag => `
            <div class="tag">
                <span>${this.escapeHtml(tag)}</span>
                <button class="tag-remove" data-tag="${this.escapeHtml(tag)}">×</button>
            </div>
        `).join('');
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
