import React from 'react';
import { NORMAL_EYE } from '../Content/modules/constants';
import Eye from './Eye';

const EYE_SIZE = 30;
const EYE_SPACING = EYE_SIZE * 1.2;

const faceStyleOverride = { height: '100%', width: '100%' };

const GoogleEyes = ({
  move,
  hasEyeLids,
  handleClick,
  isSelected,
  eyeType = NORMAL_EYE,
}) => {
  return (
    <div>
      <div
        className={isSelected ? 'googly-eyes selected-eye-type' : 'googly-eyes'}
        onClick={handleClick}
        style={{
          height: EYE_SIZE,
          width: 2 * EYE_SIZE + (EYE_SPACING - EYE_SIZE),
          position: 'relative',
        }}
      >
        <div className="face" style={faceStyleOverride}>
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
      <h4>{eyeType}</h4>
    </div>
  );
};

export default GoogleEyes;
