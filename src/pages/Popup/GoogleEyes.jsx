import React from 'react';

const EYE_SIZE = 30;
const eyeStyle = {
  height: EYE_SIZE,
  width: EYE_SIZE,
};

const EYE_SPACING = EYE_SIZE * 1.2;

const GoogleEyes = () => {
  return (
    <div
      className="googly-eyes"
      style={{
        height: EYE_SIZE,
        width: 2 * EYE_SIZE + EYE_SPACING,
        position: 'relative',
      }}
    >
      <div className="face" style={{ height: '100%', width: '100%' }}>
        <div className="eye" style={{ ...eyeStyle, left: 0 }}>
          <div className="inner"></div>
        </div>
        <div className="eye" style={{ ...eyeStyle, left: EYE_SPACING }}>
          <div className="inner"></div>
        </div>
      </div>
    </div>
  );
};

export default GoogleEyes;
