const audio = await Service.import('audio')

import { Media } from "../media/Media.js"


const WINDOW_NAME = "dashboard"

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


export const dashboard = Widget.Window({
  name: WINDOW_NAME,
  anchor: ['top', 'right'],
  margins: 6,
  keymode: "none",
  visible: "false",
  child: Widget.Box({
    class_name: "dashboard",
    vertical: true,
    children: [
      VolumeBox(),
      Media(),
    ]
  }),

})
