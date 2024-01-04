import React from 'react';

import '../../styles/UIElements/LoadingSpinner.css';

const LoadingSpinner = props => {
  return (
    <React.Fragment>
      {props.asOverlay ? (
        <div className="loading-spinner__overlay">
          <div className="lds-dual-ring"></div>
        </div>
      ) : props.asFormOverlay ? ( // Corrected typo from "asFormOverLay" to "asFormOverlay"
        <div className="form-overlay">
          <div className={`${props.FormOverlay && 'loading-spinner__formOverlay'}`}>
            <div className="lds-dual-ring"></div>
          </div>
        </div>
      ) : (
        <div className="lds-dual-ring"></div>
      )}
    </React.Fragment>
  );
};

export default LoadingSpinner;
