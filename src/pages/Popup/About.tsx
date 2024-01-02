import React from 'react';

const manifestData = chrome.runtime.getManifest();
const version = `v${manifestData.version}`;

const About = () => {
  return (
    <div className="about">
      <p>
        By The Trav <span id="version">{version}</span>
      </p>
      <ul>
        <li>
          <a target="_blank" href="https://www.redundantrobot.com">
            RedundantRobot
          </a>
        </li>
        <li>
          <a target="_blank" href="https://github.com/TravisL12/googly_eyes/">
            Github
          </a>
        </li>
        <li>
          <a target="_blank" href="https://codepen.io/TravisL12/pen/WNMLGma">
            CodePen
          </a>
        </li>
      </ul>
    </div>
  );
};

export default About;
