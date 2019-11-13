# window-button-layout
Retrieve OS window buttons layout (close, maximize, minimize...) depending on platform and user preferences. Useful to create a custom window title in Electron that matches the rest of the OS for a more coherent UX.

Currently supported:

- Windows
- MacOS
- KDE
- Gnome
- Pantheon (elementaryOS)

## Installation

```bash
yarn add window-button-layout
```

## Usage

**Must be used in a Node context!** In an electron app, you can use IPC to send the result to your frontend code.

The `getWindowButtonLayout` function will return a `WindowButtonLayout` object:

```js
const { getWindowButtonLayout } = require('window-button-layout')

console.log(getWindowButtonLayout())
/*
{
  start: ['menu'],
  end: ['minimize', 'maximize', 'close']
}
*/
```

Depending on the OS and user preferences, you will get different arrays for `start` (left-side) and `end` (right-side). All buttons are not necessarily used; for example, on Pantheon (elementaryOS) there are no `menu` and `minimize` window buttons.

Interfaces:

```ts
enum WindowButton {
  CLOSE = 'close',
  MAXIMIZE = 'maximize',
  MINIMIZE = 'minimize',
  SPACER = 'spacer',
  MENU = 'menu',
}

interface WindowButtonLayout {
  start: WindowButton[]
  end: WindowButton[]
}
```

Unkown buttons (that are not in the `WindowButton` enum) will be ignored.
