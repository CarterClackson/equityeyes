import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import LoadingSpinner from '../UIElements/LoadingSpinner';

import "../../styles/UIElements/Form.css";
import { setAuthToken, getAuthToken } from '../../utils/cookieUtils';

const LoginForm = props => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [generalError, setGeneralError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ 
            ...formData, 
            [name]: value, 
        });

        setFormErrors({
            ...formErrors,
            [name]: '',
        });

        setFormSuccess('');
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const errors = {};
            if (!formData.name) {
                errors.name = 'Please enter your name.';
            }
            if (!formData.email) {
                errors.email = 'Please enter your email.';
            }

            const passwordMatch = new RegExp('^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&-])[A-Za-z\\d@$!%*#?&-]{8,}$');
            if (!formData.password) {
                errors.password = 'Please enter a password.';
            } else if (!passwordMatch.test(formData.password.trim())) {
                for (let i = 0; i < formData.password.trim().length; i++) {
                    console.log(`Character at position ${i}: ${formData.password.trim().charAt(i)} (Unicode: ${formData.password.trim().charCodeAt(i)})`);
                }
                console.log('Password length:', formData.password.trim().length);
                console.log('Actual password:', formData.password);
                console.log('Regex match result:', passwordMatch.test(formData.password));
                errors.password = 'Invalid password. Your chosen password must have at least 8 characters and include letters, numbers, and at least one of the following special characters: @$!%*#?&-';
            }
            if (Object.keys(errors).length > 0) {
                // Set formErrors state to display errors beneath each field
                setFormErrors(errors);
                setIsLoading(false);
                return;
        }

        try {
            const response = await fetch(backendUrl + 'user/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                setFormData({ name: '', email: '', password: '' });
                setGeneralError('');
                const data = await response.json();

                setAuthToken(data.token);

                if (getAuthToken() !== null) {
                    setTimeout(() => {
                        navigate('/dashboard');
                        setIsLoading(false);
                    }, 1000);
                } else {
                    setIsLoading(false);
                    setGeneralError('Something went wrong, please refresh the page.')
                }
            } else {
                const errorData = await response.json();
                setIsLoading(false);
                setGeneralError(errorData.error);
                console.error(errorData.error); // Handle errors
            }
        } catch (error) {
            console.log('Error during signup: ' + error);
        }
    }

    return (
        <React.Fragment>
            {formSuccess && <div className="success">{formSuccess}</div>}
            {generalError && <span className="form-error">{generalError}</span> }
            {!formSuccess && (<form onSubmit={handleSubmit} className= 'relative flex flex-col items-center max-w-md xl:w-1/4 2xl:w-1/5 mx-auto'>
                {isLoading && <LoadingSpinner asFormOverlay loadText={props.loadText} />}
                    <input 
                        type="text" 
                        name="name" 
                        placeholder="Name" 
                        className="form-input text-black w-full px-4 py-3 mt-2 rounded-full focus:border-transparent focus:ring focus:ring-emerald-700"
                        value={formData.name}
                        onChange={handleChange}
                    />
                    {formErrors.name && <div className="field-error py-2 px-5 mt-2 mb-4 bg-red-600 font-medium">{formErrors.name}</div>}
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="Email" 
                        className="form-input text-black w-full px-4 py-3 mt-2 rounded-full focus:border-transparent focus:ring focus:ring-emerald-700" 
                        value={formData.email}
                        onChange={handleChange}
                    />
                    {formErrors.email && <div className="field-error py-2 px-5 mt-2 mb-4 bg-red-600 font-medium">{formErrors.email}</div>}
                    <input 
                        type="password" 
                        name="password" 
                        placeholder="Password" 
                        className="form-input text-black w-full px-4 py-3 mt-2 rounded-full focus:border-transparent focus:ring focus:ring-emerald-700"
                        value={formData.password}
                        onChange={handleChange} 
                    />
                    {formErrors.password && <div className="field-error py-2 px-5 mt-2 mb-4 bg-red-600 font-medium">{formErrors.password}</div>}
                    <button 
                        type="submit" 
                        className="bg-emerald-900 border-2 border-emerald-900 text-white font-bold w-1/3 py-3 px-4 mt-4 rounded-full focus:border-transparent focus:ring focus:ring-white hover:bg-white hover:text-emerald-900 hover:border-emerald-900 transition-all"
                    >
                            Sign up
                    </button>
            </form> )}
        </React.Fragment>
    );
};

export default LoginForm;