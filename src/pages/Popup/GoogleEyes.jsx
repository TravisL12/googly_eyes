import React, { useEffect, useRef } from 'react';
import { NORMAL_EYE } from '../Content/modules/constants';
import { randomizer, stripPixels } from '../Content/modules/helper';

const EYE_SIZE = 30;
const eyeStyle = {
  height: EYE_SIZE,
  width: EYE_SIZE,
};

const innerStart = {
  top: 8,
  left: 8,
  transition: '0.5s linear top, 0.5s linear left',
};

const EYE_SPACING = EYE_SIZE * 1.2;

const GoogleEyes = ({ eyeType = NORMAL_EYE }) => {
  const leftEyeRef = useRef();
  const rightEyeRef = useRef();

  useEffect(() => {
    const interval = setInterval(() => {
      const leftMove =
        (stripPixels(leftEyeRef.current.style.left) || 0) + randomizer(3);
      const topMove =
        (stripPixels(leftEyeRef.current.style.top) || 0) + randomizer(3);

      leftEyeRef.current.style.left = `${leftMove % 12}px`;
      rightEyeRef.current.style.left = `${leftMove % 12}px`;

      leftEyeRef.current.style.top = `${topMove % 12}px`;
      rightEyeRef.current.style.top = `${topMove % 12}px`;
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, []);

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
          <div ref={leftEyeRef} className="inner" style={innerStart}></div>
        </div>
        <div
          className={`eye ${eyeType}`}
          style={{ ...eyeStyle, left: EYE_SPACING }}
        >
          <div ref={rightEyeRef} className="inner" style={innerStart}></div>
        </div>
      </div>
    </div>
  );
};

export default GoogleEyes;
