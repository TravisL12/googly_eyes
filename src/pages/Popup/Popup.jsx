import React, { useEffect, useReducer } from 'react';

import About from './About';
import './Popup.css';
import '../Content/content.styles.css';
import { getStorage, setStorage } from '../Content/modules/storageHelper';
import {
  HAS_EYELIDS,
  PICTURE_LIMIT,
  PICTURE_LIMIT_SETTING,
} from '../Content/modules/constants';

const reducer = (state, action) => {
  if (action.type === HAS_EYELIDS) {
    return { ...state, [action.type]: action.value };
  }
  if (action.type === PICTURE_LIMIT_SETTING) {
    return { ...state, [action.type]: action.value };
  }
  return state;
};

const Popup = () => {
  const [state, dispatch] = useReducer(reducer, {
    [HAS_EYELIDS]: false,
    [PICTURE_LIMIT_SETTING]: 10,
  });

  useEffect(() => {
    getStorage((options) => {
      dispatch({ type: HAS_EYELIDS, value: options[HAS_EYELIDS] });
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
