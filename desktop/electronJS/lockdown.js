// lockdown.js This is for future developement and other lockdown stuff
const psList = require("ps-list");
const { exec } = require("child_process");
const path = require("path");

let lockdownInterval;


function startLockdown() {
  
}

function stopLockdown() {
  clearInterval(lockdownInterval);
}

module.exports = { startLockdown, stopLockdown };
