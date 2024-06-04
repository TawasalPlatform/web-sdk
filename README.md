#
<div align="center">
  <a href="https://https://tawasal.ae/">
    <img src="https://tawasal.ae/tawasal_logo_full.png" width="700" height="auto" alt="Tawasal"/>
  </a>
</div>

<hr />

<p align="center">
<a href="https://platform.tawasal.ae"><b>check our Documentation 👉 platform.tawasal.ae</b></a><br />
</p>

<hr />

[![npm](https://img.shields.io/npm/v/@tawasal/web-sdk)](https://www.npmjs.com/package/@tawasal/web-sdk)
[![npm](https://img.shields.io/npm/dm/@tawasal/web-sdk)](https://www.npmjs.com/package/@tawasal/web-sdk)
[![Bundle Size](https://img.shields.io/bundlephobia/min/@tawasal/web-sdk)](https://bundlephobia.com/result?p=@tawasal/web-sdk)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@tawasal/web-sdk)](https://bundlephobia.com/result?p=@tawasal/web-sdk)

This library provides a set of functions to create mini-apps within the Tawasal SuperApp environment. It leverages various methods to interact with the Tawasal platform, including user interactions, device features, and app-specific functionalities.

## Installation

```bash
npm i @tawasal/web-sdk
```

## Usage

### Haptic Feedback

#### `haptic(pressure: "light" | "medium" | "heavy" | "soft" | "rigid")`

Triggers haptic feedback with the specified pressure (haptic should be enabled on user side).

### Navigation

#### `open(destination: Destination)`

Opens a specified destination within the Tawasal SuperApp (include the haptic for user experience).

#### `closeApp()`

Closes the mini-app.

### User Interactions

#### `openChat(userNickname: string)`

Opens a chat with the specified user.

```typescript
import { openChat } from "@tawasal/web-sdk";

openChat("@Aibot") // force user to visit Mellow
```

#### `selectContacts(title: string, callback: Callback<ValueOrErrorOrResult<Contact[]>>)`

Prompts the user to select contacts with a specified title for the selection dialog.

```ts
import { selectContacts } from "@tawasal/web-sdk";

selectContacts("phrase to make users understand why they need to give contacts", async (data) => {
  if (data.error) {
    return console.log(data.error);
  }

  if (data.value && data.value.length > 0) {
    const contacts = data.value as Users[]
    await addToStorage(contacts)
  }
});
```
#### `getUser(callback: Callback<ValueOrError<Contact>>)`

Fetches the user information. in provided scheme
```ts
{
  userId: number;
  firstName: string;
  lastName?: string;
  userNickname?: string;
  photoid?: number | null;
  photoaccesshash?: string | null;
  phone?: string;
}
```

```typescript
import { getUser } from "@tawasal/web-sdk";

getUser(({ value }) => {
  console.log(value.firstName ?? value.userNickname)
})
```

#### `getUserPhoto(callback: Callback<ValueOrError<string>>)`

Fetches the user's photo.

```typescript
import { getUserPhoto } from "@tawasal/web-sdk";

getUserPhoto(({ value }) => {
  if (value) setSrc(`data:image/png;base64,${value}`);
}); 
```

#### `getPhoneNumber(reason: string, callback: Callback<ValueOrError<string>>)`

Fetches the user's phone number for a specified reason. (can be denied on user side if he don't want to share phone with you)

```typescript
import { getPhoneNumber } from "@tawasal/web-sdk";

getPhoneNumber("Provide phrase so user will now why they should allow you their phone", ({ value }) => {
  if (value) form.submit({ phone: value });
});
```

### Device Features

#### `readClipboard(callback: Callback<ValueOrError<string>>)`

Reads the content of the clipboard.

### Social and Sharing

#### `share({ text: string, url: string, imgUrl?: string })`

Shares content via the Tawasal SuperApp.

```typescript
import { share } from "@tawasal/web-sdk";

share({
  text: `lets visit ${club.name} tonight!`, 
  url: club.url, 
  imgUrl: club.photo.src
})
```

### QR Code

#### `showScanQR(callback: Callback<ValueOrError<string>>)`

Shows the QR code scanner.

#### `closeScanQR()`

Closes the QR code scanner.

### Helpers

#### `checkIfImplemented(method: Method)`

Checks if a method is implemented in the Tawasal SuperApp environment. It can help with the newest hooks, to check if user version supports it.

```typescript
import { checkIfImplemented } from "@tawasal/web-sdk";

if (checkIfImplemented("selectContacts")) {
  // do select contacts
} else {
  // ask users to update app or provide alternative flow
}
```


## Conclusion

This library simplifies the process of creating mini-apps within the Tawasal SuperApp by providing easy-to-use functions to interact with the app's features and services.
