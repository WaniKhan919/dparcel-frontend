import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY ;

// Encrypt and store
export function encryptLocalStorage(key: string, data: any) {
  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    SECRET_KEY
  ).toString();
  localStorage.setItem(key, encrypted);
}

// Decrypt and retrieve
export function decryptLocalStorage(key: string) {
  const encrypted = localStorage.getItem(key);
  if (!encrypted) return null;

  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch (e) {
    return null;
  }
}

// Remove item
export const removeLocalStorage = (key: string): void => {
  localStorage.removeItem(key);
};

//get user
export function getUser() {
  return decryptLocalStorage("user") || {};
}

//get permission for storage
export function getPermissions() {
  return decryptLocalStorage("permissions") || [];
}

//get specific permission
export function userHasPermission(permission:string) {
  const permissions = getPermissions();
  return permissions.includes(permission);
}

// Check if user has a specific role
export function userHasRole(role: string) {
  const user = decryptLocalStorage("user") || {};
  return user?.roles?.includes(role) || false;
}