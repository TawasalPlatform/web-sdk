import { nanoid } from "nanoid";
import type {
  ValueOrError,
  Method,
  Pressure,
  Callback,
  ValueOrErrorOrResult,
  Contact,
  Destination,
} from "./types";

import { isIOS, isObjectLike } from "./utils";

/**
 * Calls the native SuperApp bridge with given method and request.
 */
export function callSuperApp(method: Method, request?: any) {
  const jsonOrNo = isObjectLike(request) ? JSON.stringify(request) : request;
  window?.webkit?.messageHandlers?.[method]?.postMessage(request);
  window?.twAndroid?.[method]?.(jsonOrNo);
  window.top?.postMessage({ method, payload: request }, "*");
}

if (typeof window !== "undefined") {
  window.tawasalCallbacks = {};
}

const tawasalPromiseHandlers = new Map<string, (payload: any) => void>();
const supportedTawasalMethods = new Set<string>();

if (typeof window !== "undefined" && !window.tawasalMessageHandlerSet) {
  window.tawasalMessageHandlerSet = true;

  window.addEventListener("message", (event: MessageEvent) => {
    const { method, payload } = event.data || {};
    if (method === "supportedMethods" && Array.isArray(payload)) {
      payload.forEach((m) => supportedTawasalMethods.add(m));
      return;
    }

    if (!method || !payload?.callbackID) return;

    const key = `${method}_${payload.callbackID}`;
    const resolve = tawasalPromiseHandlers.get(key);
    if (resolve) {
      tawasalPromiseHandlers.delete(key);
      resolve(payload);
    }
  });
}

/**
 * Checks if the method is implemented in the native layer.
 */
export function checkIfImplemented(method: Method) {
  return (
    supportedTawasalMethods.has(method) ||
    typeof window?.webkit?.messageHandlers?.[method]?.postMessage ===
      "function" ||
    typeof window?.twAndroid?.[method] === "function"
  );
}

/**
 * Gives control of pull to refresh feature.
 */
export function disablePullToRefresh(disabled: boolean) {
  callSuperApp("disablePullToRefresh", { disabled });
}

/**
 * Closes the app.
 */
export function close() {
  callSuperApp("closeApp");
}

/**
 * Closes or hides the app intelligently.
 */
export function closeApp() {
  if (checkIfImplemented("hide")) {
    callSuperApp("hide");
  } else if (checkIfImplemented("closeApp")) {
    callSuperApp("closeApp");
  } else {
    open("discover");
  }
}

/**
 * Triggers haptic feedback with the specified pressure (haptic should be enabled on user side).
 */
export function haptic(pressure: Pressure = "light") {
  callSuperApp("haptic", pressure);
}

/**
 * Open a specific Destination
 */
export function open(destination: Destination) {
  haptic();
  callSuperApp("open", destination);
}

/**
 * Open app by name
 */
export function openApp(appName: string) {
  callSuperApp("openApp", appName);
}

/**
 * Open url in browser
 */
export function openUrl(url: string) {
  callSuperApp("openUrl", url);
}

/**
 * Open a chat with a specific user
 */
export function openChat(userIdOrNickname: number | string) {
  open(`contacts/${userIdOrNickname}`);
}

/**
 * Prompts the user to select contacts with a specified title for the selection dialog.
 */
export function selectContacts(title: string) {
  return withPromise<Contact[]>("selectContacts", { title });
}

/**
 * Shares specified messages via the Tawasal SuperApp.
 */
export function share({
  text,
  url,
  imgUrl,
  isCustomIos,
}: {
  text: string;
  url: string;
  imgUrl?: string;
  isCustomIos?: boolean;
}) {
  if (isIOS() && !isCustomIos) {
    window.navigator.share({ text: `${text} ${url}`, url: imgUrl });
  } else {
    callSuperApp("share", { text, url, imgUrl });
  }
}

/**
 * Shows the QR code scanner.
 */
export function showScanQR() {
  return withPromise<string>("showScanQR");
}

/**
 * Closes the QR code scanner.
 */
export function closeScanQR() {
  callSuperApp("closeScanQR");
}

/**
 * Utility for promise-based calls.
 */
export function withPromise<T>(method: Method, data: any = {}): Promise<T> {
  const callbackID = nanoid();

  return new Promise((resolve, reject) => {
    if (checkIfImplemented(method)) {
      window.tawasalCallbacks[callbackID] = ({
        value,
        error,
        result,
      }: ValueOrErrorOrResult<T>) => {
        if (result) resolve(result);
        if (value) resolve(value);
        if (error) reject(error);
        delete window.tawasalCallbacks[callbackID];
      };
    } else {
      const key = `${method}_${callbackID}`;
      tawasalPromiseHandlers.set(key, (response: ValueOrErrorOrResult<T>) => {
        const { value, error, result } = response;
        if (error) return reject(error);
        resolve(result ?? value);
      });
    }

    callSuperApp(method, { ...data, callbackID });
  });
}

/**
 * This method helps you receive avatars via API
 */
export function getAvatar(
  id: number,
  photoId: string | number | bigint,
  photoAccessHash: string,
  category: "user" | "channel" = "user",
  rootUrl: string = "https://twl.ae",
) {
  let prefix;

  if (category === "user") {
    prefix = "u";
  } else if (category === "channel") {
    prefix = "c";
  }

  return `${rootUrl}/_/photos/${photoId}?ah=${photoAccessHash}&pk=${prefix}&pid=${id}`;
}
