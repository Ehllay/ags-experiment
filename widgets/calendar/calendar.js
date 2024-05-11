const WINDOW_NAME = "calendar";

function Calendar() {
  return Widget.Calendar({
    showDayNames: true,
    showDetails: true,
    showHeading: true,
    onDaySelected: ({ date: [y, m, d] }) => {
      print(`${y}. ${m}. ${d}.`)
    },
})
}

export function CalendarWidget() {
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
      class_name: "calendar window-bg",
      vertical: true,
      children: [
        Calendar()
      ]
    }),
  })
}
