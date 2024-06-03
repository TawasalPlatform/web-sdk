import { nanoid } from "nanoid";
import type {
    ValueOrError,
    Method,
    Pressure,
    Callback,
    ValueOrErrorOrResult,
    Contact,
    Tawasal,
    Destination,
} from "./types";
import {isObjectLike} from "./utils";

if (typeof window !== "undefined") {
    window.tawasalCallbacks = {};
}

interface Settings {
    discoverAsStartScreen: boolean;
}

export function checkIfImplemented(method: Method) {
    return (
        typeof window?.webkit?.messageHandlers?.[method]?.postMessage ===
        "function" || typeof window?.twAndroid?.[method] === "function"
    );
}

function callSuperApp(method: Method, request?: any) {
    const jsonOrNo = isObjectLike(request) ? JSON.stringify(request) : request;

    window?.webkit?.messageHandlers?.[method]?.postMessage(request);
    window?.twAndroid?.[method]?.(jsonOrNo);
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function withCallback(method: Method, callback: Callback<any>, data: any = {}) {
    const callbackID = nanoid();

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
    } else {
        open("discover");
    }
}

export function openChat(userIdOrNickname: number | string) {
    open(`contacts/${userIdOrNickname}`);
}

export function getUser(callback: Callback<ValueOrError<Contact>>) {
    withCallback("getUser", callback);
}

export function getUserPhoto(callback: Callback<ValueOrError<string>>) {
    withCallback("getUserPhoto", callback);
}

export function getPhoneNumber(
    reason: string,
    callback: Callback<ValueOrError<string>>,
) {
    withCallback("getPhoneNumber", callback, { reason });
}

export function getUserLink(callback: Callback<ValueOrError<string>>) {
    withCallback("getUserLink", callback);
}

export function getPushToken(
    reason: string,
    callback: Callback<ValueOrError<string>>,
) {
    withCallback("getPushToken", callback, { reason });
}

export function updateSettings(
    settings: Settings,
    reason: string,
    callback: Callback<ValueOrError<string>>,
) {
    withCallback("updateSettings", callback, { reason, ...settings });
}

export function readClipboard(callback: Callback<ValueOrError<string>>) {
    withCallback("readClipboard", callback);
}

export function track(event: string, parameters: object) {
    callSuperApp("track", { event, parameters });
}

export function getUserFlags(callback: Callback<ValueOrError<string>>) {
    withCallback("getUserFlags", callback);
}

export function share({
                          text,
                          url,
                          imgUrl,
                      }: {
    text: string;
    url: string;
    imgUrl?: string;
}) {
    callSuperApp("share", { text, url, imgUrl });
}

export function getWalletBalance(callback: Callback<ValueOrError<string>>) {
    withCallback("getWalletBalance", callback);
}

export function getUserChannels(
    reason: string,
    callback: Callback<ValueOrError<object[]>>,
) {
    withCallback("getUserChannels", callback, { reason });
}

export function selectContacts(
    title: string,
    callback: Callback<ValueOrErrorOrResult<Contact[]>>,
) {
    withCallback("selectContacts", callback, { title });
}

export function showScanQR(callback: Callback<ValueOrError<string>>) {
    withCallback("showScanQR", callback);
}

export function closeScanQR() {
    callSuperApp("closeScanQR");
}
