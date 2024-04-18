const audio = await Service.import('audio')

import { Media } from "../media/Media.js"


const WINDOW_NAME = "dashboard"

const VolumeSlider = (type = 'speaker') => Widget.Slider({
    hexpand: true,
    drawValue: false,
    visible: audio[type].bind('id').as(p => p != null),
    onChange: ({ value }) => audio[type].volume = value,
    value: audio[type].bind('volume'),
})

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
