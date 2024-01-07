import React from 'react';

import '../../styles/UIElements/LoadingSpinner.css';

const LoadingSpinner = props => {
  return (
    <React.Fragment>
      {props.asOverlay ? (
        <div className="loading-spinner__overlay flex-col">
          <div className="lds-dual-ring"></div>
          <span className="text-white font-semibold">{`${props.loadText}`}</span>
        </div>
      ) : props.asFormOverlay ? (
        <div className="form-overlay flex-col">
          <div className={`${props.FormOverlay && 'loading-spinner__formOverlay'} flex flex-col justify-center items-center`}>
            <div className="lds-dual-ring"></div>
            <span className="text-emerald-900 font-semibold">{`${props.loadText}`}</span>
          </div>
        </div>
      ) : props.asSearchOverlay ? (
      <div className="search-overlay flex-col">
        <div className={`${props.FormOverlay && 'loading-spinner__formOverlay'} flex flex-col justify-center items-center`}>
          <div className="lds-dual-ring"></div>
          <span className="text-white font-semibold">{`${props.loadText}`}</span>
        </div>
      </div>  
      ) : (
        <div className="lds-dual-ring"></div>
      )}
    </React.Fragment>
  );
};

export default LoadingSpinner;