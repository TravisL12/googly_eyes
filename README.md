# Googly Eyes

Based on my original CodePen https://codepen.io/TravisL12/pen/WNMLGma

This image
<img width="825" alt="image" src="https://github.com/TravisL12/googly_eyes/assets/2141322/9f53204e-5fe7-46c8-8ea6-cb5d2f88742f">

Becomes
<img width="824" alt="image" src="https://github.com/TravisL12/googly_eyes/assets/2141322/9a139508-63b8-47b3-ae24-02d2c54e642d">

### Data Flow

Open a page:

- content/index.js startEyes()
- background: loadModelsType()
- content/index.js create observers
- content/index.js new EyesController
  - load browser local storage

### How it works

- The Content script requests the Background script to load the face finding models.
- Once loaded an Intersection Observer is started to manage images scrolling in and out of the viewport.
- A Mutation Observer is used to update the intersection observer for any lazy loaded images.
- The intersection observer is managing when to render eyes on images, and once off screen they are not rendered anymore.
- The eyes and the image they are attached to have a shared ID value that allows them to be removed at the same time.
- Resizing the window clears everything and starts over as the positions of images likely changed and need to be recalculated.
- The eye movements are throttled to fire every 30ms for performance, this coupled with the intersection observer allows for really smooth performance.
- There's a limit of how many pair of eyes (faces) can be rendered, this value should become a setting so people can adjust as they want.

##### Built with

- https://github.com/octohedron/chrome-extension-boilerplate-react
- https://github.com/nenadmarkus/picojs
