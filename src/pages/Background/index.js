const { FETCH_IMAGE } = require('../Content/modules/constants');

const convertBlobToBase64 = (blob) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result;
      resolve(base64data);
    };
  });

const loadImage = (message, sendResponse) => {
  fetch(message.url)
    .then((resp) => {
      return resp.blob();
    })
    .then(async (d) => {
      // you have to send a base64 string back through response
      // cause Chrome is stupid and won't let you send actual objects
      const blob64 = await convertBlobToBase64(d);
      sendResponse({ blob64 });
    });
};

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  switch (message.type) {
    case FETCH_IMAGE: {
      loadImage(message, sendResponse);
      break;
    }

    default:
  }
  return true;
});
