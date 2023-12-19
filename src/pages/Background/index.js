console.log('Background script');

const cascadeurl =
  'https://raw.githubusercontent.com/nenadmarkus/pico/c2e81f9d23cc11d1a612fd21e4f9de0921a5d0d9/rnt/cascades/facefinder';
const puplocurl = 'https://drone.nenadmarkus.com/data/blog-stuff/puploc.bin';

const convertBlobToBase64 = (blob) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result;
      resolve(base64data);
    };
  });

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type === 'fetch') {
    fetch(message.url)
      .then((resp) => {
        return resp.blob();
      })
      .then(async (d) => {
        const blob = await convertBlobToBase64(d);
        sendResponse({ blob });
      });
  }

  if (message.type === 'loadFaceModels') {
    const promise = new Promise(async (resolve) => {
      const cascadeFetch = fetch(cascadeurl);
      const pupilFetch = fetch(puplocurl);
      const [cascResp, pupResp] = await Promise.all([cascadeFetch, pupilFetch]);

      const cascReq = cascResp.arrayBuffer();
      const pupReq = pupResp.arrayBuffer();
      const [cascBuffer, pupBuffer] = await Promise.all([cascReq, pupReq]);

      const cascBytes = new Int8Array(cascBuffer);
      const pupBytes = new Int8Array(pupBuffer);
      resolve({ cascBytes, pupBytes });
    });

    promise.then((resp) => {
      sendResponse(resp);
    });
  }
  return true;
});
