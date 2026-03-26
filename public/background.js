chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "captureTab") {
    chrome.tabs.captureVisibleTab({ format: "jpeg", quality: 85 })
      .then((dataUrl) => sendResponse({ success: true, dataUrl }))
      .catch((err) => {
        console.error("captureVisibleTab error:", err);
        sendResponse({ success: false, error: String(err?.message || err) });
      });
    return true;
  }
});
