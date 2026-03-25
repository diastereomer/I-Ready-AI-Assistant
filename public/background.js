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
