// Minimal JWT decode (no verification) to extract payload and roles
// Handles base64url and both string/array role claims

function base64UrlDecode(input) {
  try {
    // Replace URL-safe chars
    let b64 = input.replace(/-/g, "+").replace(/_/g, "/");
    // Pad with '='
    const pad = b64.length % 4;
    if (pad) b64 += "=".repeat(4 - pad);
    const decoded = atob(b64);
    try {
      // Convert binary string to UTF-8
      return decodeURIComponent(
        decoded
          .split("")
          .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
          .join("")
      );
    } catch {
      return decoded; // fallback
    }
  } catch {
    return "{}";
  }
}

export function decodeJwt(token) {
  if (!token || typeof token !== "string") return {};
  const parts = token.split(".");
  if (parts.length < 2) return {};
  const json = base64UrlDecode(parts[1]);
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}

export function extractRoles(payload) {
  if (!payload) return [];
  // Common claim keys: role, roles, http://schemas.microsoft.com/ws/2008/06/identity/claims/role
  const knownKeys = [
    "role",
    "roles",
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
  ];
  for (const key of knownKeys) {
    const val = payload[key];
    if (!val) continue;
    if (Array.isArray(val)) return val;
    if (typeof val === "string") return [val];
  }
  return [];
}

export function setAuthInfo({ roles = [], fullName, userName }) {
  try {
    localStorage.setItem("authRoles", JSON.stringify(roles));
    if (fullName) localStorage.setItem("fullName", fullName);
    if (userName) localStorage.setItem("userName", userName);
  } catch {
    // noop
    void 0;
  }
}

export function getAuthRoles() {
  try {
    const raw = localStorage.getItem("authRoles");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function hasRole(target) {
  const roles = getAuthRoles();
  return roles.includes(target);
}

export function clearAuth() {
  try {
    localStorage.removeItem("authRoles");
    localStorage.removeItem("fullName");
    localStorage.removeItem("userName");
  } catch {
    // noop
    void 0;
  }
}
