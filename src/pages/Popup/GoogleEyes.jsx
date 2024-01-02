import React from 'react';
import { NORMAL_EYE } from '../Content/modules/constants';
import Eye from './Eye';

const EYE_SIZE = 30;
const EYE_SPACING = EYE_SIZE * 1.2;

const GoogleEyes = ({ move, hasEyeLids, eyeType = NORMAL_EYE }) => {
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
        <Eye
          move={move}
          hasEyeLids={hasEyeLids}
          size={EYE_SIZE}
          left={0}
          type={eyeType}
        />
        <Eye
          move={move}
          hasEyeLids={hasEyeLids}
          size={EYE_SIZE}
          left={EYE_SPACING}
          type={eyeType}
        />
      </div>
    </div>
  );
};

export default GoogleEyes;
