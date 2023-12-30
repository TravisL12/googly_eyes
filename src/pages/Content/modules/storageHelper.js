import { SETTING_VALUES } from './constants';

export const setStorage = (options) => {
  chrome.storage.sync.set(options);
};

export const getStorage = (cb) => {
  chrome.storage.sync.get(SETTING_VALUES, cb);
};
