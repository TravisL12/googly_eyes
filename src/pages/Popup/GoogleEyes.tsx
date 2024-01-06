import React from 'react';
import { TEye } from '../types';
import Eye from './Eye';

const EYE_SIZE = 30;

type TProps = {
  move: React.MouseEvent;
  hasEyeLids: boolean;
  handleClick: () => void;
  isSelected: boolean;
  eyeType: TEye;
};

const titleCase = (text: string) => text[0].toUpperCase() + text.slice(1);
const GoogleEyes = ({
  move,
  hasEyeLids,
  handleClick,
  isSelected,
  eyeType,
}: TProps) => {
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
            type={eyeType}
          />
          <Eye
            move={move}
            hasEyeLids={hasEyeLids}
            size={EYE_SIZE}
            type={eyeType}
          />
        </div>
      </div>
      <h4 className="eye-type-title">{titleCase(eyeType.name)}</h4>
    </div>
  );
};

export default GoogleEyes;
