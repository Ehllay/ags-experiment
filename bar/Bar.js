const hyprland = await Service.import("hyprland")
const notifications = await Service.import("notifications")
const mpris = await Service.import("mpris")
const audio = await Service.import("audio")
const network = await Service.import("network")
const battery = await Service.import("battery")
const systemtray = await Service.import("systemtray")

const date = Variable("", {
    poll: [1000, 'date "+%H:%M"'],
})

// widgets can be only assigned as a child in one container
// so to make a reuseable widget, make it a function
// then you can simply instantiate one by calling it

function Workspaces() {
    const activeId = hyprland.active.workspace.bind("id")
    const workspaces = hyprland.bind("workspaces")
        .as(ws => ws.map(({ id }) => Widget.Button({
            on_clicked: () => hyprland.messageAsync(`dispatch workspace ${id}`),
            child: Widget.Label(`${id}`),
            class_name: activeId.as(i => `${i === id ? "focused" : ""}`),
        })))

    return Widget.Box({
        class_name: "workspaces",
        children: workspaces,
    })
}


function ClientTitle() {
    return Widget.Label({
        class_name: "client-title",
        label: hyprland.active.client.bind('title'),
        visible: hyprland.active.client.bind('address').as(addr => !!addr),    
  })
}


function Clock() {
    return Widget.Box({
        class_name: "clock",
        children: [
      Widget.Icon({
        icon: "clock",
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
        class_name: "notification",
        visible: popups.as(p => p.length > 0),
        children: [
            Widget.Icon({
                icon: "preferences-system-notifications-symbolic",
            }),
            Widget.Label({
                label: popups.as(p => p[0]?.summary || ""),
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

    return Widget.Button({
        class_name: "media",
        on_primary_click: () => mpris.getPlayer("")?.playPause(),
        on_scroll_up: () => mpris.getPlayer("")?.next(),
        on_scroll_down: () => mpris.getPlayer("")?.previous(),
        child: Widget.Label({ label }),
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
    transition: 'slide_right',
    child: Widget.Label({label: vol,}),
  })

    return Widget.EventBox({
        on_scroll_up: () => audio.speaker.volume += 0.01,
        on_scroll_down: () => audio.speaker.volume -= 0.01,
        on_middle_click: () => console.log(volume),
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
  if (network.bind("primary") == "wifi") {
   return Widget.Box({
      children: [
        Widget.Icon({
            icon: network.wifi.bind('icon_name'),
        }),
        Widget.Label({
            label: network.wifi.bind('ssid')
                .as(ssid => ssid || 'Unknown'),
        }),
      ],
    })
  }
}


function SysTray() {
    const items = systemtray.bind("items")
        .as(items => items.map(item => Widget.Button({
            child: Widget.Icon({ icon: item.bind("icon") }),
            on_primary_click: (_, event) => item.activate(event),
            on_secondary_click: (_, event) => item.openMenu(event),
            tooltip_markup: item.bind("tooltip_markup"),
        })))

    return Widget.Box({
      class_name: "systray",
        children: items,
    })
}


// layout of the bar
function Left() {
    return Widget.Box({
        class_name: "left",
        spacing: 8,
        children: [
            Workspaces(),
            Media(),
        ],
    })
}

function Center() {
    return Widget.Box({
        class_name: "center",
        spacing: 8,
        children: [
            ClientTitle(),
        ],
    })
}

function Right() {
    return Widget.Box({
        class_name: "right",
        hpack: "end",
        spacing: 8,
        children: [
            Notification(),
            SysTray(),
            Network(),
            Volume(),
            Clock(),
            //BatteryLabel(),
        ],
    })
}

export default (monitor = 0) => Widget.Window ({
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
