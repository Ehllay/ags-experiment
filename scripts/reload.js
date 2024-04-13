#!/usr/bin/env -S ags --run-file
const applyScss = () => {
  App.resetCss();
  App.applyCss(`${App.configDir}/styles/main.css`);
};

applyScss()

