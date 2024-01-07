import React from 'react';
import ReactDOM from 'react-dom/client';

import Nav from '../components/Navigation';
import LoginForm from '../components/UIElements/LoginForm';

import "../styles/Login.css";

const Login = () => {
    return (
        <React.Fragment>
            <Nav />
            <div className="inset-0 bg-black-50 text-white p-4 py-44 flex flex-col justify-center items-center h-full">
                <h1 className="text-4xl font-bold mb-10">Login to equityEyes</h1>
                <LoginForm loadText='Please wait...' isSignup={false} />
            </div>
        </React.Fragment>
    );
};

export default Login;