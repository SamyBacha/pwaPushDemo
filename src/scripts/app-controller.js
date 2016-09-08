/* global PushClient, EncryptionHelperFactory, MaterialComponentsSnippets */
/* eslint-env browser */

class AppController {
  constructor() {
    // Define a different server URL here if desire.
    this._PUSH_SERVER_URL = '';
    this._API_KEY = 'AIzaSyBCb3Lah6CR0A4qj_joxM1ABrWYfXRyAoU';
	
    this._applicationKeys = {
      publicKey: window.base64UrlToUint8Array(
        'BDd3_hVL9fZi9Ybo2UUzA284WG5FZR30_95YeZJsiA' +
        'pwXKpNcF1rRPF3foIiBHXRdJI2Qhumhf6_LFTeZaNndIo'),
      privateKey: window.base64UrlToUint8Array(
        'xKZKYRNdFFn8iQIF2MH54KTfUHwH105zBdzMR7SI3xI')
    };

    this._sendPushOptions = document.querySelector('.js-send-push-options');


    // Below this comment is code to initialise a material design lite view.
    const toggleSwitch = document.querySelector('.js-push-toggle-switch');
    if (toggleSwitch.classList.contains('is-upgraded')) {
      this.ready = Promise.resolve();
      this._uiInitialised(toggleSwitch.MaterialSwitch);
    } else {
      this.ready = new Promise(resolve => {
        const mdlUpgradeCb = () => {
          if (!toggleSwitch.classList.contains('is-upgraded')) {
            return;
          }

          this._uiInitialised(toggleSwitch.MaterialSwitch);
          document.removeEventListener(mdlUpgradeCb);

          resolve();
        };

        // This is to wait for MDL initialising
        document.addEventListener('mdl-componentupgraded', mdlUpgradeCb);
      });
    }
  }

  _uiInitialised(toggleSwitch) {
    this._stateChangeListener = this._stateChangeListener.bind(this);
    this._subscriptionUpdate = this._subscriptionUpdate.bind(this);

    this._toggleSwitch = toggleSwitch;
    this._pushClient = new PushClient(
      this._stateChangeListener,
      this._subscriptionUpdate,
      this._applicationKeys.publicKey	  
    );

    document.querySelector('.js-push-toggle-switch > input')
      .addEventListener('click', event => {
          // Inverted because clicking will change the checked state by
          // the time we get here
          if (event.target.checked) {
            this._pushClient.subscribeDevice().then(() => {
                console.log("end subscribeDevice");
                // Vapid support
                const vapidPromise = EncryptionHelperFactory.createVapidAuthHeader(
                  this._applicationKeys,
                  this._currentSubscription.endpoint,
                  'mailto:samy.bacha@devoteam.com');

                return Promise.all([
                    vapidPromise
                  ])
                  .then(results => {
                    const vapidHeaders = results[0];

                    let infoFunction = this.getGCMInfo;
                    infoFunction = () => {
                      return this.getGCMInfo(this._currentSubscription,
                        vapidHeaders);
                    };
                  

                    const requestInfo = infoFunction();

                    this.sendRequestToProxyServer(requestInfo);
                  });
            });
		  }
          else {
            this._pushClient.unsubscribeDevice();
			console.log('unsubscribe from server');
			sendToBack(idSubcribe, '/unsubscribe/');
          }
        });

        const sendPushViaXHRButton = document.querySelector('.js-send-push-button');

        sendPushViaXHRButton.addEventListener('click', () => {
          console.log('callGcm');
          // if (this._currentSubscription) {
            sendToBack(null, '/callGcm/');
          // }
        });

        // allow snippets to be copied via click
        new MaterialComponentsSnippets().init();
      }

    registerServiceWorker() {
      // Check that service workers are supported
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js')
          .catch(err => {
            this.showErrorMessage(
              'Unable to Register SW',
              'Sorry this demo requires a service worker to work and it ' +
              'failed to install - sorry :('
            );
            console.error(err);
          });
      } else {
        this.showErrorMessage(
          'Service Worker Not Supported',
          'Sorry this demo requires service worker support in your browser. ' +
          'Please try this demo in Chrome or Firefox Nightly.'
        );
      }
    }

    _stateChangeListener(state, data) {
      if (typeof state.interactive !== 'undefined') {
        if (state.interactive) {
          this._toggleSwitch.enable();
        } else {
          this._toggleSwitch.disable();
        }
      }

      if (typeof state.pushEnabled !== 'undefined') {
        if (state.pushEnabled) {
          this._toggleSwitch.on();
        } else {
          this._toggleSwitch.off();
        }
      }

      switch (state.id) {
        case 'UNSUPPORTED':
          this.showErrorMessage(
            'Push Not Supported',
            data
          );
          break;
        case 'ERROR':
          this.showErrorMessage(
            'Ooops a Problem Occurred',
            data
          );
          break;
        default:
          break;
      }
    }

    _subscriptionUpdate(subscription) {
      this._currentSubscription = subscription;
      if (!subscription) {
        return;
      }

      const subscriptionObject = JSON.parse(JSON.stringify(subscription));

    }


    getGCMInfo(subscription, vapidHeaders) {
      const headers = {};
      headers.TTL = 60;
      headers.endpoint = subscription.endpoint;

      if (vapidHeaders) {
        headers.Authorization = `${vapidHeaders.bearer}`;

        if (headers['Crypto-Key']) {
          headers['Crypto-Key'] = `${headers['Crypto-Key']}; ` +
            `p256ecdsa=${vapidHeaders.p256ecdsa}`;
        } else {
          headers['Crypto-Key'] = `p256ecdsa=${vapidHeaders.p256ecdsa}`;
        }
      }

      const response = {
        headers: headers
      };

      return response;
    }

    sendRequestToProxyServer(requestInfo) {
      const fetchOptions = {
        method: 'post'
      };


      fetchOptions.body = JSON.stringify(requestInfo);
      console.log('Sending XHR Proxy Server', JSON.stringify(requestInfo.headers));
      sendToBack(JSON.stringify(requestInfo.headers), '/subscribe/');

    }

    toBase64(arrayBuffer, start, end) {
      start = start || 0;
      end = end || arrayBuffer.byteLength;

      const partialBuffer = new Uint8Array(arrayBuffer.slice(start, end));
      return btoa(String.fromCharCode.apply(null, partialBuffer));
    }

    showErrorMessage(title, message) {
      const errorContainer = document
        .querySelector('.js-error-message-container');

      const titleElement = errorContainer.querySelector('.js-error-title');
      const messageElement = errorContainer.querySelector('.js-error-message');
      titleElement.textContent = title;
      messageElement.innerHTML = message;
      errorContainer.style.opacity = 1;

      
    }
  }

  if (window) {
    window.AppController = AppController;
  }