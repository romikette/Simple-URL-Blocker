# Simple URL Blocker (Chrome Extension)

## Overview
Simple URL Blocker is a Chrome extension designed to control web access by intercepting and modifying network requests using declarative rules. It operates as a service worker-driven extension, leveraging Chrome’s `declarativeNetRequest` API to enforce domain- and route-specific blocking based on dynamically stored configurations.

The extension does not inject scripts or modify page content but instead blocks URLs at the request level, ensuring minimal performance impact. It uses `chrome.storage.local` to persist blocking rules across sessions and updates them dynamically as users modify the block list.

## Technical Architecture

### Blocking Mechanism
Blocking is achieved through `chrome.declarativeNetRequest.updateDynamicRules()`, which modifies request handling dynamically. The process follows these steps:

- User-defined blocked domains and routes are retrieved from `chrome.storage.local`.
- The service worker listens for changes and updates blocking rules dynamically.
- If a request matches a blocked pattern, it is intercepted and redirected (e.g., to Google).
- Changes apply instantly without requiring a restart.
- The extension strictly adheres to Chrome security policies by avoiding content scripts or direct DOM manipulation.

### Declarative Rule Management
The extension structures blocking rules as follows:

**Example: Blocking an entire domain**
```json
{
  "id": 1,
  "priority": 1,
  "action": { "type": "redirect", "redirect": { "url": "https://www.google.com" } },
  "condition": { "urlFilter": "*://example.com/*", "resourceTypes": ["main_frame"] }
}
```

**Example: Blocking a specific route on a domain**
```json
{
  "id": 2,
  "priority": 1,
  "action": { "type": "redirect", "redirect": { "url": "https://www.google.com" } },
  "condition": { "urlFilter": "*://example.com/*/blocked-route/*", "resourceTypes": ["main_frame"] }
}
```

Rules persist across sessions and update dynamically based on user configurations.

### Storage & Rule Synchronization
Blocking rules are managed asynchronously via the Chrome Extensions API:

**Writing blocked domains/routes to storage:**
```js
chrome.storage.local.set({ blockedRoutes: [{ domain: "example.com", route: "/blocked-route" }] });
```

**Retrieving stored block lists:**
```js
chrome.storage.local.get("blockedRoutes", (data) => { console.log(data.blockedRoutes); });
```

**Listening for configuration changes:**
```js
chrome.storage.onChanged.addListener((changes) => {
  if (changes.blockedRoutes) {
    updateBlockingRules(changes.blockedRoutes.newValue);
  }
});
```

### Service Worker Execution
The service worker manages enforcement and ensures minimal background execution to comply with Chrome’s extension policies. It:

- Loads stored blocking rules when activated.
- Monitors storage changes and updates rules in real time.
- Avoids unnecessary execution time to remain efficient.

## Privacy & Compliance
- No Remote Code Execution: The extension does not fetch or execute remote scripts.
- Local Storage Only: Block lists remain on the user’s local device.
- No Data Collection: The extension does not track or transmit browsing activity.

By providing a robust, lightweight request-filtering approach, Simple URL Blocker offers an efficient and policy-compliant way to manage restricted content in Chrome.
