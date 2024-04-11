const WINDOW_NAME = "powermenu"

function PowerButtons(command, icon) {
  return Widget.Button({
        class_name: "powermenu-buttons",
        onClicked: () => Utils.execAsync(command),
        child: Widget.Icon({
          class_name: "powermenu-icons",
          icon: icon,
        }),
      })
}

export const powermenu = Widget.Window({
  name: WINDOW_NAME,
  class_name: WINDOW_NAME,
  setup: self => self.keybind("Escape", () => {
        App.closeWindow(WINDOW_NAME)
  }),
  keymode: "exclusive",
  visible: false,
  child: 
  Widget.Box({
    vertical: true,
    children: [
      Widget.Box({
        class_name: "powermenu-box",
        spacing: 8,
        vertical: false,
        hpack: "center",
        children: [
          PowerButtons(`systemctl poweroff`, "system-shutdown-symbolic"),
          PowerButtons(`systemctl reboot`, "system-reboot-symbolic"),
          PowerButtons(`systemtcl suspend`, "system-suspend-symbolic"),
          PowerButtons(`hyprctl dispatch exit 0`, "system-log-out-symbolic"),
          PowerButtons(`swaylock`, "system-lock-screen-symbolic"),
        ]
      }),
      Widget.Label("Powermenu")
    ]
  }),
  })
