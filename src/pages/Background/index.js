const {
  FETCH_IMAGE,
  LOAD_FACE_MODELS,
} = require('../Content/modules/constants');

const cascadeurl = 'https://smb4.s3.us-west-2.amazonaws.com/models/facefinder';
const puplocurl = 'https://smb4.s3.us-west-2.amazonaws.com/models/puploc.bin';

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

let cascBytes;
let pupBytes;
const loadModelsType = (sendResponse) => {
  if (!!cascBytes && !!pupBytes) {
    sendResponse({ cascBytes, pupBytes });
    return;
  }

  const promise = new Promise(async (resolve) => {
    const cascadeFetch = fetch(cascadeurl);
    const pupilFetch = fetch(puplocurl);
    const [cascResp, pupResp] = await Promise.all([cascadeFetch, pupilFetch]);

    const cascReq = cascResp.arrayBuffer();
    const pupReq = pupResp.arrayBuffer();
    const [cascBuffer, pupBuffer] = await Promise.all([cascReq, pupReq]);

    cascBytes = new Int8Array(cascBuffer);
    pupBytes = new Int8Array(pupBuffer);
    resolve({ cascBytes, pupBytes });
  });

  promise.then((resp) => {
    sendResponse(resp);
  });
};

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  switch (message.type) {
    case FETCH_IMAGE: {
      loadImage(message, sendResponse);
      break;
    }
    case LOAD_FACE_MODELS: {
      loadModelsType(sendResponse);
      break;
    }

    default:
  }
  return true;
});
