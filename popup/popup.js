// Google Drive Tagging Extension - Popup JavaScript
// Clean Architecture: UI-only interface with message passing to background script

class DriveTaggingPopup {
    constructor() {
        this.currentFileId = null;
        this.currentTags = [];
        this.allTags = new Set();
        this.selectedFiles = [];
        
        this.initializeElements();
        this.bindEvents();
        this.checkAuthentication();
    }

    // Initialize DOM elements
    initializeElements() {
        // Authentication elements
        this.authSection = document.getElementById('authSection');
        this.mainContent = document.getElementById('mainContent');
        this.loginBtn = document.getElementById('loginBtn');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.statusText = document.getElementById('statusText');

        // File info elements
        this.fileName = document.getElementById('fileName');
        this.fileId = document.getElementById('fileId');

        // Tag management elements
        this.tagInput = document.getElementById('tagInput');
        this.addTagBtn = document.getElementById('addTagBtn');
        this.currentTagsContainer = document.getElementById('currentTags');
        this.tagSuggestions = document.getElementById('tagSuggestions');

        // Batch operations elements
        this.selectFilesBtn = document.getElementById('selectFilesBtn');
        this.batchTagBtn = document.getElementById('batchTagBtn');
        this.selectedFiles = document.getElementById('selectedFiles');

        // Search elements
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.searchResults = document.getElementById('searchResults');

        // Utility elements
        this.loading = document.getElementById('loading');
        this.errorMessage = document.getElementById('errorMessage');
        this.errorText = document.getElementById('errorText');
        this.dismissError = document.getElementById('dismissError');
    }

    // Bind event listeners
    bindEvents() {
        // Authentication
        this.loginBtn.addEventListener('click', () => this.authenticate());
        this.reauthBtn = document.getElementById('reauthBtn');
        this.reauthBtn.addEventListener('click', () => this.authenticate());

        // Tag management
        this.addTagBtn.addEventListener('click', () => this.addTag());
        this.tagInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTag();
        });

        // Batch operations
        this.selectFilesBtn.addEventListener('click', () => this.selectFiles());
        this.batchTagBtn.addEventListener('click', () => this.batchTag());

        // Search
        this.searchBtn.addEventListener('click', () => this.searchTags());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchTags();
        });

        // Error handling
        this.dismissError.addEventListener('click', () => this.hideError());

        // Listen for messages from content script
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
        });
    }

    // Check authentication status
    async checkAuthentication() {
        try {
            this.showLoading();
            
            const response = await this.sendMessage({ action: 'checkAuth' });
            
            if (response.success && response.authenticated) {
                this.setAuthenticated(true);
                this.loadCurrentFile();
                this.loadTagSuggestions();
            } else {
                console.log('Authentication check failed:', response.error);
                this.setAuthenticated(false);
                if (response.error && response.error !== 'Background script not available') {
                    this.showError('Failed to check authentication status');
                }
            }
        } catch (error) {
            console.error('Authentication check error:', error);
            this.setAuthenticated(false);
            this.showError('Failed to check authentication status');
        } finally {
            this.hideLoading();
        }
    }

    // Authenticate with Google Drive
    async authenticate() {
        try {
            this.showLoading();
            
            const response = await this.sendMessage({ action: 'authenticate' });
            
            if (response.success) {
                this.setAuthenticated(true);
                this.loadCurrentFile();
                this.loadTagSuggestions();
                this.hideError();
            } else {
                console.error('Authentication failed:', response.error);
                this.setAuthenticated(false);
                this.showError(response.error || 'Authentication failed');
            }
        } catch (error) {
            console.error('Authentication error:', error);
            this.setAuthenticated(false);
            this.showError('Authentication failed');
        } finally {
            this.hideLoading();
        }
    }

    // Set authentication status
    setAuthenticated(authenticated) {
        if (authenticated) {
            this.authSection.style.display = 'none';
            this.mainContent.style.display = 'block';
            this.statusIndicator.className = 'status-indicator connected';
            this.statusText.textContent = 'Connected';
            this.reauthBtn.style.display = 'block';
        } else {
            this.authSection.style.display = 'block';
            this.mainContent.style.display = 'none';
            this.statusIndicator.className = 'status-indicator disconnected';
            this.statusText.textContent = 'Not connected';
            this.reauthBtn.style.display = 'none';
        }
    }

    // Load current file information
    async loadCurrentFile() {
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            const currentTab = tabs[0];
            
            if (!currentTab.url) {
                this.showError('Unable to detect current file');
                return;
            }

            const fileId = this.extractFileId(currentTab.url);
            if (!fileId) {
                this.showError('Not on Google Drive');
                return;
            }

            this.currentFileId = fileId;
            this.fileId.textContent = fileId;
            
            // Get file name
            const fileName = this.extractFileName(currentTab.url);
            this.fileName.textContent = fileName || 'Unknown file';
            
            // Load tags for this file
            await this.loadCurrentTags();
            
        } catch (error) {
            console.error('Failed to load current file:', error);
            this.showError('Failed to load current file');
        }
    }

    // Extract file ID from URL
    extractFileId(url) {
        // Google Drive file URLs
        const driveMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (driveMatch) return driveMatch[1];
        
        // Google Drive open URLs
        const openMatch = url.match(/[?&]id=([a-zA-Z0-9-_]+)/);
        if (openMatch) return openMatch[1];
        
        // Google Docs/Sheets/Slides URLs
        const docsMatch = url.match(/\/(document|spreadsheets|presentation)\/d\/([a-zA-Z0-9-_]+)/);
        if (docsMatch) return docsMatch[2];
        
        return null;
    }

    // Extract file name from URL
    extractFileName(url) {
        // Try to extract from URL path
        const pathMatch = url.match(/\/([^\/]+)(?:\/edit|\/view)?$/);
        if (pathMatch) {
            return decodeURIComponent(pathMatch[1]);
        }
        return null;
    }

    // Load current tags for the selected file
    async loadCurrentTags() {
        if (!this.currentFileId) return;

        try {
            this.showLoading();
            
            const response = await this.sendMessage({
                action: 'getTags',
                fileId: this.currentFileId
            });

            if (response.success) {
                this.currentTags = response.data || [];
                this.renderCurrentTags();
                console.log('Tags loaded successfully:', this.currentTags);
            } else {
                console.error('Failed to load tags:', response.error);
                this.currentTags = [];
                this.renderCurrentTags();
                this.showError('Failed to load tags');
            }
        } catch (error) {
            console.error('Failed to load current tags:', error);
            this.currentTags = [];
            this.renderCurrentTags();
            this.showError('Failed to load tags');
        } finally {
            this.hideLoading();
        }
    }

    // Add a new tag
    async addTag() {
        const tagText = this.tagInput.value.trim();
        if (!tagText || !this.currentFileId) return;

        // Check for duplicate tags
        if (this.currentTags.includes(tagText)) {
            this.showError('This tag already exists');
            return;
        }

        try {
            this.showLoading();
            
            const response = await this.sendMessage({
                action: 'addTag',
                fileId: this.currentFileId,
                tag: tagText
            });

            if (response.success) {
                this.currentTags = response.data || [];
                this.renderCurrentTags();
                this.tagInput.value = '';
                this.loadTagSuggestions();
                this.hideError();
                console.log('Tag added successfully:', tagText);
            } else {
                console.error('Failed to add tag:', response.error);
                this.showError(response.error || 'Failed to add tag');
            }
        } catch (error) {
            console.error('Failed to add tag:', error);
            this.showError(`Failed to add tag: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }

    // Remove a tag
    async removeTag(tagToRemove) {
        if (!this.currentFileId) return;

        try {
            this.showLoading();
            
            const response = await this.sendMessage({
                action: 'removeTag',
                fileId: this.currentFileId,
                tag: tagToRemove
            });

            if (response.success) {
                this.currentTags = response.data || [];
                this.renderCurrentTags();
                this.loadTagSuggestions();
                console.log('Tag removed successfully:', tagToRemove);
            } else {
                console.error('Failed to remove tag:', response.error);
                this.showError('Failed to remove tag');
            }
        } catch (error) {
            console.error('Failed to remove tag:', error);
            this.showError('Failed to remove tag');
        } finally {
            this.hideLoading();
        }
    }

    // Render current tags in the UI
    renderCurrentTags() {
        if (!this.currentTagsContainer) return;

        this.currentTagsContainer.innerHTML = '';
        
        this.currentTags.forEach(tag => {
            const tagElement = document.createElement('div');
            tagElement.className = 'tag';
            tagElement.innerHTML = `
                <span>${tag}</span>
                <button class="tag-remove" data-tag="${tag}">×</button>
            `;
            
            // Add remove event listener
            const removeBtn = tagElement.querySelector('.tag-remove');
            removeBtn.addEventListener('click', () => this.removeTag(tag));
            
            this.currentTagsContainer.appendChild(tagElement);
        });
    }

    // Load tag suggestions
    async loadTagSuggestions() {
        // TODO: Implement global tag suggestions
        // For now, just use current file tags as suggestions
        this.allTags = new Set(this.currentTags);
        this.renderTagSuggestions();
    }

    // Render tag suggestions
    renderTagSuggestions() {
        if (!this.tagSuggestions) return;

        this.tagSuggestions.innerHTML = '';
        
        this.allTags.forEach(tag => {
            const suggestionElement = document.createElement('div');
            suggestionElement.className = 'tag-suggestion';
            suggestionElement.textContent = tag;
            suggestionElement.addEventListener('click', () => {
                this.tagInput.value = tag;
                this.tagInput.focus();
            });
            
            this.tagSuggestions.appendChild(suggestionElement);
        });
    }

    // Send message to background script
    async sendMessage(message) {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage(message, (response) => {
                if (chrome.runtime.lastError) {
                    console.error('Message error:', chrome.runtime.lastError);
                    resolve({ success: false, error: 'Background script not available' });
                } else {
                    resolve(response || { success: false, error: 'No response' });
                }
            });
        });
    }

    // Handle messages from content script
    handleMessage(request, sender, sendResponse) {
        console.log('Popup received message:', request);
        
        switch (request.action) {
            case 'updateSelectedFiles':
                this.selectedFiles = request.files || [];
                this.updateSelectedFilesDisplay();
                break;
                
            default:
                console.log('Unknown message action:', request.action);
        }
        
        sendResponse({ success: true });
    }

    // Update selected files display
    updateSelectedFilesDisplay() {
        if (!this.selectedFiles) return;
        
        this.selectedFiles.textContent = `${this.selectedFiles.length} files selected`;
    }

    // Show loading state
    showLoading() {
        if (this.loading) {
            this.loading.style.display = 'block';
        }
    }

    // Hide loading state
    hideLoading() {
        if (this.loading) {
            this.loading.style.display = 'none';
        }
    }

    // Show error message
    showError(message) {
        if (this.errorMessage && this.errorText) {
            this.errorText.textContent = message;
            this.errorMessage.style.display = 'block';
        }
    }

    // Hide error message
    hideError() {
        if (this.errorMessage) {
            this.errorMessage.style.display = 'none';
        }
    }

    // Placeholder methods for future features
    selectFiles() {
        console.log('Select files - not implemented yet');
    }

    batchTag() {
        console.log('Batch tag - not implemented yet');
    }

    searchTags() {
        console.log('Search tags - not implemented yet');
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DriveTaggingPopup();
});
