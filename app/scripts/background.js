'use strict';

var isObject = function isObject(value) {
  return value === Object(value);
};

var isString = function isString(value) {
  return typeof value === 'string';
};

var isUndefined = function isUndefined(value) {
  return typeof value === 'undefined';
};

chrome.extension.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(request) {
    function sendResponse(data) {
      port.postMessage({
        id: request.id,
        data: data
      });
    }

    switch(request.id) {
      case '$addon:storage':
        var keys = request.data;

        if (isObject(keys)) {
          chrome.storage.sync.set(keys);
        }

        if (isUndefined(keys)) {
          keys = null;
        }

        chrome.storage.sync.get(keys, sendResponse);
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
        if (isString(request.data)) {
          chrome.storage.sync.set({
            token: request.data
          });
        }

        chrome.storage.sync.get('token', function (items) {
          sendResponse(items.token);
        });

        break;
    }
  });
});
