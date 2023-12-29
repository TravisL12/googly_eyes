import React, { useEffect, useReducer } from 'react';

import About from './About';
import './Popup.css';
import '../Content/content.styles.css';
import { getStorage, setStorage } from '../Content/modules/storageHelper';
import {
  HAS_EYELIDS,
  IS_GOOGLY_ON,
  PICTURE_LIMIT,
  PICTURE_LIMIT_SETTING,
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
};

const Popup = () => {
  const [state, dispatch] = useReducer(reducer, initState);

  useEffect(() => {
    getStorage((options) => {
      dispatch({ type: HAS_EYELIDS, value: options[HAS_EYELIDS] });
      dispatch({ type: IS_GOOGLY_ON, value: options[IS_GOOGLY_ON] });
      dispatch({
        type: PICTURE_LIMIT_SETTING,
        value: options[PICTURE_LIMIT_SETTING],
      });
    });
  }, []);

  const handleOnChange = (name, value) => {
    setStorage({ [name]: value });
    dispatch({ type: name, value: value });
  };

  return (
    <div className="GooglyOptions">
      <div className="options">
        <h1>Eye See You!</h1>
        <div className="eye-container">
          <GoogleEyes />
          <GoogleEyes />
          <GoogleEyes />
          <GoogleEyes />
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
