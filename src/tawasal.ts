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

if (typeof window !== "undefined") {
  window.tawasalCallbacks = {};
}

export function checkIfImplemented(method: Method) {
  return (
    supportedTawasalMethods.has(method) || // ← new layer
    typeof window?.webkit?.messageHandlers?.[method]?.postMessage ===
      "function" ||
    typeof window?.twAndroid?.[method] === "function"
  );
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

export function callSuperApp(method: Method, request?: any) {
  const jsonOrNo = isObjectLike(request) ? JSON.stringify(request) : request;
  window?.webkit?.messageHandlers?.[method]?.postMessage(request);
  window?.twAndroid?.[method]?.(jsonOrNo);
  window.top?.postMessage(
    {
      method,
      payload: request,
    },
    "*",
  );
}

export function withCallback(
  method: Method,
  callback: Callback<any>,
  data: any = {},
) {
  const callbackID = nanoid();
  const key = `${method}_${callbackID}`;

  if (checkIfImplemented(method)) {
    window.tawasalCallbacks[callbackID] = (response: ValueOrError<any>) => {
      callback(response);
      delete window.tawasalCallbacks[callbackID];
    };
  } else {
    tawasalPromiseHandlers.set(key, (response: ValueOrError<any>) => {
      callback(response);
    });
  }

  callSuperApp(method, { ...data, callbackID });
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

function hideApp() {
  callSuperApp("hide");
}

function close() {
  callSuperApp("closeApp");
}

export function closeApp() {
  if (checkIfImplemented("hide")) {
    hideApp();
  } else if (checkIfImplemented("closeApp")) {
    close();
  } else {
    open("discover");
  }
}

export function openChat(userIdOrNickname: number | string) {
  open(`contacts/${userIdOrNickname}`);
}

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
 * Fetches the user information.
 */
export function getUser() {
  return withPromise<Contact>("getUser");
}

/**
 * Fetches the user's photo in base64 format.
 */
export function getUserPhoto() {
  return withPromise<string>("getUserPhoto").then((photo) => {
    return `data:image/png;base64,${photo}`;
  });
}

/**
 * Fetches the user's phone number for a specified reason.
 * @Warning: Can be denied on user side if he don't want to share phone with you
 */
export function getPhoneNumber(reason: string) {
  return withPromise<string>("getPhoneNumber", { reason });
}

/**
 * Get link of current user, so you could enter a chat with him.
 * @Warning: Unstable
 */
export function getUserLink() {
  console.warn("Please be aware that getUserLink is currently unstable");
  return withPromise<string>("getUserLink");
}

export function getPushToken(reason: string) {
  return withPromise<string>("getPushToken", { reason });
}

/**
 * Reads the content of the clipboard
 */
export function readClipboard() {
  return withPromise<string>("readClipboard");
}

export function getUserFlags() {
  return withPromise<string>("getUserFlags");
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

export function getWalletBalance() {
  return withPromise<string>("getWalletBalance");
}

export function getUserChannels(reason: string) {
  return withPromise<object[]>("getUserChannels", { reason });
}

/**
 * Prompts the user to select contacts with a specified title for the selection dialog.
 */
export function selectContacts(title: string) {
  return withPromise<Contact[]>("selectContacts", { title });
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

/**
 * Gives control of pull to refresh feature.
 */
export function disablePullToRefresh(disabled: boolean) {
  callSuperApp("disablePullToRefresh", { disabled });
}

/**
 * Open app by url app should be allowed)
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
