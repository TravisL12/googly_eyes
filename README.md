# Googly Eyes

## [Eye See You - Chrome Extension](https://chromewebstore.google.com/detail/eye-see-you/meggkmlcgnjmlfflpfgolmfdaehoclia)

Based on my original CodePen https://codepen.io/TravisL12/pen/WNMLGma

This image
<img width="825" alt="image" src="https://github.com/TravisL12/googly_eyes/assets/2141322/9f53204e-5fe7-46c8-8ea6-cb5d2f88742f">

Becomes
<img width="824" alt="image" src="https://github.com/TravisL12/googly_eyes/assets/2141322/9a139508-63b8-47b3-ae24-02d2c54e642d">

### Data Flow

Open a page:

- content/index.js startEyes()
- content/index.js loadFaceApiModels() — load the face-api.js models from the bundled `models/` weights
- content/index.js create observers
- content/index.js new EyesController
  - load browser local storage

Per image detected on screen:

- eyeUtilities.js getFace() asks the Background script to fetch the image and return it as base64 (avoids CORS-tainted canvases)
- the image is drawn to a natural-size canvas and passed to face-api.js
- TinyFaceDetector finds face boxes, the tiny 68-point landmark model locates each eye, and those points are mapped into the eye positions the renderer uses

### How it works

- Face detection runs entirely in the content script via [face-api.js](https://github.com/justadudewhohacks/face-api.js) (TinyFaceDetector + tiny 68-point landmarks). The library is injected ahead of the content bundle and the model weights ship in `src/models/`.
- The Background script's only job is proxying image fetches to base64 so cross-origin images can be read off a canvas.
- An Intersection Observer manages images scrolling in and out of the viewport; eyes are only rendered while an image is on screen.
- A Mutation Observer updates the intersection observer for any lazy loaded images.
- The eyes and the image they are attached to have a shared ID value that allows them to be removed at the same time.
- Resizing the window clears everything and starts over as the positions of images likely changed and need to be recalculated.
- The eye movements are throttled to fire every 30ms for performance, this coupled with the intersection observer allows for really smooth performance.
- There's a limit of how many pair of eyes (faces) can be rendered, this value should become a setting so people can adjust as they want.

##### Built with

- https://github.com/octohedron/chrome-extension-boilerplate-react
- https://github.com/justadudewhohacks/face-api.js
