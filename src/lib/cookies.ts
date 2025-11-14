import Cookies from "js-cookie";

export interface CookieOptions {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
}

export const DEFAULT_COOKIE_OPTIONS: CookieOptions = {
  expires: 7, // 7 days
  secure: true,
  sameSite: "strict",
  path: "/",
};

/**
 * Set a cookie with the given name, value, and options
 */
export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): void {
  const mergedOptions = { ...DEFAULT_COOKIE_OPTIONS, ...options };
  Cookies.set(name, value, mergedOptions);
}

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | undefined {
  return Cookies.get(name);
}

/**
 * Remove a cookie by name
 */
export function removeCookie(name: string, options: Partial<CookieOptions> = {}): void {
  const mergedOptions = { ...DEFAULT_COOKIE_OPTIONS, ...options };
  Cookies.remove(name, mergedOptions);
}

/**
 * Set a JSON object as a cookie
 */
export function setJsonCookie<T = any>(
  name: string,
  value: T,
  options: CookieOptions = {}
): void {
  try {
    const jsonString = JSON.stringify(value);
    setCookie(name, jsonString, options);
  } catch (error) {
    console.error(`Error setting JSON cookie "${name}":`, error);
    throw new Error(`Failed to set JSON cookie: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get a JSON object from a cookie
 */
export function getJsonCookie<T = any>(name: string): T | null {
  try {
    const cookieValue = getCookie(name);
    if (!cookieValue) {
      return null;
    }
    return JSON.parse(cookieValue) as T;
  } catch (error) {
    console.error(`Error parsing JSON cookie "${name}":`, error);
    return null;
  }
}

/**
 * Remove a JSON cookie by name
 */
export function removeJsonCookie(name: string, options: Partial<CookieOptions> = {}): void {
  removeCookie(name, options);
}

/**
 * Cookie names used throughout the application
 */
export const COOKIE_NAMES = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  CURRENT_STORE: "current_store",
  USER_PREFERENCES: "user_preferences",
  THEME: "theme",
} as const;

/**
 * Clear all authentication-related cookies
 */
export function clearAuthCookies(): void {
  removeCookie(COOKIE_NAMES.ACCESS_TOKEN);
  removeCookie(COOKIE_NAMES.REFRESH_TOKEN);
  removeCookie(COOKIE_NAMES.CURRENT_STORE);
}

/**
 * Clear all cookies (use with caution)
 */
export function clearAllCookies(): void {
  const allCookies = Cookies.get();
  Object.keys(allCookies).forEach((cookieName) => {
    removeCookie(cookieName);
  });
}