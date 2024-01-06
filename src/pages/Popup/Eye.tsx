import React, { useEffect, useRef } from 'react';
// @ts-ignore
import { moveEye } from '../Content/modules/eyeUtilities';
import { TEye } from '../types';

type TProps = {
  move: React.MouseEvent;
  size: number;
  type: TEye;
  hasEyeLids: boolean;
};

const Eye = ({ move, size, type, hasEyeLids }: TProps) => {
  const eyeRef = useRef<Element | null>();

  const updateEye = (moveEvent: React.MouseEvent) => {
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
      // @ts-ignore
      ref={eyeRef}
      className={`eye ${type.name}`}
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
          height: type.innerSize * size,
          width: type.innerSize * size,
          background: type.innerColor,
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
