const keys = ["accessToken", "refreshToken", "user"];

function storage() {
  return localStorage.getItem("accessToken") ? localStorage : sessionStorage;
}

export function getToken(key = "accessToken") {
  return storage().getItem(key);
}

export function getUser() {
  try {
    return JSON.parse(storage().getItem("user") || "null");
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export function saveAuth(accessToken, refreshToken, user, remember = true) {
  for (const key of keys) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
  const target = remember ? localStorage : sessionStorage;
  target.setItem("accessToken", accessToken);
  target.setItem("refreshToken", refreshToken);
  target.setItem("user", JSON.stringify(user));
  window.dispatchEvent(new Event("auth-change"));
}

export function updateToken(token) {
  storage().setItem("accessToken", token);
}
export function updateUser(user) {
  storage().setItem("user", JSON.stringify(user));
  window.dispatchEvent(new Event("auth-change"));
}

export function clearAuth() {
  for (const key of keys) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
  window.dispatchEvent(new Event("auth-change"));
}
