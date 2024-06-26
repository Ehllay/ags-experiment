const hyprland = await Service.import("hyprland")
const notifications = await Service.import("notifications")
const mpris = await Service.import("mpris")
const audio = await Service.import("audio")
const network = await Service.import("network")
const battery = await Service.import("battery")
const systemtray = await Service.import("systemtray")

import { Dashboard } from "../dashboard/dashboard.js"
import { RoundedAngleEnd } from "../corners/RoundedAngle.js"

const date = Variable("", {
    poll: [1000, 'date "+%H:%M"'],
})

const update_count = Variable("", {
    poll: [300000, 'bash -c "checkupdates | wc -l"'],
})

// widgets can be only assigned as a child in one container
// so to make a reuseable widget, make it a function
// then you can simply instantiate one by calling it

function Launcher() {
  return Widget.Button({
    class_name: "launcher",
    child: Widget.Label(""),
  })
}

function Workspaces() {
    const activeId = hyprland.active.workspace.bind("id")
    const workspaces = hyprland.bind("workspaces")
        .as(ws => 
          ws
          .sort((a, b) => a.id - b.id)
          .map(({ id }) => Widget.Button({
            on_clicked: () => hyprland.messageAsync(`dispatch workspace ${id}`),
            child: Widget.Label(`${id}`),
            class_name: activeId.as(i => `${i === id ? "focused" : "workspaces"}`),
        })))

    return Widget.Box({
        class_name: "workspaces",
        children: workspaces,
    })
}

function RunUpdate() {
  return Utils.execAsync(`kitty -e bash -c "paru && notify-send -i /usr/share/icons/Papirus-Dark/16x16/actions/system-upgrade.svg 'The system has been upgraded'"`)
}

function Updates() {
  return Widget.Button({
    class_name: "updates",
    on_clicked: () => RunUpdate(),
    visible: update_count.bind().as(t => t != 0),
    child: Widget.Box({
      visible: false,
      children: [
        Widget.Icon({
          icon: "software-update-available-symbolic",
        }),
        Widget.Label({
          label: update_count.bind(),
        }),
      ]
    })
  })
}

function ClientTitle() {
    return Widget.Label({
      truncate: 'end',
      maxWidthChars: 100,
      wrap: true,
      class_name: "client-title",
      label: hyprland.active.client.bind('title'),
  })
}


function Clock() {
    return Widget.Box({
        class_name: "clock",
        children: [
      Widget.Icon({
        icon: "appointment-soon-symbolic",
      }),
      Widget.Label({
        label: date.bind(),
      }),
    ]

    })
}


// we don't need dunst or any other notification daemon
// because the Notifications module is a notification daemon itself
function Notification() {
    const popups = notifications.bind("popups")
    return Widget.Box({
        visible: popups.as(p => p.length > 0),
        children: [
            Widget.Icon({
                icon: "preferences-system-notifications-symbolic",
            }),
        ],
    })
}


function Media() {
  const label = Utils.watch("", mpris, "player-changed", () => {
    if (mpris.players[0]) {
        const { track_artists, track_title } = mpris.players[0]
        return `${track_artists.join(", ")} - ${track_title}`
    } else {
        return "Nothing is playing"
    }
  })

  const icon = Utils.watch("", mpris, "player-changed", () => {
    if (mpris.players[0]) {
      switch (mpris.getPlayer("")?.play_back_status) {
        case "Playing": return "media-playback-pause-symbolic";
        case "Paused": return "media-playback-start-symbolic";
        default: return "audio-x-generic-symbolic";
      }
    } else {
      return "media-playback-start-symbolic";
    }
  })


  return Widget.EventBox({
    tooltip_text: label, 
    child: Widget.Box({
      class_name: "media",
      hpack: "center",
      visible: mpris.bind("players").as(p => p.length > 0),
      children: [
        Widget.Button({
          class_name: "media-button",
          on_primary_click: () => mpris.getPlayer("")?.previous(),
          child: Widget.Icon("media-skip-backward-symbolic")
        }),
        Widget.Button({
          class_name: "media-button",
          on_primary_click: () => mpris.getPlayer("")?.playPause(),
          on_scroll_up: () => mpris.getPlayer("")?.next(),
          on_scroll_down: () => mpris.getPlayer("")?.previous(),
          child: Widget.Icon({icon})
        }),
        Widget.Button({
          class_name: "media-button",
          on_primary_click: () => mpris.getPlayer("")?.next(),
          child: Widget.Icon("media-skip-forward-symbolic")
        }),
      ]
    })
  })
}

function Volume() {
    const icons = {
        101: "overamplified",
        67: "high",
        34: "medium",
        1: "low",
        0: "muted",
    }

    function getIcon() {
        const icon = audio.speaker.stream?.is_muted ? 0 : [101, 67, 34, 1, 0].find(
            threshold => threshold <= audio.speaker.volume * 100)

        return `audio-volume-${icons[icon]}-symbolic`
    }

    const icon = Widget.Icon({
        class_name: "volume-icon",
        icon: Utils.watch(getIcon(), audio.speaker, getIcon),
    })

    const circle = Widget.CircularProgress({
        class_name: "circular-progress",
        startAt: 0.75,
        rounded: false,
        inverted: false,
        value: audio.speaker.bind('volume'),
        child: icon,
    })
    
    let vol = audio.speaker.bind('volume').transform(x => `${Math.round(x * 100)}%`);
    
    
    const revealer = Widget.Revealer({
    revealChild: false,
    transitionDuration: 750,
    transition: 'slide_left',
    child: Widget.Label({label: vol,}),
  })

    return Widget.EventBox({
        on_scroll_up: () => audio.speaker.volume += 0.01,
        on_scroll_down: () => audio.speaker.volume -= 0.01,
        on_middle_click: () => Utils.exec('pactl set-sink-mute @DEFAULT_SINK@ toggle'),
        on_hover: w => w.child.children[1].revealChild = true,
        on_hover_lost: w => w.child.children[1].revealChild = false,
        child: Widget.Box({
          children: [
            circle,
            revealer,
          ]
      }),
    })
}


function BatteryLabel() {
    const value = battery.bind("percent").as(p => p > 0 ? p / 100 : 0)
    const icon = battery.bind("percent").as(p =>
        `battery-level-${Math.floor(p / 10) * 10}-symbolic`)

    return Widget.Box({
        class_name: "battery",
        visible: battery.bind("available"),
        children: [
            Widget.Icon({ icon }),
            Widget.LevelBar({
                widthRequest: 140,
                vpack: "center",
                value,
            }),
        ],
    })
}

function Network() {
  const icon = Widget.Icon().hook(network, self => {
    const icon = network[network.primary || "wifi"]?.icon_name
    self.icon = icon || ""
    self.visible = !!icon
  })

   return Widget.Box({
      children: [ icon ],
    })
}


function SysTray() {
    const items = systemtray.bind("items")
        .as(items => items.map(item => Widget.Button({
            class_name: "systray",
            child: Widget.Icon({ icon: item.bind("icon") }),
            on_primary_click: (_, event) => item.activate(event),
            on_secondary_click: (_, event) => item.openMenu(event),
            tooltip_markup: item.bind("tooltip_markup"),
        })))

    return Widget.Box({
        children: items,
    })
}

function QuickSettings() {
  return Widget.EventBox({
    class_name: "quick-settings",
    on_primary_click: () => App.toggleWindow("dashboard"),
    child: Widget.Box({
      children: [
        Network(),
        Volume(),
      ],
    })
  })
}


// layout of the bar
function Left() {
  return Widget.Box({
    class_name: "left",
    children: [
      Widget.Box({
        class_name: "l-ws-box",
        children: [
          Launcher(),
          Workspaces(),
        ]
      }),
      RoundedAngleEnd("topright"),
      Media(),
      Updates(),
    ],
  })
}

function Center() {
    return Widget.Box({
        class_name: "center",
        visible: hyprland.active.client.bind("title").as(t => t != ""),
        children: [
            RoundedAngleEnd("topleft"),
            Widget.Box({
              children: [ClientTitle()]}),
            RoundedAngleEnd("topright"),
        ],
    })
}

function Right() {
    return Widget.Box({
        hpack: "end",
        children: [
            RoundedAngleEnd("topleft"),
            Widget.Box({
            class_name: "right",
            children: [
              Notification(),
              SysTray(),
              //BatteryLabel(),
              QuickSettings(),
              Clock(),
            ]})
        ],
    })
}

export default monitor => Widget.Window ({
    name: `bar-${monitor}`, // name has to be unique
    class_name: "bar",
    monitor,
    anchor: ["top", "left", "right"],
    exclusivity: "exclusive",
    child: Widget.CenterBox({
        start_widget: Left(),
        center_widget: Center(),
        end_widget: Right(),
    }),
})
