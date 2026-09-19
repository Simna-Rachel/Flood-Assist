// Small fetch wrapper for talking to the backend + local session persistence.
// Centralized here so every component hits the same base URL and auth header logic.
import { queueAction, getQueuedActions, removeQueuedAction, cacheRecords, getCachedRecords } from './offlineDb';

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
    const error = new Error(message);
    error.status = res.status;
    error.body = data;
    throw error;
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
export const loginAdmin = (payload) => request('/auth/admin-login', { method: 'POST', body: payload });

// ---- Profile / Settings ----
export const fetchMe = () => request('/user/me', { auth: true });
export const updateMe = (payload) => request('/user/me', { method: 'PUT', body: payload, auth: true });
export const updateLocation = (payload) => request('/user/location', { method: 'POST', body: payload, auth: true });

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
// ---- Shelters ----
export const fetchShelters = async () => {
  if (!navigator.onLine) {
    return getCachedRecords('shelters'); // show cached data offline
  }
  const data = await request('/shelters');
  const shelters = data.data || data.shelters || [];
  await cacheRecords('shelters', shelters); // refresh the cache
  return shelters;
};

export const createShelterEntry = (payload) => request('/shelters', { method: 'POST', body: payload, auth: true });

// Update a shelter's occupancy/status — offline-safe.
// `baseVersion` = the version this client last saw for this shelter.
export const updateShelterEntry = async ({ id, currentOccupancy, status, baseVersion }) => {
  if (!navigator.onLine) {
    await queueAction({
      type: 'UPDATE_SHELTER',
      endpoint: `/shelters/${id}`,
      payload: { currentOccupancy, status, baseVersion }
    });
    return { queued: true };
  }
  return request(`/shelters/${id}`, {
    method: 'PATCH',
    body: { currentOccupancy, status, baseVersion },
    auth: true
  });
};

// Called when the app comes back online. Replays everything in the outbox.
// Returns any conflicts so the UI can show them.
export async function syncOutbox() {
  const queued = await getQueuedActions();
  const conflicts = [];

  for (const action of queued) {
    try {
      const result = await request(action.endpoint, {
        method: 'PATCH',
        body: action.payload,
        auth: true
      });
      await removeQueuedAction(action.localId);
    } catch (err) {
      if (err.status === 409) {
        conflicts.push(action);
      }
      // leave it in the outbox to retry, or move to a conflicts list
    }
  }
  return conflicts;
}

// Wraps the browser geolocation API in a promise so components can `await` a position.
export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => reject(new Error('Could not get your location. Please allow location access and try again.')),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}