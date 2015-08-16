(function() {
  'use strict';

  var port = chrome.extension.connect({
    name: 'trello-web-clipper'
  });

  var messageId = '$addon:token';
  var regex = /[0-9a-f]{64}/;
  var html = document.documentElement.innerHTML;

  var token = regex.exec(html)[0];

  port.onMessage.addListener(function listener(message) {
    if (message.id === messageId) {
      port.onMessage.removeListener(listener);
      window.close();
    }
  });

  port.postMessage({
    id: messageId,
    data: { token: token }
  });
}());
