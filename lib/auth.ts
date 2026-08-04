export const TOKEN_KEY = 'token';

export function getToken() {
  if (typeof window === 'undefined') return null;

  return localStorage.getItem(TOKEN_KEY);
}

export function setLoginData(token: string, username: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem('username', username);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('username');
}

export function isLoggedIn() {
  return !!getToken();
}   