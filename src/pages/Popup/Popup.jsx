import React, { useEffect, useReducer, useState } from 'react';

import About from './About';
import './Popup.css';
import '../Content/content.styles.css';
import { getStorage, setStorage } from '../Content/modules/storageHelper';
import {
  BLUE_EYE,
  GLAM_EYE,
  STONED_EYE,
  SLEEPY_EYE,
  DROOPY_EYE,
  CAT_EYE,
  HAS_EYELIDS,
  IS_GOOGLY_ON,
  PICTURE_LIMIT,
  PICTURE_LIMIT_SETTING,
  EYE_TYPE_IDX,
  EYE_TYPES,
  RANDOM_EYE,
} from '../Content/modules/constants';
import GoogleEyes from './GoogleEyes';

const reducer = (state, action) => {
  if (!!action.type) {
    return { ...state, [action.type]: action.value };
  }
  return state;
};

const initState = {
  [HAS_EYELIDS]: false,
  [PICTURE_LIMIT_SETTING]: 10,
  [IS_GOOGLY_ON]: true,
  [EYE_TYPE_IDX]: 0,
};

const Popup = () => {
  const [move, setMove] = useState();
  const [state, dispatch] = useReducer(reducer, initState);

  useEffect(() => {
    getStorage((options) => {
      dispatch({ type: HAS_EYELIDS, value: options[HAS_EYELIDS] });
      dispatch({ type: IS_GOOGLY_ON, value: options[IS_GOOGLY_ON] });
      dispatch({
        type: PICTURE_LIMIT_SETTING,
        value: options[PICTURE_LIMIT_SETTING],
      });
      dispatch({
        type: EYE_TYPE_IDX,
        value: options[EYE_TYPE_IDX],
      });
    });
  }, []);

  const handleOnChange = (name, value) => {
    setStorage({ [name]: value });
    dispatch({ type: name, value: value });
  };

  return (
    <div
      className="GooglyOptions"
      onMouseMove={(event) => {
        setMove(event);
      }}
    >
      <div className="options">
        <h1 className="title">Eye See You!</h1>
        <div className="eye-container">
          {EYE_TYPES.map((type, idx) => {
            return (
              <GoogleEyes
                key={type.name}
                handleClick={() => {
                  handleOnChange(EYE_TYPE_IDX, idx);
                }}
                isSelected={idx === state[EYE_TYPE_IDX]}
                move={move}
                hasEyeLids={state[HAS_EYELIDS]}
                eyeType={type}
              />
            );
          })}
          <GoogleEyes
            handleClick={() => {
              handleOnChange(EYE_TYPE_IDX, EYE_TYPES.length);
            }}
            isSelected={state[EYE_TYPE_IDX] === EYE_TYPES.length}
            move={move}
            hasEyeLids={state[HAS_EYELIDS]}
            eyeType={RANDOM_EYE}
          />
        </div>
        <div>
          <label htmlFor="is-googly-on">Enable Googly Eyes</label>
          <input
            onChange={(event) => {
              handleOnChange(IS_GOOGLY_ON, event.target.checked);
            }}
            checked={state[IS_GOOGLY_ON]}
            type="checkbox"
            id="is-googly-on"
          />
        </div>
        <div>
          <label htmlFor="has-eyelids">Show Eyelids</label>
          <input
            onChange={(event) => {
              handleOnChange(HAS_EYELIDS, event.target.checked);
            }}
            checked={state[HAS_EYELIDS]}
            type="checkbox"
            id="has-eyelids"
          />
        </div>
        <div>
          <label htmlFor="eye-count">Max Faces with Eyes</label>
          <input
            type="range"
            id="eye-count"
            name="eye-count"
            value={state[PICTURE_LIMIT_SETTING]}
            min="1"
            max={PICTURE_LIMIT}
            onChange={(event) => {
              handleOnChange(PICTURE_LIMIT_SETTING, +event.target.value);
            }}
          />
          <span>{state[PICTURE_LIMIT_SETTING]}</span>
        </div>
      </div>
      <About />
    </div>
  );
};

export default Popup;
