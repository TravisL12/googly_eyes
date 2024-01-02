import React, { useEffect, useRef } from 'react';
import { EYELID_MAX_PERC } from '../Content/modules/constants';
import { moveEye } from '../Content/modules/helper';

const Eye = ({ move, size, left, type, hasEyeLids }) => {
  const eyeRef = useRef();

  const updateEye = (moveEvent) => {
    if (!eyeRef?.current) {
      return;
    }

    const eye = eyeRef.current;
    const inner = eye.querySelector('.inner');
    const lidOpen = eye.querySelector('.eye-lid-open');
    moveEye({ moveEvent, eye, inner, lidOpen });
  };

  useEffect(() => {
    if (move) {
      updateEye(move);
    }
  }, [move]);

  const eyeLidStyle = {
    height: `${EYELID_MAX_PERC - 1}%`,
    borderRadius: `${size}px ${size}px 0 0`,
  };

  return (
    <div
      ref={eyeRef}
      className={`eye ${type}`}
      style={{
        height: size,
        width: size,
        left,
      }}
    >
      <div
        className="inner"
        style={{
          top: size / 4,
          left: size / 4,
        }}
      ></div>
      {hasEyeLids && (
        <>
          <div className="eye-lid" style={eyeLidStyle}></div>
          <div className="eye-lid-open" style={eyeLidStyle}></div>
        </>
      )}
    </div>
  );
};

export default Eye;
