import { pipeline, env } from '@xenova/transformers';

env.allowLocalModels = false;
env.useBrowserCache = true;
env.allowRemoteModels = true;

let imageClassifier = null;
let textClassifier = null;

// Loads and caches the AI image detection model
async function getImageClassifier() {
  if (!imageClassifier) {
    imageClassifier = await pipeline('image-classification', 'Organika/sdxl-detector', {
      quantized: false
    });
  }
  return imageClassifier;
}

// Loads and caches the AI text detection model
async function getTextClassifier() {
  if (!textClassifier) {
    textClassifier = await pipeline(
      'text-classification',
      'SaulWolkove/roberta-openai-detector-onnx',
      { quantized: false, revision: '862cf95079ae05b0c32a009f11da4ad3fc0bb492' }
    );
  }
  return textClassifier;
}

// Listener for messages from background script
chrome.runtime.onMessage.addListener((message) => {
  if (message.target === 'offscreen') {
    if (message.action === 'analyzeImage') {
      analyzeImage(message.imageUrl)
        .then(result => {
          chrome.runtime.sendMessage({ action: 'analysisResult', success: true, result });
        })
        .catch(error => {
          chrome.runtime.sendMessage({ action: 'analysisResult', success: false, error: error.message });
        });
    }

    if (message.action === 'analyzeText') {
      const text = message.text;

      if (typeof text !== 'string' || !text) {
        chrome.runtime.sendMessage({
          action: 'textAnalysisResult',
          success: false,
          error: `Invalid text input: ${typeof text}`
        });
        return;
      }

      analyzeText(text)
        .then(result => {
          chrome.runtime.sendMessage({ action: 'textAnalysisResult', success: true, result });
        })
        .catch(error => {
          chrome.runtime.sendMessage({ action: 'textAnalysisResult', success: false, error: error.message });
        });
    }
  }
});

// Runs image through AI detection model
async function analyzeImage(imageUrl) {
  const classifier = await getImageClassifier();
  const result = await classifier(imageUrl);
  return result;
}

// Runs text through AI detection model and maps results to Human/AI format
async function analyzeText(text) {
  const classifier = await getTextClassifier();
  const cleanText = String(text).trim();
  const result = await classifier(cleanText);

  const mappedResult = result.map(item => {
    const label = item.label.toLowerCase();
    if (label === 'real' || label === 'human') {
      return { label: 'Human', score: item.score };
    } else if (label === 'fake' || label === 'ai' || label === 'generated') {
      return { label: 'AI Generated', score: item.score };
    }
    return item;
  });

  if (mappedResult.length === 1) {
    const first = mappedResult[0];
    const inverseLabel = first.label === 'Human' ? 'AI Generated' : 'Human';
    mappedResult.push({ label: inverseLabel, score: 1 - first.score });
  }

  return mappedResult;
}
