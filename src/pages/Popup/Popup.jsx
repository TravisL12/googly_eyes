import React, { useEffect, useReducer } from 'react';

import About from './About';
import './Popup.css';
import '../Content/content.styles.css';
import { getStorage, setStorage } from '../Content/modules/storageHelper';
import { HAS_EYELIDS } from '../Content/modules/constants';

const reducer = (state, action) => {
  if (action.type === HAS_EYELIDS) {
    return { ...state, [action.type]: action.value };
  }
  return state;
};

const Popup = () => {
  const [state, dispatch] = useReducer(reducer, {
    [HAS_EYELIDS]: false,
  });

  useEffect(() => {
    getStorage((options) => {
      dispatch({ type: HAS_EYELIDS, value: options[HAS_EYELIDS] });
    });
  }, []);

  const handleOnChange = (event) => {
    setStorage({ [HAS_EYELIDS]: event.target.checked });
    dispatch({ type: HAS_EYELIDS, value: event.target.checked });
  };

  return (
    <div className="GooglyOptions">
      <div className="options">
        <h1>Eye See You!</h1>
        <div>
          <label htmlFor="has-eyelids">Show Eyelids</label>
          <input
            onChange={handleOnChange}
            checked={state[HAS_EYELIDS]}
            type="checkbox"
            id="has-eyelids"
          />
        </div>
      </div>
      <About />
    </div>
  );
};

export default Popup;
