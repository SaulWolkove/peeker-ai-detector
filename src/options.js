// Load saved settings when the options page opens
document.addEventListener('DOMContentLoaded', () => {
  const showIconToggle = document.getElementById('showIcon');
  const statusEl = document.getElementById('status');

  // Load current setting
  chrome.storage.sync.get(['showFloatingIcon'], (result) => {
    // Default to true (show icon) if not set
    showIconToggle.checked = result.showFloatingIcon !== false;
  });

  // Save setting when toggle changes
  showIconToggle.addEventListener('change', () => {
    const showIcon = showIconToggle.checked;

    chrome.storage.sync.set({ showFloatingIcon: showIcon }, () => {
      // Show saved status
      statusEl.classList.add('visible');
      setTimeout(() => {
        statusEl.classList.remove('visible');
      }, 2000);

      // Notify all tabs to update visibility
      chrome.runtime.sendMessage({
        action: 'updateIconVisibility',
        show: showIcon
      });
    });
  });
});
