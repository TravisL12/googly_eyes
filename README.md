# Googly Eyes

Based on my original CodePen https://codepen.io/TravisL12/pen/WNMLGma

<img width="448" alt="image" src="https://github.com/TravisL12/googly_eyes/assets/2141322/aac34a6b-133c-479a-84fd-95aaa903f169">

### How it works

- The Content script requests the Background script to load the face finding models.
- Once loaded an Intersection Observer is started to manage images scrolling in and out of the viewport.
- A Mutation Observer is used to update the intersection observer for any lazy loaded images.
- The intersection observer is managing when to render eyes on images, and once off screen they are not rendered anymore.
- The eyes and the image they are attached to have a shared ID value that allows them to be removed at the same time.
- Resizing the window clears everything and starts over as the positions of images likely changed and need to be recalculated.
- The eye movements are throttled to fire every 30ms for performance, this coupled with the intersection observer allows for really smooth performance.
- There's a limit of how many pair of eyes (faces) can be rendered, this value should become a setting so people can adjust as they want.
