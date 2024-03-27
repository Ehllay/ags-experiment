import Bar from "./bar/Bar.js"
import { applauncher } from "./applauncher/applauncher.js"

App.config({
    style: "./style.css",
    windows: [
        Bar(),
        applauncher,

        // you can call it, for each monitor
        // Bar(0),
        // Bar(1)
    ],
})

export {    }
