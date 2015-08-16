'use strict';

var isObject = function isObject(value) {
  return value === Object(value);
};

var isUndefined = function isUndefined(value) {
  return typeof value === 'undefined';
};

chrome.storage.sync.get(null, function(items) {
  if (isUndefined(items.key)) {
    items.key = 'e8b6ba838382302e68e9ad90a139bc7a';
  }

  if (isUndefined(items['desc.template'])) {
    items['desc.template'] = '[{{ title }}]({{ url }})\n\nvia Trello Web Clipper';
  }

  chrome.storage.sync.set(items);
});

chrome.extension.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(request) {
    var sendResponse = function sendResponse(data) {
      port.postMessage({
        id: request.id,
        data: data
      });
    };

    switch(request.id) {
      case '$addon:options':
      case '$addon:storage':
        var keys = request.data;
        if (isObject(keys)) {
          chrome.storage.sync.set(keys, sendResponse);
        } else {
          keys = isUndefined(keys) ? null : keys;

          chrome.storage.sync.get(keys, sendResponse);
        }
        break;
      case '$addon:manifest':
        var manifest = chrome.runtime.getManifest();

        sendResponse({
          name: manifest.name,
          title: manifest.browser_action.default_title,
          version: manifest.version
        });
        break;
      case '$addon:tabs:active':
        chrome.tabs.query({
          active: true,
          currentWindow: true
        }, function(tabs){
          var tab = tabs[0];

          sendResponse({
            title: tab.title,
            url: tab.url
          });
        });
        break;
      case '$addon:tabs:open':
        chrome.tabs.create({
          url: request.data.url,
          active: true
        }, sendResponse);
        break;
      case '$addon:token':
        if (isObject(request.data)) {
          chrome.storage.sync.set({
            token: request.data.token
          }, sendResponse);
        } else {
          chrome.storage.sync.get('token', sendResponse);
        }
        break;
    }
  });
});
