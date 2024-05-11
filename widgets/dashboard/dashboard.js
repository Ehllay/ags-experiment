const audio = await Service.import('audio')

import { Media } from "../media/Media.js"

const WINDOW_NAME = "dashboard"

function upperCaseFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const date = Variable("", {
  poll: [43_200_000, `bash -c "LC_TIME=en_US.UTF-8 date +'%A, %d %B, %Y'"`],
})

const uptime = Variable("", {
  poll: [60_000, "uptime -p", time =>
        "󰔟 ".concat(time.replace(/up|,/g, '').replace(/\b(days?|hours?|minutes?)\b/g, match => match.charAt(0)).trim()),
    ],
});

const host = upperCaseFirstLetter(Utils.exec(`bash -c "hostnamectl hostname"`))
const user = upperCaseFirstLetter(Utils.exec(`whoami`))

function Avatar() {
  return Widget.Box({
    class_name: "dashboard-image",
    vpack: "start",
    css: `background-image: url('${App.configDir}/../../.face.icon')`
  })
}

function Info() {
  return Widget.Box({
    css: "font-size: 16px;",
    vertical: true,
    vpack: "center",
    children: [
      Widget.Label({
        class_name: "dashboard-date",
        label: date.bind(),
      }),
      Widget.Label({
        class_name: "dashboard-info",
        hpack: "start",
        label: uptime.bind(),
      }),
      Widget.Label({
        hpack: "start",
        class_name: "dashboard-info",
        label: ` ${user}\n󰍹 ${host}`,
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

/** @param {'speaker' | 'microphone'} type */
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

  let vol = audio.speaker.bind('volume').transform(x => `${Math.round(x * 100)}%`);

  return Widget.Box({
    class_name: "slider-box",
    visible: audio[type].bind('id').as(p => p != null),
    children: [
      icon,
      Widget.Slider({
        class_name: "volume-slider",
        hexpand: true,
        cursor: "ew-resize",
        drawValue: false,
        onChange: ({ value }) => audio[type].volume = value,
        value: audio[type].bind('volume'),
        tooltip_text: vol,
      })
    ]
  })
}

const MixerItem = (stream) => Widget.Box({
  class_name: "mixer-item",
  children: [
    Widget.Icon({
      class_name: "dashboard-volume-icons",
      tooltip_text: stream.bind("description").as(n => n || ""),
      icon: stream.bind("name").transform(n => {
          const name = `${n.toLowerCase()}-symbolic`
          return Utils.lookUpIcon(name) ? name : "audio-volume-high-symbolic"
      })
    }),
    Widget.Slider({
      class_name: "volume-slider",
      hexpand: true,
      cursor: "ew-resize",
      drawValue: false,
      onChange: ({ value }) => stream.volume = value,
      value: stream.bind('volume'),
      tooltip_text: stream.bind('volume').transform(x => `${Math.round(x * 100)}%`),
    }),
  ]
})

function VolumeBox() {
  const speakerSlider = VolumeSlider('speaker')
  const micSlider = VolumeSlider('microphone')


  const revealer = Widget.Revealer({
    revealChild: false,
    transitionDuration: 750,
    transition: 'slide_down',
    child: Widget.Box({
      vertical: true,
      children: audio.bind("apps").as(a => a.map(MixerItem))
    }),
  })

  return Widget.Box({
    class_name: "dashboard-box",
    vertical: true,
    children: [
      Widget.Box({
        children: [
          speakerSlider,
          Widget.EventBox({
            attribute: {toggled: false},
            visible: audio.bind("apps").as(p => p.length > 0),
            setup: (self) => {
              self.on("button-press-event", (self) => {
                if (self.attribute.toggled === false) {
                  self.parent.parent.children[1].revealChild = true;
                  self.attribute.toggled = true;
                  self.child.css = "-gtk-icon-transform: rotate(90deg);";
                }
                else {
                  self.parent.parent.children[1].revealChild = false; 
                  self.attribute.toggled = false;
                  self.child.css = "-gtk-icon-transform: rotate(0deg);";
                }
              });
            },
            class_name: "mixer-button",
            child: Widget.Icon("pan-down-symbolic")
          }),
      ]}),
      revealer,
      micSlider,
    ]
  })
}


export function Dashboard() {
  return Widget.Window({
    name: WINDOW_NAME,
    anchor: ['top', 'right'],
    keymode: "on-demand",
    visible: "false",
    setup: self => {
      self.keybind("Escape", () => {
        App.closeWindow(WINDOW_NAME)
      })
    },
    child: Widget.Box({
      class_name: "dashboard window-bg",
      vertical: true,
      children: [
        Widget.CenterBox({
          start_widget: Avatar(),
          center_widget: Info(),
          end_widget: PowermenuButton(),
        }),
        VolumeBox(),
        Media(),
      ]
    }),
  })
}
