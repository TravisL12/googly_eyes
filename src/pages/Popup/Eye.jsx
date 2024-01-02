import React, { useEffect, useRef } from 'react';
import { moveEye } from '../Content/modules/helper';

const innerStart = {
  top: 8,
  left: 8,
};

const Eye = ({ move, size, left, type }) => {
  const eyeRef = useRef();
  const innerEyeRef = useRef();

  const updateEye = (moveEvent) => {
    if (!eyeRef?.current || !innerEyeRef?.current) {
      return;
    }

    const eye = eyeRef.current;
    const inner = innerEyeRef.current;
    moveEye({ moveEvent, eye, inner });
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
        left,
      }}
    >
      <div ref={innerEyeRef} className="inner" style={innerStart}></div>
    </div>
  );
};

export default Eye;
