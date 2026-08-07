// Small fetch wrapper for talking to the backend + local session persistence.
// Centralized here so every component hits the same base URL and auth header logic.

const BASE_URL = 'http://localhost:5000/api';

const SESSION_KEY = 'nattilalert_session'; // { token, user }

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(token, user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ token, user }));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const session = getSession();
    if (session?.token) headers['Authorization'] = `Bearer ${session.token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // no JSON body
  }

  if (!res.ok) {
    const message = data?.message || data?.error || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

// Backend returns { name, ... }. Existing components (IncidentReport, Helplines)
// were written against a `fullName` field, so we alias it here to avoid touching
// every component that already reads user?.fullName.
export function normalizeUser(user) {
  if (!user) return user;
  return { ...user, fullName: user.name };
}

// ---- Auth ----
export const registerUser = (payload) => request('/auth/register', { method: 'POST', body: payload });
export const loginUser = (payload) => request('/auth/login', { method: 'POST', body: payload });

// ---- Profile / Settings ----
export const fetchMe = () => request('/user/me', { auth: true });
export const updateMe = (payload) => request('/user/me', { method: 'PUT', body: payload, auth: true });

// ---- Role requests ----
export const requestRoleChange = (requestedRole) =>
  request('/user/request-role', { method: 'POST', body: { requestedRole }, auth: true });
export const fetchPendingRequests = () => request('/user/pending-requests', { auth: true });
export const approveRequest = (userId) => request(`/user/approve/${userId}`, { method: 'POST', auth: true });
export const rejectRequest = (userId, reason) =>
  request(`/user/reject/${userId}`, { method: 'POST', body: { reason }, auth: true });

// ---- Hazards ----
export const fetchHazards = () => request('/hazards');
export const createHazardReport = (payload) => request('/hazards', { method: 'POST', body: payload, auth: true });

// ---- Shelters ----
export const fetchShelters = () => request('/shelters');
export const createShelterEntry = (payload) => request('/shelters', { method: 'POST', body: payload, auth: true });

// Wraps the browser geolocation API in a promise so components can `await` a position.
export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      (err) => reject(new Error('Could not get your location. Please allow location access and try again.')),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}
