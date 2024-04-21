const audio = await Service.import('audio')

import { Media } from "../media/Media.js"

const WINDOW_NAME = "dashboard"

const date = Variable("", {
    poll: [43200000, `bash -c "LC_TIME=en_US.UTF-8 date +'%A, %d %B, %Y'"`],
})

const host = Utils.exec(`bash -c "hostnamectl hostname"`)

function Avatar() {
  return Widget.Box({
    class_name: "dashboard-image",
    vpack: "start",
    css: `background-image: url('${App.configDir}/../../.face.icon')`
  })
}

function Date() {
  return Widget.Box({
    class_name: "dashboard-date",
    vertical: true,
    hexpand: false,
    vexpand: false,
    vpack: "center",
    halign: "start",
    children: [
      Widget.Label({
        label: date.bind(),
      }),
      Widget.Label({
        label: `Welcome to ${host}`,
      }),
    ]
  })
}

function PowermenuButton() {
  return Widget.Button({
    class_name: "dashboard-power-button",
    vexpand: false,
    vpack: "center",
    hpack: "end",
    child: Widget.Icon("system-log-out-symbolic"),
    on_clicked: () => App.toggleWindow("powermenu"),
  })
}

function VolumeSlider(type = 'speaker') {
  const icons = {
        101: "overamplified",
        67: "high",
        34: "medium",
        1: "low",
        0: "muted",
  }

  function getIcon(type = 'speaker') {
      const icon = audio[type].is_muted ? 0 : [101, 67, 34, 1, 0].find(
          threshold => threshold <= audio[type].volume * 100)

    if (type === 'speaker') {
      return `audio-volume-${icons[icon]}-symbolic`
    } else if (type === 'microphone') {
      return `microphone-sensitivity-${icons[icon]}-symbolic`
    }
  }

  const icon = Widget.Icon({
    class_name: "dashboard-volume-icons",
    icon: Utils.watch(getIcon(type), audio[type], getIcon)
  })

  return Widget.Box({
    visible: audio[type].bind('id').as(p => p != null),
    children: [
      icon,
      Widget.Slider({
        hexpand: true,
        cursor: "ew-resize",
        drawValue: false,
        onChange: ({ value }) => audio[type].volume = value,
        value: audio[type].bind('volume'),
      })
    ]
  })
}

function VolumeBox() {
  const speakerSlider = VolumeSlider('speaker')
  const micSlider = VolumeSlider('microphone')

  return Widget.Box({
    class_name: "dashboard-box",
    vertical: true,
    children: [
      speakerSlider,
      micSlider,
    ]
  })
}


export function Dashboard() {
  return Widget.Window({
    name: WINDOW_NAME,
    anchor: ['top', 'right'],
    margins: 6,
    keymode: "on-demand",
    visible: "false",
    setup: self => self.keybind("Escape", () => {
      App.closeWindow(WINDOW_NAME)
    }),
    child: Widget.Box({
      class_name: "dashboard",
      vertical: true,
      children: [
        Widget.Box({
          hpack: "fill",
          children: [
            Avatar(),
            Date(),
            PowermenuButton(),
          ]
        }),
        VolumeBox(),
        Media(),
      ]
    }),
  })
}
