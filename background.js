function updateBlockingRules(blockedRoutes) {
  if (!chrome.declarativeNetRequest || !chrome.declarativeNetRequest.updateDynamicRules) {
    console.error("chrome.declarativeNetRequest API is unavailable. Check permissions and manifest.");
    return;
  }

  const rules = blockedRoutes.map((entry, index) => {
    const { domain, route } = entry;

    return {
      id: index + 1,
      priority: 1,
      action: { type: "redirect", redirect: { url: "https://www.google.com" } },
      condition: {
        urlFilter: `*://${domain}/*${route}*`,
        resourceTypes: ["main_frame"]
      }
    };
  });

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: blockedRoutes.map((_, index) => index + 1),
    addRules: rules
  }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error updating rules:", chrome.runtime.lastError);
    } else {
      console.log("Blocking rules updated successfully.");
    }
  });
}

chrome.storage.local.get("blockedRoutes", (data) => {
  const blockedRoutes = data.blockedRoutes || [];
  updateBlockingRules(blockedRoutes);
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.blockedRoutes) {
    updateBlockingRules(changes.blockedRoutes.newValue);
  }
});