export type ValueOrError<T> =
  | { value: T; error: never }
  | { error: string; value: never };

export type ValueOrErrorOrResult<T> =
  | { value: T; error: never; result: never }
  | { error: string; value: never; result: never }
  | { result: T; error: never; value: never };

export type Pressure = "light" | "medium" | "heavy" | "soft" | "rigid";

export type Language =
  | "en"
  | "ar"
  | "es"
  | "fa"
  | "fr"
  | "id"
  | "ru"
  | "tr"
  | "hi"
  | "ur";

export interface Tawasal {
  userId: number;
  userToken?: string;
  firstName?: string;
  lastName?: string;
  userNickname?: string;
  language: Language;
  platform: "ios" | "android" | "web";
  version: string;
}

export interface TawasalCallbacks {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  [key: string]: (response: any) => void;
}

export type Method =
  | "haptic"
  | "getPhoneNumber"
  | "getUserFlags"
  | "getUserPhoto"
  | "getUser"
  | "open"
  | "getPushToken"
  | "readClipboard"
  | "share"
  | "getWalletBalance"
  | "getWalletTransactions"
  | "getUserChannels"
  | "selectContacts"
  | "getUserLink"
  | "closeScanQR"
  | "showScanQR"
  | "hide"
  | "closeApp"
  | "openUrl"
  | "openApp"
  | "disablePullToRefresh"
  | "openAppWithTag";

type IDOrUsername = string | number;

export type Destination =
  | "chats"
  | "chats/create"
  | "channels/create"
  | "calls"
  | "calls/create"
  | "discover"
  | "contacts"
  | "settings"
  | "settings/username"
  | "qr"
  | `contacts/${IDOrUsername}`
  | "wallet"
  | "wallet/contacts"
  | "wallet/card"
  | `wallet/transaction/\${id}`;

export type Callback<T> = (response: T) => void;

export type Contact = {
  userId: number;
  firstName: string;
  lastName?: string;
  userNickname?: string;
  photoid?: bigint | null;
  photoaccesshash?: string | null;
  phone?: string;
};

export type ContacsCallback = (data: ValueOrErrorOrResult<Contact[]>) => void;

export type Cookie = {
  userId: number;
  userToken?: string;
  firstName?: string;
  lastName?: string;
  userNickname?: string;
  language: Language;
  platform: "ios" | "android" | "web";
  version: string;
};

export const versions = {
  discover_as_start_introduced: 510,
  select_contacts_introduced: 520,
  native_nav: 540,
};

type PostMessage = {
  postMessage: (message: unknown) => void;
};

declare global {
  interface Window {
    tawasalMessageHandlerSet?: boolean;
    tawasal: Tawasal;
    tawasalCallbacks: TawasalCallbacks;
    twAndroid?: {
      open: (req: string) => void; // because stringify json
      haptic: (req?: string) => void;
      getUser: (req: string) => void; // because stringify json
      getPhoneNumber: (req: string) => void; // because stringify json
      getUserFlags: (req: string) => void; // because stringify json
      getUserPhoto: (req: string) => void; // because stringify json
      getPushToken: (req: string) => void; // because stringify json
      readClipboard: (req: string) => void; // because stringify json
      share: (req: string) => void; // because stringify json
      getWalletBalance: (req: string) => void; // because stringify json
      getWalletTransactions: (req: string) => void; // because stringify json
      getUserChannels: (req: string) => void; // because stringify json
      selectContacts: (req: string) => void; // because stringify json
      getUserLink: (req: string) => void; // because stringify json
      closeScanQR: (req: string) => void; // because stringify json
      showScanQR: (req: string) => void; // because stringify json
      hide: undefined; // mistake was done on android :(
      closeApp: (req: string) => void; // because stringify json
      openApp: (req: string) => void;
      openUrl: (req: string) => void;
      disablePullToRefresh: (req: string) => void;
      openAppWithTag: (req: string) => void;
    };
    webkit?: {
      messageHandlers?: {
        open?: PostMessage;
        haptic?: PostMessage;
        getUser?: PostMessage;
        getPhoneNumber?: PostMessage;
        getUserFlags?: PostMessage;
        getUserPhoto?: PostMessage;
        getPushToken?: PostMessage;
        readClipboard?: PostMessage;
        share?: PostMessage;
        getWalletBalance?: PostMessage;
        getWalletTransactions?: PostMessage;
        getUserChannels?: PostMessage;
        selectContacts?: PostMessage;
        getUserLink?: PostMessage;
        closeScanQR?: PostMessage;
        showScanQR?: PostMessage;
        hide?: PostMessage;
        closeApp?: undefined; // android hook that was done by mistake: (
        disablePullToRefresh: PostMessage;
        openApp: PostMessage;
        openUrl: PostMessage;
        openAppWithTag: PostMessage;
      };
    };
  }

  var window: Window & typeof globalThis;
  var document: Document;
}
