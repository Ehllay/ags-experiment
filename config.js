import Bar from "./bar/Bar.js"
import { NotificationPopups } from "./notifications/Notifications.js"
import { applauncher } from "./applauncher/applauncher.js"

App.config({
    style: "./styles/style.css",
    windows: [
        Bar(0),
        //NotificationPopups(),
        applauncher,

        // you can call it, for each monitor
        // Bar(1)
    ],
})

export {    }
