import React from 'react';
import { NORMAL_EYE } from '../Content/modules/constants';
import Eye from './Eye';

const EYE_SIZE = 30;

const titleCase = (text) => text[0].toUpperCase() + text.slice(1);
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
        style={{ height: EYE_SIZE }}
      >
        <div className="face">
          <Eye
            move={move}
            hasEyeLids={hasEyeLids}
            size={EYE_SIZE}
            type={eyeType.name}
          />
          <Eye
            move={move}
            hasEyeLids={hasEyeLids}
            size={EYE_SIZE}
            type={eyeType.name}
          />
        </div>
      </div>
      <h4 className="eye-type-title">{titleCase(eyeType.name)}</h4>
    </div>
  );
};

export default GoogleEyes;
