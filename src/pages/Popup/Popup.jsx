import React from 'react';

import About from './About';
import './Popup.css';
import '../Content/content.styles.css';

const Popup = () => {
  return (
    <div className="GooglyOptions">
      <div className="options">
        <h1>Eye See You!</h1>
        <div>
          <label htmlFor="has-eyelids">Show Eyelids</label>
          <input type="checkbox" id="has-eyelids" />
        </div>
      </div>
      <About />
    </div>
  );
};

export default Popup;
