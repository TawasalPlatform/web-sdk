#
<div align="center">
  <a href="https://tawasal.ae/">
    <img src="https://tawasal.ae/tawasal_logo_full.png" width="300" height="auto" alt="Tawasal"/>
  </a>
</div>

<hr />

<p align="center">
<a href="https://platform.tawasal.ae"><b>check our Documentation 👉 platform.tawasal.ae</b></a><br />
</p>

<hr />

[![npm](https://img.shields.io/npm/v/@tawasal/web)](https://www.npmjs.com/package/@tawasal/web)
[![npm](https://img.shields.io/npm/dm/@tawasal/web)](https://www.npmjs.com/package/@tawasal/web)
[![Bundle Size](https://img.shields.io/bundlephobia/min/@tawasal/web)](https://bundlephobia.com/result?p=@tawasal/web)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@tawasal/web)](https://bundlephobia.com/result?p=@tawasal/web)

This library provides a set of functions to create mini-apps within the Tawasal SuperApp environment. It leverages various methods to interact with the Tawasal platform, including user interactions, device features, and app-specific functionalities.

## Installation

```bash
npm i @tawasal/web
```

# Usage

## Haptic Feedback

#### `haptic(pressure: "light" | "medium" | "heavy" | "soft" | "rigid")`

Triggers haptic feedback with the specified pressure (haptic should be enabled on user side).

```ts
import { haptic } from "@tawasal/web";

for (const button of Array.from(document.getElementsByTagName("button"))) {
  button.onclick = () => haptic()
}
```
###
## Navigation

#### `open(destination: Destination)`

Opens a specified destination within the Tawasal SuperApp (include the haptic for user experience).

#### `closeApp()`

Closes the mini-app.

###
## User Interactions

#### `openChat(userNickname: string)`

Opens a chat with the specified user.

```typescript
import { openChat } from "@tawasal/web";

openChat("@Aibot") // force user to visit Mellow
```

#### `selectContacts(title: string): Promise<Contact[]>`

Prompts the user to select contacts with a specified title for the selection dialog.

```ts
  import { selectContacts } from "@tawasal/web";

  selectContacts("title, to make users understand why they need to give contacts").then((value) => {
    if (value.length > 0) {
      addToStorage(value)
    }
  });
```
#### `getUser(): Promise<Contact>`

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
import { getUser } from "@tawasal/web";

getUser().then((value) => {
  console.log(value.firstName ?? value.userNickname)
})
```

#### `getUserPhoto(): Promise<base64String>`

Fetches the user's photo in base64 format.

```typescript
import { getUserPhoto } from "@tawasal/web";

getUserPhoto().then((value) => {
  setSrc(value);
}); 
```

#### `getPhoneNumber(reason: string): Promise<string>`

Fetches the user's phone number for a specified reason. (can be denied on user side if he don't want to share phone with you)

```typescript
import { getPhoneNumber } from "@tawasal/web";

getPhoneNumber("Provide title, so user will know why they should allow you their phone")
  .then((value) => {
    form.submit({ phone: value });
  });
```

###
## Device Features

#### `readClipboard(): Promise<string>`

Reads the content of the clipboard.

###
## Social

#### `share({ text: string, url: string, imgUrl?: string })`

Shares specified messages via the Tawasal SuperApp.

```typescript
import { share } from "@tawasal/web";

share({
  text: `lets visit ${club.name} tonight!`, 
  url: club.url, 
  imgUrl: club.photo.src
})
```

###
## QR Code

#### `showScanQR(): Promise<string>`

Shows the QR code scanner.

#### `closeScanQR()`

Closes the QR code scanner.

###
## Helpers

#### `checkIfImplemented(method: Method)`

Checks if a method is implemented in the Tawasal SuperApp environment. It can help with the newest hooks, to check if user version supports it.

```typescript
import { checkIfImplemented } from "@tawasal/web";

if (checkIfImplemented("selectContacts")) {
  // do select contacts
} else {
  // ask users to update app or provide alternative flow
}
```

#### `getAvatar( photoId: string, photoAccessHash: string, id: number)`
This method helps you receive avatars via API

```typescript
import { selectContacts, getAvatar } from "@tawasal/web";
selectContacts("title").then((selectedUsers) => {
  if (selectedUsers[0]) {
    getAvatar(
      selectedUsers[0].userId,
      selectedUsers[0].photoid, 
      selectedUsers[0].photoaccesshash
    )
  }
});
```
you can also specify if you are searching channel avatar, and specific root url, for custom domain
```ts
getAvatar(
  channelId,
  photoid, 
  photoaccesshash, 
  "channel",
  "example.com"
)
```

# Fixes for compabilty

## Next.js
#### ```error: ESM packages need to be imported```

[add esm support to your next.js config](https://nextjs.org/docs/messages/import-esm-externals)  
```js
experimental: {
  esmExternals: "loose" 
}
```

# License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
