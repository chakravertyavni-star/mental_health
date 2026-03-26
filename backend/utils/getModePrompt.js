const therapistMode = require("../ai/therapistMode");
const coachMode = require("../ai/coachMode");
const friendMode = require("../ai/friendMode");

function getModePrompt(mode) {

    if (mode === "coach") return coachMode;

    if (mode === "friend") return friendMode;

    return therapistMode; // default
}

module.exports = getModePrompt;