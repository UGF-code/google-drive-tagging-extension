// Background Service Worker for Google Drive Tagging Extension
// Clean Architecture: Central controller for all Google Drive operations

// OAuth configuration
const OAUTH_CONFIG = {
  clientId: '422198538359-mthl85nqd1vgr1vfdk5itkc4gesv7bah.apps.googleusercontent.com',
  scopes: [
    'https://www.googleapis.com/auth/drive'
  ]
};

// Message types for clean communication
const MESSAGE_TYPES = {
  GET_TAGS: 'getTags',
  ADD_TAG: 'addTag',
  REMOVE_TAG: 'removeTag',
  UPDATE_TAGS: 'updateTags',
  CHECK_AUTH: 'checkAuth',
  AUTHENTICATE: 'authenticate',
  REVOKE_AUTH: 'revokeAuth'
};

// Initialize extension when installed
chrome.runtime.onInstalled.addListener(() => {
  console.log('Google Drive Tagging Extension installed - Clean Architecture');
  createContextMenus();
});

// Create context menus
function createContextMenus() {
  if (!chrome.contextMenus) {
    console.error('Context menus API is not available');
    return;
  }
  
  console.log('Creating context menus...');
  
  // Remove existing menus first
  chrome.contextMenus.removeAll(() => {
    // Create context menu items
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
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log('Context menu clicked:', info.menuItemId, 'on tab:', tab.url);
  
  if (info.menuItemId === 'tagFile') {
    console.log('Tag File context menu clicked (link)');
    chrome.tabs.sendMessage(tab.id, {
      action: 'openTagDialogForClickedFile',
      pageUrl: tab.url,
      linkUrl: info.linkUrl
    });
  } else if (info.menuItemId === 'tagFilePage') {
    console.log('Tag Current File context menu clicked (page)');
    chrome.tabs.sendMessage(tab.id, {
      action: 'openTagDialogForClickedFile',
      pageUrl: tab.url,
      linkUrl: null
    });
  } else if (info.menuItemId === 'batchTag') {
    console.log('Batch Tag context menu clicked');
    chrome.tabs.sendMessage(tab.id, {
      action: 'openBatchTagDialog',
      selection: info.selectionText
    });
  }
});

// Central message handler - receives requests from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request.action, 'from:', sender.id);
  
  // Validate message format
  if (!request.action) {
    sendResponse({ success: false, error: 'Missing action parameter' });
    return;
  }
  
  // Route to appropriate handler
  switch (request.action) {
    case MESSAGE_TYPES.CHECK_AUTH:
    case 'getAuthToken': // Backward compatibility
      handleCheckAuth(sendResponse);
      break;
      
    case MESSAGE_TYPES.AUTHENTICATE:
    case 'authenticate': // Backward compatibility
      handleAuthentication(sendResponse);
      break;
      
    case MESSAGE_TYPES.REVOKE_AUTH:
    case 'revokeAuth': // Backward compatibility
      handleRevokeAuth(sendResponse);
      break;
      
    case MESSAGE_TYPES.GET_TAGS:
    case 'getFileTags': // Backward compatibility
      handleGetTags(request.fileId, sendResponse);
      break;
      
    case MESSAGE_TYPES.ADD_TAG:
    case 'addTagToFile': // Backward compatibility
      handleAddTag(request.fileId, request.tag, sendResponse);
      break;
      
    case MESSAGE_TYPES.REMOVE_TAG:
    case 'removeTagFromFile': // Backward compatibility
      handleRemoveTag(request.fileId, request.tag, sendResponse);
      break;
      
    case MESSAGE_TYPES.UPDATE_TAGS:
    case 'updateFileTags': // Backward compatibility
      handleUpdateTags(request.fileId, request.tags, sendResponse);
      break;
      
    default:
      console.log('Unknown action:', request.action);
      sendResponse({ success: false, error: `Unknown action: ${request.action}` });
  }
  
  return true; // Keep message channel open for async response
});

// Authentication handlers
async function handleCheckAuth(sendResponse) {
  try {
    const token = await getAuthToken(false); // Non-interactive
    sendResponse({ success: true, authenticated: !!token });
  } catch (error) {
    console.log('Auth check failed:', error.message);
    sendResponse({ success: true, authenticated: false });
  }
}

async function handleAuthentication(sendResponse) {
  try {
    const token = await getAuthToken(true); // Interactive
    sendResponse({ success: true, token });
  } catch (error) {
    console.error('Authentication failed:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleRevokeAuth(sendResponse) {
  try {
    await revokeAuth();
    sendResponse({ success: true });
  } catch (error) {
    console.error('Failed to revoke auth:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Tag operation handlers
async function handleGetTags(fileId, sendResponse) {
  try {
    if (!fileId) {
      throw new Error('File ID is required');
    }
    
    const tags = await getFileTags(fileId);
    sendResponse({ success: true, data: tags });
  } catch (error) {
    console.error('Failed to get tags:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleAddTag(fileId, tag, sendResponse) {
  try {
    if (!fileId || !tag) {
      throw new Error('File ID and tag are required');
    }
    
    const currentTags = await getFileTags(fileId);
    const newTags = [...new Set([...currentTags, tag])]; // Remove duplicates
    await updateFileTags(fileId, newTags);
    
    sendResponse({ success: true, data: newTags });
  } catch (error) {
    console.error('Failed to add tag:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleRemoveTag(fileId, tag, sendResponse) {
  try {
    if (!fileId || !tag) {
      throw new Error('File ID and tag are required');
    }
    
    const currentTags = await getFileTags(fileId);
    const newTags = currentTags.filter(t => t !== tag);
    await updateFileTags(fileId, newTags);
    
    sendResponse({ success: true, data: newTags });
  } catch (error) {
    console.error('Failed to remove tag:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleUpdateTags(fileId, tags, sendResponse) {
  try {
    if (!fileId) {
      throw new Error('File ID is required');
    }
    
    const newTags = Array.isArray(tags) ? tags : [];
    await updateFileTags(fileId, newTags);
    
    sendResponse({ success: true, data: newTags });
  } catch (error) {
    console.error('Failed to update tags:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Core Google Drive API functions
async function getAuthToken(interactive = true) {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive }, (token) => {
      if (chrome.runtime.lastError) {
        console.error('Chrome identity error:', chrome.runtime.lastError);
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(token);
      }
    });
  });
}

async function revokeAuth() {
  const token = await getAuthToken(false);
  if (token) {
    await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`);
    await new Promise((resolve) => {
      chrome.identity.removeCachedAuthToken({ token }, resolve);
    });
  }
}

async function getFileTags(fileId) {
  const token = await getAuthToken(false);
  
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=appProperties`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get file tags: HTTP ${response.status}`);
  }
  
  const result = await response.json();
  return result.appProperties?.tags ? JSON.parse(result.appProperties.tags) : [];
}

async function updateFileTags(fileId, tags) {
  const token = await getAuthToken(false);
  
  // First, check file permissions
  const getResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=capabilities`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!getResponse.ok) {
    throw new Error(`Failed to get file permissions: HTTP ${getResponse.status}`);
  }
  
  const fileData = await getResponse.json();
  
  if (!fileData.capabilities?.canEdit) {
    throw new Error('You do not have permission to edit this file');
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
    throw new Error(`Failed to update file tags: HTTP ${response.status}. ${errorText}`);
  }
  
  return await response.json();
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
    chrome.action.openPopup();
  }
});

console.log('Background script loaded - Clean Architecture ready');
