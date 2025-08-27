// Background Service Worker for Google Drive Tagging Extension
// This runs in the background and handles authentication, context menus, and message passing

// OAuth configuration
const OAUTH_CONFIG = {
  clientId: '422198538359-mthl85nqd1vgr1vfdk5itkc4gesv7bah.apps.googleusercontent.com',
  scopes: [
    'https://www.googleapis.com/auth/drive'
  ]
};

// Initialize extension when installed
chrome.runtime.onInstalled.addListener(() => {
  console.log('Google Drive Tagging Extension installed');
  
  // Test context menu API availability
  if (chrome.contextMenus) {
    console.log('Context menus API is available');
  } else {
    console.error('Context menus API is not available');
    return;
  }
  
  // Remove any existing context menus first
  chrome.contextMenus.removeAll(() => {
    console.log('Removed existing context menus');
    
    // Create context menu items - using 'link' context for file links
    chrome.contextMenus.create({
      id: 'tagFile',
      title: 'Tag File',
      contexts: ['link'],
      targetUrlPatterns: ['https://drive.google.com/file/d/*', 'https://drive.google.com/open?id=*']
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error creating tagFile context menu:', chrome.runtime.lastError);
      } else {
        console.log('Tag File context menu created successfully');
      }
    });
    
    // Create page-level context menu as fallback
    chrome.contextMenus.create({
      id: 'tagFilePage',
      title: 'Tag Current File',
      contexts: ['page'],
      documentUrlPatterns: ['https://drive.google.com/*']
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error creating tagFilePage context menu:', chrome.runtime.lastError);
      } else {
        console.log('Tag Current File context menu created successfully');
      }
    });
    
    chrome.contextMenus.create({
      id: 'batchTag',
      title: 'Batch Tag Files',
      contexts: ['selection'],
      documentUrlPatterns: ['https://drive.google.com/*']
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error creating batchTag context menu:', chrome.runtime.lastError);
      } else {
        console.log('Batch Tag context menu created successfully');
      }
    });
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log('Context menu clicked:', info.menuItemId, 'on tab:', tab.url);
  
  if (info.menuItemId === 'tagFile') {
    console.log('Tag File context menu clicked (link)');
    // Single file tagging - send message to content script to detect clicked file
    chrome.tabs.sendMessage(tab.id, {
      action: 'openTagDialogForClickedFile',
      pageUrl: tab.url,
      linkUrl: info.linkUrl
    });
  } else if (info.menuItemId === 'tagFilePage') {
    console.log('Tag Current File context menu clicked (page)');
    // Page-level file tagging
    chrome.tabs.sendMessage(tab.id, {
      action: 'openTagDialogForClickedFile',
      pageUrl: tab.url,
      linkUrl: null
    });
  } else if (info.menuItemId === 'batchTag') {
    console.log('Batch Tag context menu clicked');
    // Batch file tagging
    chrome.tabs.sendMessage(tab.id, {
      action: 'openBatchTagDialog',
      selection: info.selectionText
    });
  }
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'authenticate':
      handleAuthentication(sendResponse);
      return true; // Keep message channel open for async response
      
    case 'getAuthToken':
      getAuthToken(sendResponse);
      return true;
      
    case 'revokeAuth':
      revokeAuth(sendResponse);
      return true;
      
    case 'updateFileTags':
      updateFileTags(request.fileId, request.tags, sendResponse);
      return true;
      
    case 'getFileTags':
      getFileTags(request.fileId, sendResponse);
      return true;
      
    default:
      console.log('Unknown action:', request.action);
  }
});

// Authentication functions
async function handleAuthentication(sendResponse) {
  try {
    const token = await getAuthToken();
    sendResponse({ success: true, token });
  } catch (error) {
    console.error('Authentication failed:', error);
    
    // Provide specific guidance for testing mode
    let userMessage = error.message;
    if (error.message.includes('user did not approve')) {
      userMessage = 'Please approve the app in the OAuth consent screen. Since this is in testing mode, you need to explicitly grant access. Check your browser for a popup or redirect.';
    } else if (error.message.includes('OAuth2')) {
      userMessage = 'OAuth configuration error. Please check your Google Cloud Console setup.';
    }
    
    sendResponse({ success: false, error: userMessage });
  }
}

async function getAuthToken(sendResponse) {
  try {
    const token = await new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError) {
          console.error('Chrome identity error:', chrome.runtime.lastError);
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(token);
        }
      });
    });
    
    if (sendResponse) {
      sendResponse({ success: true, token });
    }
    return token;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    
    // Provide more helpful error messages
    let userMessage = error.message;
    if (error.message.includes('user did not approve')) {
      userMessage = 'Please approve the permissions when prompted. If you don\'t see a popup, check your browser\'s popup blocker.';
    } else if (error.message.includes('OAuth2')) {
      userMessage = 'OAuth configuration error. Please check your Google Cloud Console setup.';
    }
    
    if (sendResponse) {
      sendResponse({ success: false, error: userMessage });
    }
    throw error;
  }
}

async function revokeAuth(sendResponse) {
  try {
    await new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: false }, (token) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          // Revoke the token
          fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`)
            .then(() => {
              chrome.identity.removeCachedAuthToken({ token }, () => {
                resolve();
              });
            })
            .catch(reject);
        }
      });
    });
    
    sendResponse({ success: true });
  } catch (error) {
    console.error('Failed to revoke auth:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Google Drive API functions
async function updateFileTags(fileId, tags, sendResponse) {
  try {
    const token = await getAuthToken();
    
    // First, get the current file to check permissions
    const getResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=capabilities,permissions`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!getResponse.ok) {
      throw new Error(`Failed to get file permissions: HTTP ${getResponse.status}`);
    }
    
    const fileData = await getResponse.json();
    
    // Check if user can edit the file
    if (!fileData.capabilities?.canEdit) {
      throw new Error('You do not have permission to edit this file. Please make sure you own the file or have edit access.');
    }
    
    // Update the file with tags
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=appProperties`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        appProperties: {
          tags: JSON.stringify(tags)
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Drive API Error Response:', errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}. ${errorText}`);
    }
    
    const result = await response.json();
    sendResponse({ success: true, data: result });
  } catch (error) {
    console.error('Failed to update file tags:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function getFileTags(fileId, sendResponse) {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=appProperties`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    const tags = result.appProperties?.tags ? JSON.parse(result.appProperties.tags) : [];
    
    sendResponse({ success: true, tags });
  } catch (error) {
    console.error('Failed to get file tags:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Utility functions
function getFileIdFromUrl(url) {
  // Extract file ID from Google Drive URL
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  if (tab.url && tab.url.includes('drive.google.com')) {
    chrome.tabs.sendMessage(tab.id, { action: 'openPopup' });
  } else {
    // Open popup directly
    chrome.action.openPopup();
  }
});
