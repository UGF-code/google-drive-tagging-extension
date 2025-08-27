// Google Drive API Utility Functions
// This module provides a clean interface for Drive API operations

class DriveAPI {
    constructor() {
        this.baseUrl = 'https://www.googleapis.com/drive/v3';
        this.uploadUrl = 'https://www.googleapis.com/upload/drive/v3';
    }

    // Get authentication token
    async getAuthToken() {
        return new Promise((resolve, reject) => {
            chrome.identity.getAuthToken({ interactive: true }, (token) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve(token);
                }
            });
        });
    }

    // Make authenticated request to Drive API
    async makeRequest(endpoint, options = {}) {
        const token = await this.getAuthToken();
        
        const defaultOptions = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        const requestOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        const response = await fetch(`${this.baseUrl}${endpoint}`, requestOptions);
        
        if (!response.ok) {
            throw new Error(`Drive API Error: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    // Get file metadata
    async getFile(fileId, fields = 'id,name,appProperties') {
        return this.makeRequest(`/files/${fileId}?fields=${fields}`);
    }

    // Update file metadata
    async updateFile(fileId, updates, fields = 'id,name,appProperties') {
        return this.makeRequest(`/files/${fileId}?fields=${fields}`, {
            method: 'PATCH',
            body: JSON.stringify(updates)
        });
    }

    // Get file tags from appProperties
    async getFileTags(fileId) {
        try {
            const file = await this.getFile(fileId, 'appProperties');
            const tags = file.appProperties?.tags;
            return tags ? JSON.parse(tags) : [];
        } catch (error) {
            console.error('Failed to get file tags:', error);
            return [];
        }
    }

    // Update file tags in appProperties
    async updateFileTags(fileId, tags) {
        try {
            const updates = {
                appProperties: {
                    tags: JSON.stringify(tags)
                }
            };

            const result = await this.updateFile(fileId, updates);
            return { success: true, data: result };
        } catch (error) {
            console.error('Failed to update file tags:', error);
            return { success: false, error: error.message };
        }
    }

    // Search files by tags
    async searchFilesByTags(tags, operator = 'AND') {
        try {
            // Build query for files with specific tags
            const tagQueries = tags.map(tag => 
                `appProperties has { key='tags' and value='${this.escapeQueryValue(tag)}' }`
            );

            const query = operator === 'AND' 
                ? tagQueries.join(' and ')
                : tagQueries.join(' or ');

            const response = await this.makeRequest(
                `/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,appProperties)`
            );

            return response.files || [];
        } catch (error) {
            console.error('Failed to search files by tags:', error);
            return [];
        }
    }

    // Get all files with tags
    async getAllTaggedFiles() {
        try {
            const response = await this.makeRequest(
                `/files?q=appProperties has { key='tags' }&fields=files(id,name,mimeType,appProperties)`
            );

            return response.files || [];
        } catch (error) {
            console.error('Failed to get tagged files:', error);
            return [];
        }
    }

    // Get all unique tags from all files
    async getAllTags() {
        try {
            const files = await this.getAllTaggedFiles();
            const allTags = new Set();

            files.forEach(file => {
                const tags = file.appProperties?.tags;
                if (tags) {
                    try {
                        const parsedTags = JSON.parse(tags);
                        parsedTags.forEach(tag => allTags.add(tag));
                    } catch (e) {
                        console.error('Failed to parse tags for file:', file.id);
                    }
                }
            });

            return Array.from(allTags).sort();
        } catch (error) {
            console.error('Failed to get all tags:', error);
            return [];
        }
    }

    // Batch update multiple files with tags
    async batchUpdateTags(fileUpdates) {
        try {
            const promises = fileUpdates.map(({ fileId, tags }) => 
                this.updateFileTags(fileId, tags)
            );

            const results = await Promise.allSettled(promises);
            
            return results.map((result, index) => ({
                fileId: fileUpdates[index].fileId,
                success: result.status === 'fulfilled' && result.value.success,
                error: result.status === 'rejected' ? result.reason.message : result.value.error
            }));
        } catch (error) {
            console.error('Failed to batch update tags:', error);
            return fileUpdates.map(({ fileId }) => ({
                fileId,
                success: false,
                error: error.message
            }));
        }
    }

    // Export tags data
    async exportTagsData() {
        try {
            const files = await this.getAllTaggedFiles();
            const exportData = {
                exportDate: new Date().toISOString(),
                totalFiles: files.length,
                files: files.map(file => ({
                    id: file.id,
                    name: file.name,
                    mimeType: file.mimeType,
                    tags: file.appProperties?.tags ? JSON.parse(file.appProperties.tags) : []
                }))
            };

            return exportData;
        } catch (error) {
            console.error('Failed to export tags data:', error);
            throw error;
        }
    }

    // Import tags data
    async importTagsData(importData) {
        try {
            const fileUpdates = importData.files.map(file => ({
                fileId: file.id,
                tags: file.tags || []
            }));

            return await this.batchUpdateTags(fileUpdates);
        } catch (error) {
            console.error('Failed to import tags data:', error);
            throw error;
        }
    }

    // Utility function to escape query values
    escapeQueryValue(value) {
        return value.replace(/'/g, "\\'").replace(/"/g, '\\"');
    }

    // Check if user has permission to modify file
    async checkFilePermissions(fileId) {
        try {
            const file = await this.getFile(fileId, 'permissions,capabilities');
            
            // Check if user can edit the file
            const canEdit = file.capabilities?.canEdit || false;
            
            // Check if user owns the file
            const isOwner = file.permissions?.some(p => 
                p.role === 'owner' && p.type === 'user'
            ) || false;

            return {
                canEdit,
                isOwner,
                canTag: canEdit || isOwner
            };
        } catch (error) {
            console.error('Failed to check file permissions:', error);
            return {
                canEdit: false,
                isOwner: false,
                canTag: false
            };
        }
    }

    // Get file statistics
    async getFileStats(fileId) {
        try {
            const file = await this.getFile(fileId, 'size,modifiedTime,createdTime,lastModifyingUser');
            
            return {
                size: file.size,
                modifiedTime: file.modifiedTime,
                createdTime: file.createdTime,
                lastModifyingUser: file.lastModifyingUser
            };
        } catch (error) {
            console.error('Failed to get file stats:', error);
            return null;
        }
    }
}

// Export the DriveAPI class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DriveAPI;
} else {
    window.DriveAPI = DriveAPI;
}
