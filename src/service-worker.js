/*
*
*  Push Notifications codelab
*  Copyright 2015 Google Inc. All rights reserved.
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*      https://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License
*
*/

// Version 0.1

'use strict';
/* eslint-env browser, serviceworker */

// In a service worker, self refers to the ServiceWorkerGlobalScope object: the service worker itself.
/**
By default an old service worker will stay running until all tabs that use it are closed or unloaded. A new service worker will remain in the waiting state.
When skipWaiting() is called (as in the code above) the service worker will skip the waiting state and immediately activate.
*/

// The event.waitUntil() method takes a promise and extends the lifetime of the event handler until, in this case, the promise returned by showNotification() is resolved.

// One notification will be shown for each tag value: if a new push message is received, the old notification will be replaced. To show multiple notifications, use a different tag value for each showNotification() call, or no tag at all.

console.log('Started', self);
self.addEventListener('install', function(event) {
  self.skipWaiting();
  console.log('Installed', event);
});
self.addEventListener('activate', function(event) {
  console.log('Activated', event);
});

self.addEventListener('push', function(event) {
  console.log('Received push', event);
  let notificationTitle = 'Hello';
  const notificationOptions = {
    body: 'Nouveau message',
    icon: './images/logo-192x192.png',
    badge: './images/icon-72x72.png',
    tag: 'push demo notification'
  };


  event.waitUntil(
    Promise.all([
      self.registration.showNotification(notificationTitle, notificationOptions)
    ])
  );
});

/**
This code listens for a notification click, then opens a web page.

This code checks all window clients for this service worker: if the requested URL is already open in a tab, focus on it — otherwise open a new tab for it.

*/
self.addEventListener('notificationclick', function(event) {
  console.log('Notification click: tag ', event.notification.tag);
  event.notification.close();
  const url = 'http://localhost:8081';
  event.waitUntil(
  clients.matchAll({
    type: 'window'
  })
  .then(function(windowClients) {
    for (let i = 0; i < windowClients.length; i++) {
      let client = windowClients[i];
	  console.log("client "+client.url);
      if (client.url == url || 'focus' in client) {
        return client.focus();
      }
    }
    if (clients.openWindow) {
      return clients.openWindow(url);
    }
  })
  );
});

/**
NOTE: Android doesn’t close the notification when you click it.
That’s why we need event.notification.close();.
*/

self.addEventListener('notificationclose', function(event) {
  // event.waitUntil(
    // Promise.all([
      // self.analytics.trackEvent('notification-close')
    // ])
  // );
	event.notification.close();
	console.log("notification close");
});
