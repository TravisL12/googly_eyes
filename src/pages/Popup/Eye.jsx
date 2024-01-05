import React, { useEffect, useRef } from 'react';
import { moveEye } from '../Content/modules/helper';

const Eye = ({ move, size, type, hasEyeLids }) => {
  const eyeRef = useRef();

  const updateEye = (moveEvent) => {
    if (!eyeRef?.current) {
      return;
    }

    const eye = eyeRef.current;
    const inner = eye.querySelector('.inner');
    const eyelid = eye.querySelector('.eyelid');
    moveEye({ moveEvent, eye, inner, eyelid });
  };

  useEffect(() => {
    if (move) {
      updateEye(move);
    }
  }, [move]);

  return (
    <div
      ref={eyeRef}
      className={`eye ${type}`}
      style={{
        height: size,
        width: size,
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
        <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 2 }}>
          <canvas className="eyelid" height={size} width={size}></canvas>
        </div>
      )}
    </div>
  );
};

export default Eye;
