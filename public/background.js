chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!tab.url) return;

  const isIReady = tab.url.includes("i-ready.com");

  chrome.sidePanel.setOptions({
    tabId,
    path: "index.html",
    enabled: isIReady,
  });

  if (isIReady && changeInfo.status === "complete") {
    chrome.sidePanel.open({ tabId });
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "captureTab") {
    chrome.tabs
      .captureVisibleTab(null, { format: "jpeg", quality: 85 })
      .then((dataUrl) => sendResponse({ success: true, dataUrl }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }
});
