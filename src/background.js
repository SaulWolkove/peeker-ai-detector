let creatingOffscreen;

// Creates or reuses offscreen document for ML model execution
async function setupOffscreenDocument() {
  const offscreenUrl = 'offscreen.html';

  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [chrome.runtime.getURL(offscreenUrl)]
  });

  if (existingContexts.length > 0) {
    return;
  }

  if (creatingOffscreen) {
    await creatingOffscreen;
  } else {
    creatingOffscreen = chrome.offscreen.createDocument({
      url: offscreenUrl,
      reasons: ['DOM_SCRAPING'],
      justification: 'Running ML model that requires DOM APIs'
    });
    await creatingOffscreen;
    creatingOffscreen = null;
  }
}

// Creates context menu item on extension install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'detectAI',
    title: 'Run Peeker AI Detection',
    contexts: ['image'],
  });
});

// Listener for messages from content script and options page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'analyzeImage' && sender.tab) {
    handleAnalyzeImageRequest(message.imageUrl)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  if (message.action === 'analyzeText' && sender.tab) {
    handleAnalyzeTextRequest(message.text)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  if (message.action === 'fetchImageAsDataUrl' && sender.tab) {
    fetchImageAsDataUrl(message.imageUrl)
      .then(dataUrl => sendResponse({ dataUrl }))
      .catch(() => sendResponse({ dataUrl: null }));
    return true;
  }
  if (message.action === 'updateIconVisibility') {
    // Broadcast visibility change to all tabs
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          action: 'setIconVisibility',
          visible: message.show
        }).catch(() => {});
      });
    });
    sendResponse({ success: true });
    return true;
  }
});

// Fetches image and converts to base64 data URL (bypasses CORS in background)
async function fetchImageAsDataUrl(imageUrl) {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Handles image analysis request by forwarding to offscreen document
async function handleAnalyzeImageRequest(imageUrl) {
  await setupOffscreenDocument();

  return new Promise((resolve) => {
    const messageHandler = (message) => {
      if (message.action === 'analysisResult') {
        chrome.runtime.onMessage.removeListener(messageHandler);
        resolve(message);
      }
    };
    chrome.runtime.onMessage.addListener(messageHandler);

    chrome.runtime.sendMessage({
      target: 'offscreen',
      action: 'analyzeImage',
      imageUrl: imageUrl
    });
  });
}

// Handles text analysis request by forwarding to offscreen document
async function handleAnalyzeTextRequest(text) {
  await setupOffscreenDocument();

  return new Promise((resolve) => {
    const messageHandler = (message) => {
      if (message.action === 'textAnalysisResult') {
        chrome.runtime.onMessage.removeListener(messageHandler);
        resolve(message);
      }
    };
    chrome.runtime.onMessage.addListener(messageHandler);

    chrome.runtime.sendMessage({
      target: 'offscreen',
      action: 'analyzeText',
      text: text
    });
  });
}

// Listener for context menu clicks (right-click on images)
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'detectAI') {
    const imageUrl = info.srcUrl;

    chrome.tabs.sendMessage(tab.id, {
      action: 'showNotification',
      data: { loading: true, type: 'image', imageUrl: imageUrl }
    });

    try {
      const result = await handleAnalyzeImageRequest(imageUrl);

      if (result.success) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'showNotification',
          data: { results: result.result, type: 'image', imageUrl: imageUrl }
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'showNotification',
        data: { error: error.message, imageUrl: imageUrl }
      });
    }
  }
});
