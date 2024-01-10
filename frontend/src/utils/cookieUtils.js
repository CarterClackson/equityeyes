import Cookies from 'js-cookie';

const COOKIE_NAMES = {
	AUTH_TOKEN: 'authToken',
	CLIENT_ID: 'clientID',
};

const setAuthToken = (token, expirationDays = 7) => {
	Cookies.set(COOKIE_NAMES.AUTH_TOKEN, token, { expires: expirationDays });
};

const getAuthToken = () => {
	const token = Cookies.get(COOKIE_NAMES.AUTH_TOKEN);
	return token || null;
};

const removeAuthToken = () => {
	Cookies.remove(COOKIE_NAMES.AUTH_TOKEN);
};

export { setAuthToken, getAuthToken, removeAuthToken };
