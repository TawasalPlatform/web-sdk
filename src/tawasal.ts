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
    typeof window?.webkit?.messageHandlers?.[method]?.postMessage ===
      "function" || typeof window?.twAndroid?.[method] === "function"
  );
}

export function callSuperApp(method: Method, request?: any) {
  const jsonOrNo = isObjectLike(request) ? JSON.stringify(request) : request;

  window?.webkit?.messageHandlers?.[method]?.postMessage(request);
  window?.twAndroid?.[method]?.(jsonOrNo);
}

export function withCallback(
  method: Method,
  callback: Callback<any>,
  data: any = {},
) {
  const callbackID = nanoid();

  window.tawasalCallbacks[callbackID] = (response: ValueOrError<any>) => {
    callback(response);
    delete window.tawasalCallbacks[callbackID];
  };

  callSuperApp(method, { ...data, callbackID });
}

export function haptic(pressure: Pressure = "light") {
  callSuperApp("haptic", pressure);
}

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

    callSuperApp(method, { ...data, callbackID });
  });
}

export function getUser() {
  return withPromise<Contact>("getUser");
}

export function getUserPhoto() {
  return withPromise<string>("getUserPhoto").then((photo) => {
    return `data:image/png;base64,${photo}`;
  });
}

export function getPhoneNumber(reason: string) {
  return withPromise<string>("getPhoneNumber", { reason });
}

export function getUserLink() {
  return withPromise<string>("getUserLink");
}

export function getPushToken(reason: string) {
  return withPromise<string>("getPushToken", { reason });
}

export function readClipboard() {
  return withPromise<string>("readClipboard");
}

export function getUserFlags() {
  return withPromise<string>("getUserFlags");
}

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

export function selectContacts(title: string) {
  return withPromise<Contact[]>("selectContacts", { title });
}

export function showScanQR(callback: Callback<ValueOrError<string>>) {
  return withPromise<string>("showScanQR");
}

export function closeScanQR() {
  callSuperApp("closeScanQR");
}
