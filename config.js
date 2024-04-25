import Gio from "gi://Gio";

import Bar from "./bar/Bar.js"
import { NotificationPopups } from "./notifications/Notifications.js"
import { applauncher } from "./applauncher/applauncher.js"
import { powermenu } from "./powermenu/powermenu.js";
import { Dashboard } from "./dashboard/dashboard.js";

App.config({
    style: "./styles/main.css",
    windows: [
        Bar(0),
        //NotificationPopups(),
        applauncher,
        powermenu,
        Dashboard(),
        NotificationPopups(),

        // you can call it, for each monitor
        // Bar(1)
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
