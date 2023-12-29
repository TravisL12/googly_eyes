import React from 'react';
import { NORMAL_EYE } from '../Content/modules/constants';

const EYE_SIZE = 30;
const eyeStyle = {
  height: EYE_SIZE,
  width: EYE_SIZE,
};

const innerStart = {
  top: 8,
  left: 8,
};

const EYE_SPACING = EYE_SIZE * 1.2;

const GoogleEyes = ({ eyeType = NORMAL_EYE }) => {
  return (
    <div
      className="googly-eyes"
      style={{
        height: EYE_SIZE,
        width: 2 * EYE_SIZE + (EYE_SPACING - EYE_SIZE),
        position: 'relative',
      }}
    >
      <div className="face" style={{ height: '100%', width: '100%' }}>
        <div className={`eye ${eyeType}`} style={{ ...eyeStyle, left: 0 }}>
          <div className="inner" style={innerStart}></div>
        </div>
        <div
          className={`eye ${eyeType}`}
          style={{ ...eyeStyle, left: EYE_SPACING }}
        >
          <div className="inner" style={innerStart}></div>
        </div>
      </div>
    </div>
  );
};

export default GoogleEyes;
