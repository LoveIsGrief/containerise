import State from '../State/index.js';
import HostStorage from '../Storage/HostStorage.js';
import PreferenceStorage from '../Storage/PreferenceStorage.js';
import Tabs from '../Tabs/index.js';
import {qs, qsAll} from '../utils.js';
import {showLoader, hideLoader} from './loader.js';
import {showToast} from './toast.js';
import {cleanHostInput} from '../utils.js';

const addButton = qs('.add-button');
const saveButton = qs('.save-button');
const umMaps = qs('.url-maps-list');
const umItem = qs('.url-map-item');

class URLMaps {

  constructor(state) {
    this.state = state;
    State.addListener(this.update.bind(this));
    addButton.addEventListener('click', this.addItem.bind(this, ''));
    saveButton.addEventListener('click', this.saveUrlMaps.bind(this));
    this.render();
    this.itemsCount = 0;
  }

  update(newState) {
    this.state = newState;
    this.render();
  }

  render() {
    showLoader();
    if(!this.state.urlMaps || !this.state.selectedIdentity) {
      return false;
    }

    umMaps.innerHTML = '';
    this.itemsCount = 0;

    for (const key in this.state.urlMaps) {
      const urlMap = this.state.urlMaps[key];
      if (this.state.selectedIdentity.cookieStoreId === urlMap.cookieStoreId) {
        this.addItem(urlMap.host);
      }
    }

    hideLoader();
  }

  async addItem(host) {
    const item = umItem.cloneNode(true);
    item.setAttribute('data-id', String(this.itemsCount));
    item.classList.remove('template');
    if(!host){
      // Fallback to hostname of current tab
      try {
        let currentTab = (await Tabs.query({
          active: true,
          windowId: browser.windows.WINDOW_ID_CURRENT,
        }))[0];
        host = new URL(currentTab.url).hostname;
      } catch (e) {
        // console.warn("Error while guessing hostname of active tab", e);
      }
    }
    let urlInput = qs('.url-input', item);
    urlInput.setAttribute('old-host', host);
    urlInput.value = host;
    qs('.remove-button', item).addEventListener('click', this.removeUrlMap.bind(this, this.itemsCount, host));
    umMaps.appendChild(item);
    this.itemsCount++;
  }

  removeUrlMap(rowId, host) {
    umMaps.removeChild(qs(`[data-id='${String(rowId)}']`));
    HostStorage.remove(host);
  }

  async saveUrlMaps() {
    showLoader();
    const items = qsAll('.url-map-item');
    const maps = {};
    let hostsToRemove = [];

    const caseSensitiveMatch = PreferenceStorage.get('caseSensitiveMatch', true);

    for (const item of items) {
      const urlInput = qs('.url-input', item);
      const host = cleanHostInput(urlInput && urlInput.value, caseSensitiveMatch);

      if (host) {
        // Get rid of old hosts
        const oldHost = urlInput.getAttribute('old-host');
        if (oldHost !== host) {
          hostsToRemove.push(oldHost);
        }
        maps[host] = {
          host: host,
          containerName: this.state.selectedIdentity.name,
          cookieStoreId: this.state.selectedIdentity.cookieStoreId,
          enabled: true,
        };
      }
    }

    const promises = hostsToRemove
        .map(oldHost => HostStorage.remove(oldHost))
        .concat([
          HostStorage.setAll(maps),
        ]);
    await Promise.all(promises);
    hideLoader();
    showToast('Saved!', 3000);
  }

}

export default new URLMaps({
  urlMaps: State.get('urlMaps'),
  selectedIdentity: State.get('selectedIdentity'),
});
