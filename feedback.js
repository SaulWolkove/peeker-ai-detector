// Feedback page script

const form = document.getElementById('feedback-form');
const cancelBtn = document.getElementById('cancel-btn');
const successMessage = document.getElementById('success-message');

// GitHub repo URL - update this to your actual repo
const GITHUB_REPO = 'SaulWolkove/peeker-ai-detector';

// Get URL parameters (page URL passed from content script)
const urlParams = new URLSearchParams(window.location.search);
const sourceUrl = urlParams.get('url') || 'Not provided';

// Cancel button closes the tab
cancelBtn.addEventListener('click', () => {
  window.close();
});

// Form submission
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const issueType = document.getElementById('issue-type').value;
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const email = document.getElementById('email').value;

  // Build issue title
  const issueTitle = `[${issueType.toUpperCase()}] ${title}`;

  // Build issue body
  let issueBody = `## Description\n${description}\n\n`;

  if (email) {
    issueBody += `## Contact\n${email}\n\n`;
  }

  issueBody += `## Environment\n`;
  issueBody += `- **Browser:** ${navigator.userAgent}\n`;
  issueBody += `- **Page URL:** ${sourceUrl}\n`;
  issueBody += `- **Extension Version:** 1.0.0\n`;

  // Build GitHub issue URL
  const githubUrl = `https://github.com/${GITHUB_REPO}/issues/new?` +
    `title=${encodeURIComponent(issueTitle)}` +
    `&body=${encodeURIComponent(issueBody)}` +
    `&labels=${encodeURIComponent(issueType)}`;

  // Open GitHub in new tab
  window.open(githubUrl, '_blank');

  // Show success message
  form.style.display = 'none';
  successMessage.style.display = 'block';

  // Close this tab after a delay
  setTimeout(() => {
    window.close();
  }, 2000);
});
