import * as os from 'os'
import { execSync } from 'child_process'
import * as path from 'path'
import * as fs from 'fs'

export enum WindowButton {
  CLOSE = 'close',
  MAXIMIZE = 'maximize',
  MINIMIZE = 'minimize',
  SPACER = 'spacer',
  MENU = 'menu',
}

export interface WindowButtonLayout {
  start: WindowButton[]
  end: WindowButton[]
}

export const DEFAULT_LAYOUT_WINDOWS = {
  start: [WindowButton.MENU],
  end: [
    WindowButton.MINIMIZE,
    WindowButton.MAXIMIZE,
    WindowButton.CLOSE
  ]
}

export const DEFAULT_LAYOUT_MACOS = {
  start: [
    WindowButton.CLOSE,
    WindowButton.MINIMIZE,
    WindowButton.MAXIMIZE,
  ],
  end: [
    WindowButton.MENU,
  ],
}

export const DEFAULT_LAYOUT = DEFAULT_LAYOUT_WINDOWS

export function getWindowButtonLayout (): WindowButtonLayout {
  const platform = os.platform()
  if (platform === 'win32') {
    return DEFAULT_LAYOUT_WINDOWS
  } else if (platform === 'darwin') {
    return DEFAULT_LAYOUT_MACOS
  } else if (platform === 'linux') {
    // KDE
    if (process.env.XDG_CURRENT_DESKTOP === 'KDE' || (process.env.GDMSESSION && process.env.GDMSESSION.startsWith('kde'))) {
      return getKDEButtons()
    }
    // ElementaryOS
    else if (process.env.GDMSESSION === 'pantheon') {
      return getGnomeButtons('org.pantheon.desktop.gala.appearance button-layout')
    }
    // Gnome
    else if (process.env.GSETTINGS_SCHEMA_DIR) {
      return getGnomeButtons('org.gnome.desktop.wm.preferences button-layout')
    }
  }
  return DEFAULT_LAYOUT
}

function filterButtons (values: string[]): WindowButton[] {
  return values.filter(
    (v: WindowButton) => Object.values(WindowButton).includes(v)
  ) as WindowButton[]
}

function getGnomeButtons (key: string): WindowButtonLayout {
  const result = execSync(`gsettings get ${key}`, {
    encoding: 'utf8',
  })
  const [, value] = /'(.*)'/.exec(result)
  const [start, end] = value.split(':')
  return {
    start: filterButtons(start.split(',')),
    end: filterButtons(end.split(',')),
  }
}

const KDE_BUTTONS = {
  M: WindowButton.MENU,
  I: WindowButton.MINIMIZE,
  A: WindowButton.MAXIMIZE,
  X: WindowButton.CLOSE
}

function getKDEButtons (): WindowButtonLayout {
  const configFile = path.resolve(os.homedir(), '.config/kwinrc')
  if (fs.existsSync(configFile)) {
    const content = fs.readFileSync(configFile, { encoding: 'utf8' })
    const [,start] = /ButtonsOnLeft=(.*)/.exec(content)
    const [,end] = /ButtonsOnRight=(.*)/.exec(content)
    return {
      start: filterKDEButtons(start.split('')),
      end: filterKDEButtons(end.split(''))
    }
  }
  return DEFAULT_LAYOUT
}

function filterKDEButtons (values: string[]): WindowButton[] {
  return values.map(v => KDE_BUTTONS[v]).filter(v => !!v)
}
