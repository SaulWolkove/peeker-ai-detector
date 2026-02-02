let firstImageRun = true;
let firstTextRun = true;
let panelOpen = false;
let lastAnalysisType = null;
let lastAnalyzedContent = null;
let lastPrediction = null;
let iconVisible = true;

const AWS_API_URL = 'https://7f8txofny1.execute-api.us-east-1.amazonaws.com/feedback';

// Creates the floating detector icon and panel UI
function createFloatingIcon() {
  if (document.getElementById('ai-detector-container')) return;
  const container = document.createElement('div');
  container.id = 'ai-detector-container';
  container.innerHTML = `
    <style>
      #ai-detector-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 2147483646;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      #ai-detector-icon {
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        transition: transform 0.2s, box-shadow 0.2s;
        user-select: none;
      }
      #ai-detector-icon:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
      }
      #ai-detector-icon svg {
        width: 28px;
        height: 28px;
        fill: white;
        pointer-events: none;
      }
      #ai-detector-panel {
        display: none;
        position: absolute;
        bottom: 60px;
        right: 0;
        width: 300px;
        background: #1a1a2e;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        overflow: hidden;
        animation: slideUp 0.2s ease;
        max-height: 500px;
        overflow-y: auto;
      }
      #ai-detector-panel .panel-title {
        height: 40px;
        width: auto;
        display: block;
      }
      #ai-detector-panel.open {
        display: block;
      }
      @keyframes slideUp {
        from { transform: translateY(10px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      #ai-detector-panel .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 16px;
        background: #252542;
        border-bottom: 1px solid #333;
      }
      #ai-detector-panel .panel-title {
        font-weight: 600;
        font-size: 14px;
        color: #fff;
      }
      #ai-detector-panel .panel-close {
        background: none;
        border: none;
        color: #666;
        cursor: pointer;
        font-size: 20px;
        padding: 0;
        line-height: 1;
        transition: color 0.2s;
      }
      #ai-detector-panel .panel-close:hover {
        color: #fff;
      }
      #ai-detector-dropzone {
        padding: 20px;
        text-align: center;
        border: 2px dashed #444;
        margin: 16px;
        border-radius: 8px;
        transition: all 0.2s;
        color: #888;
        font-size: 13px;
        min-height: 80px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      #ai-detector-dropzone.drag-over {
        border-color: #667eea;
        background: rgba(102, 126, 234, 0.1);
        color: #667eea;
      }
      #ai-detector-dropzone.has-image {
        padding: 10px;
        border-style: solid;
        border-color: #444;
      }
      #ai-detector-dropzone .drop-icon {
        width: 40px;
        height: 40px;
        fill: #555;
        margin-bottom: 10px;
        transition: fill 0.2s;
      }
      #ai-detector-dropzone.drag-over .drop-icon {
        fill: #667eea;
      }
      #ai-detector-dropzone .preview-image {
        max-width: 100%;
        max-height: 120px;
        border-radius: 6px;
        object-fit: contain;
      }
      #ai-detector-dropzone .drop-text {
        display: block;
      }
      #ai-detector-dropzone.has-image .drop-text,
      #ai-detector-dropzone.has-image .drop-icon {
        display: none;
      }
      #ai-detector-upload-btn, #ai-detector-analyze-text-btn {
        display: block;
        width: calc(100% - 32px);
        margin: 0 16px 12px;
        padding: 10px;
        background: #333;
        border: none;
        border-radius: 6px;
        color: #fff;
        font-size: 13px;
        cursor: pointer;
        transition: background 0.2s;
      }
      #ai-detector-upload-btn:hover, #ai-detector-analyze-text-btn:hover {
        background: #444;
      }
      #ai-detector-analyze-text-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        margin-bottom: 16px;
      }
      #ai-detector-analyze-text-btn:hover {
        opacity: 0.9;
      }
      #ai-detector-file-input {
        display: none;
      }
      .section-divider {
        display: flex;
        align-items: center;
        margin: 8px 16px;
        color: #555;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .section-divider::before,
      .section-divider::after {
        content: '';
        flex: 1;
        height: 1px;
        background: #333;
      }
      .section-divider span {
        padding: 0 10px;
      }
      #ai-detector-textarea {
        width: calc(100% - 32px);
        margin: 0 16px 12px;
        padding: 12px;
        background: #252542;
        border: 1px solid #333;
        border-radius: 6px;
        color: #fff;
        font-size: 13px;
        font-family: inherit;
        resize: vertical;
        min-height: 80px;
        max-height: 150px;
        box-sizing: border-box;
      }
      #ai-detector-textarea::placeholder {
        color: #666;
      }
      #ai-detector-textarea:focus {
        outline: none;
        border-color: #667eea;
      }
      #ai-detector-results {
        padding: 0 16px 16px;
        display: none;
      }
      #ai-detector-results.visible {
        display: block;
      }
      .result-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid #333;
        color: #fff;
      }
      .result-row:last-child {
        border-bottom: none;
      }
      .result-label {
        font-weight: 500;
        font-size: 14px;
      }
      .result-score {
        font-weight: 700;
        font-size: 16px;
      }
      .result-score.human {
        color: #4ade80;
      }
      .result-score.ai {
        color: #f87171;
      }
      .loading-text {
        color: #888;
        font-size: 13px;
        text-align: center;
        padding: 10px 0;
      }
      .error-text {
        color: #f87171;
        font-size: 13px;
        text-align: center;
        padding: 10px 0;
      }
      #ai-detector-continue-btn {
        display: none;
        width: calc(100% - 32px);
        margin: 0 16px 16px;
        padding: 10px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        border-radius: 6px;
        color: #fff;
        font-size: 13px;
        cursor: pointer;
        transition: opacity 0.2s;
      }
      #ai-detector-continue-btn:hover {
        opacity: 0.9;
      }
      #ai-detector-continue-btn.visible {
        display: block;
      }
      .analysis-options.hidden {
        display: none !important;
      }
      .image-section.hidden {
        display: none !important;
      }
      .loading-spinner {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 2px solid rgba(102, 126, 234, 0.3);
        border-radius: 50%;
        border-top-color: #667eea;
        animation: spin 0.8s linear infinite;
        margin-right: 8px;
        vertical-align: middle;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      .loading-text {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
      }
      .loading-text small {
        width: 100%;
        margin-top: 8px;
        opacity: 0.7;
      }
      .feedback-link {
        display: block;
        text-align: center;
        padding: 6px;
        color: #666;
        font-size: 10px;
        text-decoration: none;
        transition: color 0.2s;
        border-top: 1px solid #333;
        margin-top: 8px;
      }
      .feedback-link:hover {
        color: #667eea;
      }
      .feedback-prompt {
        text-align: center;
        color: #888;
        font-size: 12px;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #333;
      }
      .feedback-buttons {
        display: flex;
        gap: 8px;
        margin-top: 8px;
      }
      .feedback-btn {
        flex: 1;
        padding: 8px 12px;
        border: none;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
      .feedback-btn.correct {
        background: rgba(74, 222, 128, 0.15);
        color: #4ade80;
        border: 1px solid rgba(74, 222, 128, 0.3);
      }
      .feedback-btn.correct:hover {
        background: rgba(74, 222, 128, 0.25);
      }
      .feedback-btn.incorrect {
        background: rgba(248, 113, 113, 0.15);
        color: #f87171;
        border: 1px solid rgba(248, 113, 113, 0.3);
      }
      .feedback-btn.incorrect:hover {
        background: rgba(248, 113, 113, 0.25);
      }
      .feedback-btn.selected {
        opacity: 1;
        transform: scale(1.02);
      }
      .feedback-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .feedback-thanks {
        text-align: center;
        color: #888;
        font-size: 11px;
        margin-top: 8px;
      }
    </style>

    <div id="ai-detector-panel">
      <div class="panel-header">
        <img class="panel-title" id="peeker-logo" alt="Peeker AI Detector" />
        <button class="panel-close">×</button>
      </div>

      <div id="ai-detector-dropzone" class="image-section">
        <svg class="drop-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V8h-3V5H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8h-3zM5 19l3-4 2 3 3-4 4 5H5z"/>
        </svg>
        <span class="drop-text">Drag & drop an image here</span>
      </div>
      <button id="ai-detector-upload-btn" class="analysis-options image-section">Upload image from computer</button>
      <input type="file" id="ai-detector-file-input" accept="image/*">

      <div class="section-divider analysis-options"><span>or analyze text</span></div>

      <textarea id="ai-detector-textarea" class="analysis-options" placeholder="Paste text here to check if it's AI-generated..."></textarea>
      <button id="ai-detector-analyze-text-btn" class="analysis-options">Analyze Text</button>

      <div id="ai-detector-results"></div>
      <button id="ai-detector-continue-btn">Continue</button>

      <a href="#" id="ai-detector-feedback" class="feedback-link">Report an issue</a>
    </div>

    <div id="ai-detector-icon">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
      </svg>
    </div>
  `;

  document.body.appendChild(container);

  const icon = container.querySelector('#ai-detector-icon');
  const panel = container.querySelector('#ai-detector-panel');
  const closeBtn = container.querySelector('.panel-close');
  const dropzone = container.querySelector('#ai-detector-dropzone');
  const uploadBtn = container.querySelector('#ai-detector-upload-btn');
  const fileInput = container.querySelector('#ai-detector-file-input');
  const textarea = container.querySelector('#ai-detector-textarea');
  const analyzeTextBtn = container.querySelector('#ai-detector-analyze-text-btn');
  const logo = container.querySelector('#peeker-logo');
  logo.src = chrome.runtime.getURL('icons/peeker.png');
  const continueBtn = container.querySelector('#ai-detector-continue-btn');

  // Toggle panel visibility on icon click
  icon.addEventListener('click', () => {
    panelOpen = !panelOpen;
    panel.classList.toggle('open', panelOpen);
  });

  // Close panel button handler
  closeBtn.addEventListener('click', () => {
    panelOpen = false;
    panel.classList.remove('open');
    // Hide icon again if setting is disabled
    if (!iconVisible) {
      container.style.display = 'none';
    }
  });

  // Upload button opens file picker
  uploadBtn.addEventListener('click', () => {
    fileInput.click();
  });

  // File input change handler for image upload
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const dataUrl = await fileToDataUrl(file);
      showImagePreview(dataUrl);
      analyzeImage(dataUrl);
    }
    fileInput.value = '';
  });

  // Analyze text button handler
  analyzeTextBtn.addEventListener('click', () => {
    const text = textarea.value.trim();
    if (!text) {
      showResults({ error: 'Please enter some text to analyze' });
      return;
    }
    analyzeText(text);
  });

  // Continue button resets panel for new analysis
  continueBtn.addEventListener('click', () => {
    const results = container.querySelector('#ai-detector-results');
    const analysisOptions = container.querySelectorAll('.analysis-options');
    const imageSections = container.querySelectorAll('.image-section');

    results.classList.remove('visible');
    results.innerHTML = '';
    continueBtn.classList.remove('visible');

    analysisOptions.forEach(el => el.classList.remove('hidden'));
    imageSections.forEach(el => el.classList.remove('hidden'));

    const previewImg = dropzone.querySelector('.preview-image');
    if (previewImg) previewImg.remove();
    dropzone.classList.remove('has-image');

    textarea.value = '';
    lastAnalysisType = null;
  });

  // Feedback link opens feedback page
  const feedbackBtn = container.querySelector('#ai-detector-feedback');
  feedbackBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const feedbackUrl = chrome.runtime.getURL('feedback.html') + '?url=' + encodeURIComponent(window.location.href);
    window.open(feedbackUrl, '_blank');
  });

  const dragOptions = { capture: true };

  // Drag enter handler
  dropzone.addEventListener('dragenter', (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }, dragOptions);

  // Drag over handler
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    dropzone.classList.add('drag-over');
  }, dragOptions);

  // Drag leave handler
  dropzone.addEventListener('dragleave', (e) => {
    e.stopPropagation();
    dropzone.classList.remove('drag-over');
  }, dragOptions);

  // Drop handler for image drag and drop
  dropzone.addEventListener('drop', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    dropzone.classList.remove('drag-over');

    let imageUrl = null;

    const html = e.dataTransfer.getData('text/html');
    if (html) {
      const match = html.match(/src="([^"]+)"/);
      if (match) {
        imageUrl = match[1];
      }
    }

    if (!imageUrl) {
      const text = e.dataTransfer.getData('text/plain');
      if (text && (text.startsWith('http') || text.startsWith('data:'))) {
        imageUrl = text;
      }
    }

    if (!imageUrl && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        imageUrl = await fileToDataUrl(file);
      }
    }

    if (imageUrl) {
      showImagePreview(imageUrl);
      analyzeImage(imageUrl);
    } else {
      showResults({ error: 'Could not get image URL' });
    }
  }, dragOptions);
}

// Displays image preview in the dropzone
function showImagePreview(imageUrl) {
  const dropzone = document.querySelector('#ai-detector-dropzone');
  if (!dropzone) return;

  const existingImg = dropzone.querySelector('.preview-image');
  if (existingImg) {
    existingImg.remove();
  }

  const img = document.createElement('img');
  img.className = 'preview-image';
  img.src = imageUrl;
  dropzone.appendChild(img);
  dropzone.classList.add('has-image');
}

// Converts a File object to a data URL
function fileToDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

// Displays analysis results, loading state, or errors in the panel
function showResults(data) {
  const results = document.querySelector('#ai-detector-results');
  const continueBtn = document.querySelector('#ai-detector-continue-btn');
  const analysisOptions = document.querySelectorAll('.analysis-options');
  const imageSections = document.querySelectorAll('.image-section');
  if (!results) return;

  if (data.type) {
    lastAnalysisType = data.type;
  }

  results.classList.add('visible');

  if (data.loading) {
    let loadingMsg = '';
    if (data.type === 'text') {
      loadingMsg = firstTextRun
        ? '<span class="loading-spinner"></span>Loading AI text model...<small>First run may take a while to download the model</small>'
        : '<span class="loading-spinner"></span>Analyzing text...';
    } else {
      loadingMsg = firstImageRun
        ? '<span class="loading-spinner"></span>Loading AI image model...<small>First run may take a while to download the model</small>'
        : '<span class="loading-spinner"></span>Analyzing image...';
    }
    results.innerHTML = `<div class="loading-text">${loadingMsg}</div>`;
  } else if (data.error) {
    results.innerHTML = `<div class="error-text">Error: ${data.error}</div>`;
  } else if (data.results) {
    if (lastAnalysisType === 'text') {
      firstTextRun = false;
    } else {
      firstImageRun = false;
    }

    analysisOptions.forEach(el => el.classList.add('hidden'));

    if (lastAnalysisType === 'text') {
      imageSections.forEach(el => el.classList.add('hidden'));
    }

    if (continueBtn) continueBtn.classList.add('visible');

    const topResult = data.results.reduce((a, b) => a.score > b.score ? a : b);
    const label = topResult.label.toLowerCase();
    const score = (topResult.score * 100).toFixed(1);
    const isHuman = label === 'human' || label === 'real';
    const displayLabel = isHuman ? 'Human' : 'AI Generated';
    const scoreClass = isHuman ? 'human' : 'ai';

    let html = `
      <div class="result-row">
        <span class="result-label">${displayLabel}</span>
        <span class="result-score ${scoreClass}">${score}%</span>
      </div>
      <div class="feedback-prompt">Help train our model - was this correct?</div>
      <div class="feedback-buttons" id="ai-detector-feedback-buttons">
        <button class="feedback-btn correct" data-feedback="correct">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          Correct
        </button>
        <button class="feedback-btn incorrect" data-feedback="incorrect">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          Incorrect
        </button>
      </div>
      <div class="feedback-thanks" id="ai-detector-feedback-thanks" style="display: none;">Thanks for your feedback!</div>
    `;
    results.innerHTML = html;

    setupFeedbackButtons(data.results, lastAnalysisType);
  }
}

// Sends image to background script for AI analysis
async function analyzeImage(imageUrl) {
  showResults({ loading: true, type: 'image' });
  lastAnalyzedContent = imageUrl;

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'analyzeImage',
      imageUrl: imageUrl
    });

    if (response && response.success) {
      lastPrediction = response.result;
      showResults({ results: response.result });
    } else {
      showResults({ error: response?.error || 'Analysis failed' });
    }
  } catch (error) {
    showResults({ error: error.message });
  }
}

// Sends text to background script for AI analysis
async function analyzeText(text) {
  showResults({ loading: true, type: 'text' });
  lastAnalyzedContent = text;

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'analyzeText',
      text: text
    });

    if (response && response.success) {
      lastPrediction = response.result;
      showResults({ results: response.result });
    } else {
      showResults({ error: response?.error || 'Analysis failed' });
    }
  } catch (error) {
    showResults({ error: error.message });
  }
}

// Listener for messages from background script (context menu triggers and settings)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'showNotification') {
    // Show the icon if it's hidden when using context menu
    const container = document.getElementById('ai-detector-container');
    if (container) {
      container.style.display = 'block';
    }
    const panel = document.querySelector('#ai-detector-panel');
    if (panel) {
      panel.classList.add('open');
      panelOpen = true;
    }
    if (message.data.imageUrl) {
      showImagePreview(message.data.imageUrl);
      lastAnalyzedContent = message.data.imageUrl;
    }
    showResults(message.data);
    sendResponse({ success: true });
  }
  if (message.action === 'setIconVisibility') {
    setIconVisibility(message.visible);
    sendResponse({ success: true });
  }
  return true;
});

// Sets up click handlers for feedback buttons (Correct/Incorrect)
function setupFeedbackButtons(results, analysisType) {
  const buttons = document.querySelectorAll('.feedback-btn');
  const thanksMsg = document.getElementById('ai-detector-feedback-thanks');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const feedback = btn.dataset.feedback;

      buttons.forEach(b => b.disabled = true);
      btn.classList.add('selected');

      if (thanksMsg) {
        thanksMsg.style.display = 'block';
      }

      sendFeedbackToAWS({
        content: lastAnalyzedContent,
        analysisType: analysisType,
        prediction: results,
        userFeedback: feedback,
        url: window.location.href
      });
    });
  });
}

// Sends user feedback and analysis data to AWS Lambda
async function sendFeedbackToAWS(data) {
  try {
    let imageData = null;
    if (data.analysisType === 'image' && data.content) {
      imageData = await getImageAsDataUrl(data.content);
    }

    const payload = {
      analysisType: data.analysisType,
      content: data.analysisType === 'text' ? data.content : null,
      imageData: imageData,
      prediction: data.prediction,
      userFeedback: data.userFeedback,
      sourceUrl: data.url
    };

    const response = await fetch(AWS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      return;
    }

    await response.json();
  } catch (error) {
    // Silently fail
  }
}

// Fetches image via background script and converts to base64 data URL (bypasses CORS)
async function getImageAsDataUrl(imageUrl) {
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }

  return new Promise((resolve) => {
    chrome.runtime.sendMessage({
      action: 'fetchImageAsDataUrl',
      imageUrl: imageUrl
    }, (response) => {
      if (response && response.dataUrl) {
        resolve(response.dataUrl);
      } else {
        resolve(null);
      }
    });
  });
}

// Shows or hides the floating icon container
function setIconVisibility(visible) {
  iconVisible = visible;
  const container = document.getElementById('ai-detector-container');
  if (container) {
    container.style.display = visible ? 'block' : 'none';
    // Close panel when hiding
    if (!visible) {
      const panel = container.querySelector('#ai-detector-panel');
      if (panel) {
        panel.classList.remove('open');
        panelOpen = false;
      }
    }
  }
}

// Initialize extension with visibility setting
function initExtension() {
  chrome.storage.sync.get(['showFloatingIcon'], (result) => {
    // Default to true (show icon) if not set
    const shouldShow = result.showFloatingIcon !== false;
    iconVisible = shouldShow;

    createFloatingIcon();

    if (!shouldShow) {
      setIconVisibility(false);
    }
  });
}

// Listen for storage changes to update visibility in real-time
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.showFloatingIcon) {
    setIconVisibility(changes.showFloatingIcon.newValue !== false);
  }
});

initExtension();
