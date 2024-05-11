import Gio from "gi://Gio";
import Gdk from 'gi://Gdk';

import Bar from "./widgets/bar/Bar.js"
import { NotificationPopups } from "./widgets/notifications/Notifications.js"
import { applauncher } from "./widgets/applauncher/applauncher.js"
import { powermenu } from "./widgets/powermenu/powermenu.js";
import { Dashboard } from "./widgets/dashboard/dashboard.js";


function range(length, start = 1) {
    return Array.from({ length }, (_, i) => i + start);
}

function forMonitors(widget) {
    const n = Gdk.Display.get_default()?.get_n_monitors() || 1;
    return range(n, 0).map(widget).flat(1);
}

App.config({
    style: "./styles/main.css",
    windows: [
        ...forMonitors(Bar),
        applauncher,
        powermenu,
        Dashboard(),

        //NotificationPopups(),
    ],
})

const applyScss = () => {
  // Compile scss
  //Utils.exec(`sassc ${App.configDir}/styles/main.scss ${App.configDir}/styles/style.css`);
  //console.log("Scss compiled");

  // Apply compiled css
  App.resetCss();
  App.applyCss(`${App.configDir}/styles/main.css`);
  //console.log("Compiled css applied");
};

Utils.monitorFile(`${App.configDir}/styles/`, (_, eventType) => {
  if (eventType === Gio.FileMonitorEvent.CHANGES_DONE_HINT) {
    applyScss();
  }
});

applyScss();

export {    }
