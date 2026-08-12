// Small fetch wrapper for talking to the backend + local session persistence.
// Centralized here so every component hits the same base URL and auth header logic.

const BASE_URL = 'http://localhost:5000/api';

// Base server URL (no /api suffix) — used to build absolute links to
// legacy static assets served directly if Cloudinary fails or for relative paths
export const SERVER_ORIGIN = BASE_URL.replace(/\/api$/, '');

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
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const headers = {};

  // Let the browser set Content-Type (with the multipart boundary) itself
  // when sending FormData — setting it manually breaks file uploads.
  if (!isFormData) headers['Content-Type'] = 'application/json';

  if (auth) {
    const session = getSession();
    if (session?.token) headers['Authorization'] = `Bearer ${session.token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isFormData ? body : (body ? JSON.stringify(body) : undefined)
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
// were written against a `fullName` field, so we alias it here.
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
export const fetchHazards = async () => {
  const data = await request('/hazards');
  // Unwrap data array if controller returns { hazards: [...] } or { data: [...] }
  if (Array.isArray(data)) return data;
  return data.hazards || data.reports || data.data || [];
};

// `imageFile` is an optional File object (from an <input type="file">).
// When present, we construct multipart FormData so Multer/Cloudinary on the 
// backend processes the image stream accurately.
export const createHazardReport = async (payload, imageFile) => {
  let responseData;

  if (imageFile) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    formData.append('image', imageFile); // Key name MUST match upload.single('image') in hazardRoutes.js
    
    responseData = await request('/hazards/report', { method: 'POST', body: formData, auth: true });
  } else {
    responseData = await request('/hazards/report', { method: 'POST', body: payload, auth: true });
  }

  // Handle cases where backend wraps created object in { success: true, hazard: {...} }
  return responseData.hazard || responseData.report || responseData.data || responseData;
};

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