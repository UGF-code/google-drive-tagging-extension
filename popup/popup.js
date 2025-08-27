// Google Drive Tagging Extension - Popup JavaScript
// This handles all UI interactions and communicates with the background service worker

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
            
            const response = await this.sendMessage({ action: 'getAuthToken' });
            
            if (response.success) {
                this.setAuthenticated(true);
                this.loadCurrentFile();
                this.loadTagSuggestions();
            } else {
                console.log('Authentication failed:', response.error);
                this.setAuthenticated(false);
                // Don't show error if background script is just not available
                if (response.error !== 'Background script not available') {
                    this.showError('Failed to check authentication status');
                }
            }
        } catch (error) {
            console.error('Authentication check failed:', error);
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
            } else {
                this.showError(response.error || 'Authentication failed');
            }
        } catch (error) {
            console.error('Authentication failed:', error);
            this.showError('Authentication failed. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    // Set authentication UI state
    setAuthenticated(authenticated) {
        if (authenticated) {
            this.authSection.style.display = 'none';
            this.mainContent.style.display = 'block';
            this.statusIndicator.className = 'status-indicator connected';
            this.statusText.textContent = 'Connected to Google Drive';
            this.reauthBtn.style.display = 'inline-block';
        } else {
            this.authSection.style.display = 'block';
            this.mainContent.style.display = 'none';
            this.statusIndicator.className = 'status-indicator';
            this.statusText.textContent = 'Not connected';
            this.reauthBtn.style.display = 'none';
        }
    }

    // Load current file information
    async loadCurrentFile() {
        try {
            // Get current tab to extract file ID
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            const currentTab = tabs[0];
            
            if (currentTab.url && (currentTab.url.includes('drive.google.com') || 
                                  currentTab.url.includes('docs.google.com') || 
                                  currentTab.url.includes('sheets.google.com') || 
                                  currentTab.url.includes('slides.google.com'))) {
                const fileId = this.extractFileId(currentTab.url);
                if (fileId) {
                    this.currentFileId = fileId;
                    this.fileId.textContent = fileId;
                    
                    // Get file name from content script
                    chrome.tabs.sendMessage(currentTab.id, { 
                        action: 'getCurrentFileName' 
                    }, (response) => {
                        if (response && response.fileName) {
                            this.fileName.textContent = response.fileName;
                        } else {
                            this.fileName.textContent = 'File in Google Drive';
                        }
                    });
                    
                    // Load current tags
                    this.loadCurrentTags();
                } else {
                    this.fileName.textContent = 'No file selected';
                    this.fileId.textContent = '';
                }
            } else {
                this.fileName.textContent = 'Not on Google Drive';
                this.fileId.textContent = '';
            }
        } catch (error) {
            console.error('Failed to load current file:', error);
            this.showError('Failed to load current file information');
        }
    }

    // Load current tags for the selected file
    async loadCurrentTags() {
        if (!this.currentFileId) return;

        try {
            const response = await this.sendMessage({
                action: 'getFileTags',
                fileId: this.currentFileId
            });

            if (response.success) {
                this.currentTags = response.tags;
                this.renderCurrentTags();
            } else {
                this.showError('Failed to load tags');
            }
        } catch (error) {
            console.error('Failed to load current tags:', error);
            this.showError('Failed to load current tags');
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
            
            const newTags = [...this.currentTags, tagText];
            const response = await this.sendMessage({
                action: 'updateFileTags',
                fileId: this.currentFileId,
                tags: newTags
            });

            if (response.success) {
                this.currentTags = newTags;
                this.renderCurrentTags();
                this.tagInput.value = '';
                this.loadTagSuggestions();
                this.hideError(); // Clear any previous errors
            } else {
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
            const newTags = this.currentTags.filter(tag => tag !== tagToRemove);
            const response = await this.sendMessage({
                action: 'updateFileTags',
                fileId: this.currentFileId,
                tags: newTags
            });

            if (response.success) {
                this.currentTags = newTags;
                this.renderCurrentTags();
                this.loadTagSuggestions();
            } else {
                this.showError('Failed to remove tag');
            }
        } catch (error) {
            console.error('Failed to remove tag:', error);
            this.showError('Failed to remove tag');
        }
    }

    // Render current tags
    renderCurrentTags() {
        if (this.currentTags.length === 0) {
            this.currentTagsContainer.innerHTML = '<div class="no-tags">No tags yet. Add your first tag above!</div>';
            return;
        }

        this.currentTagsContainer.innerHTML = this.currentTags.map(tag => `
            <div class="tag" data-tag="${this.escapeHtml(tag)}">
                <span>${this.escapeHtml(tag)}</span>
                <button class="tag-remove" title="Remove tag">×</button>
            </div>
        `).join('');
        
        // Add event listeners to remove buttons
        this.currentTagsContainer.querySelectorAll('.tag-remove').forEach(button => {
            button.addEventListener('click', (e) => {
                const tagElement = e.target.closest('.tag');
                const tagToRemove = tagElement.getAttribute('data-tag');
                this.removeTag(tagToRemove);
            });
        });
    }

    // Load tag suggestions
    async loadTagSuggestions() {
        // For now, we'll show the current tags as suggestions
        // TODO: In Phase 2, this should load tags from all files across Drive
        const tagsToSuggest = Array.isArray(this.currentTags) ? this.currentTags : [];
        const suggestions = [...tagsToSuggest];
        
        if (suggestions.length === 0) {
            this.tagSuggestions.innerHTML = '<div class="no-suggestions">No suggestions yet. Start tagging files to see suggestions!</div>';
            return;
        }

        this.tagSuggestions.innerHTML = suggestions.map(tag => `
            <div class="suggestion-tag" data-suggestion="${this.escapeHtml(tag)}">
                ${this.escapeHtml(tag)}
            </div>
        `).join('');
        
        // Add event listeners to suggestion tags
        this.tagSuggestions.querySelectorAll('.suggestion-tag').forEach(suggestion => {
            suggestion.addEventListener('click', (e) => {
                const tagToAdd = e.target.getAttribute('data-suggestion');
                this.addSuggestionTag(tagToAdd);
            });
        });
    }

    // Add a suggestion tag
    addSuggestionTag(tag) {
        if (this.currentTags.includes(tag)) return;
        this.tagInput.value = tag;
        this.addTag();
    }

    // Select files for batch operations
    selectFiles() {
        // This would integrate with the content script to select files
        // For now, we'll show a placeholder
        this.selectedFiles.innerHTML = '<div class="no-selection">File selection will be implemented in the next phase</div>';
    }

    // Batch tag selected files
    batchTag() {
        // This would tag multiple selected files
        // For now, we'll show a placeholder
        this.showError('Batch tagging will be implemented in the next phase');
    }

    // Search tags
    async searchTags() {
        const searchTerm = this.searchInput.value.trim();
        if (!searchTerm) return;

        try {
            // This would search for files with matching tags
            // For now, we'll show a placeholder
            this.searchResults.innerHTML = '<div class="no-results">Tag search will be implemented in the next phase</div>';
        } catch (error) {
            console.error('Search failed:', error);
            this.showError('Search failed');
        }
    }

    // Handle messages from content script
    handleMessage(request, sender, sendResponse) {
        switch (request.action) {
            case 'fileSelected':
                this.currentFileId = request.fileId;
                this.fileName.textContent = request.fileName || 'Selected File';
                this.fileId.textContent = request.fileId;
                this.loadCurrentTags();
                break;
                
            case 'batchFilesSelected':
                this.selectedFiles = request.files;
                this.renderSelectedFiles();
                break;
        }
    }

    // Render selected files for batch operations
    renderSelectedFiles() {
        if (this.selectedFiles.length === 0) {
            this.selectedFiles.innerHTML = '<div class="no-selection">No files selected for batch operations</div>';
            this.batchTagBtn.disabled = true;
            return;
        }

        this.selectedFiles.innerHTML = this.selectedFiles.map(file => `
            <div class="selected-file">
                <span>${this.escapeHtml(file.name)}</span>
                <span class="file-id">${file.id}</span>
            </div>
        `).join('');
        
        this.batchTagBtn.disabled = false;
    }

    // Utility functions
    async sendMessage(message) {
        return new Promise((resolve, reject) => {
            try {
                chrome.runtime.sendMessage(message, (response) => {
                    if (chrome.runtime.lastError) {
                        console.log('Background script communication failed:', chrome.runtime.lastError.message);
                        // Return a mock response for now
                        resolve({ success: false, error: 'Background script not available' });
                    } else {
                        resolve(response);
                    }
                });
            } catch (error) {
                console.log('Failed to send message to background script:', error);
                resolve({ success: false, error: 'Background script not available' });
            }
        });
    }

    extractFileId(url) {
        const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
        return match ? match[1] : null;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showLoading() {
        this.loading.style.display = 'flex';
    }

    hideLoading() {
        this.loading.style.display = 'none';
    }

    showError(message) {
        this.errorText.textContent = message;
        this.errorMessage.style.display = 'flex';
    }

    hideError() {
        this.errorMessage.style.display = 'none';
    }
}

// Initialize the popup when the page loads
let popup;
document.addEventListener('DOMContentLoaded', () => {
    popup = new DriveTaggingPopup();
});
