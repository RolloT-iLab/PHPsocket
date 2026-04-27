// garageApp.ui.js
// DOM helpers and button factory (replaces button logic in timeSynch.js)

var GarageApp = GarageApp || {};

GarageApp.UI = (function () {

    var _buttonHolder = null;

    function init() {
        _buttonHolder = document.getElementById("buttonHolder");
        console.log("UI.init: complete");
    }

    // ── Button factory ───────────────────────────────────────────────────────

    // Invisible overlay button — captures student interaction at a screen region.
    function makeButton(bID, bY, bX, bWide, bHigh, bFunc) {
        _createButton(bID, bY, bX, bWide, bHigh, bFunc, "overlayButton", false);
    }

    // Full-screen background button — captures incorrect/off-target taps.
    function makeButtonBack(bID, bY, bX, bWide, bHigh, bFunc) {
        _createButton(bID, bY, bX, bWide, bHigh, bFunc, "overlayButtonBackground", false);
    }

    // Labelled dev-tool button — always visible, useful during development.
    function makeButtonTool(bID, bY, bX, bWide, bHigh, bFunc) {
        _createButton(bID, bY, bX, bWide, bHigh, bFunc, "overlayButton", true);
    }

    // ── Visibility helpers ───────────────────────────────────────────────────

    function hideButton(bID) {
        var el = document.getElementById(bID);
        if (el) {
            el.style.display = "none";
            console.log("UI.hideButton: " + bID);
        }
    }

    function showButton(bID) {
        var el = document.getElementById(bID);
        if (el) {
            el.style.display = "block";
            console.log("UI.showButton: " + bID);
        }
    }

    // ── Private ──────────────────────────────────────────────────────────────

    function _createButton(bID, bY, bX, bWide, bHigh, bFunc, cssClass, showLabel) {
        console.log("UI._createButton: " + bID + " fn=" + bFunc);
        var btn = document.createElement("BUTTON");
        btn.id        = bID;
        btn.value     = bFunc;
        btn.className = cssClass;
        btn.style.top    = bY;
        btn.style.left   = bX;
        btn.style.width  = bWide;
        btn.style.height = bHigh;
        if (showLabel) { btn.innerHTML = bID; }
        btn.addEventListener("click", function () {
            GarageApp.Events.doEvent(btn.value);
        });
        (_buttonHolder || document.getElementById("buttonHolder")).appendChild(btn);
    }

    return {
        init:           init,
        makeButton:     makeButton,
        makeButtonBack: makeButtonBack,
        makeButtonTool: makeButtonTool,
        hideButton:     hideButton,
        showButton:     showButton
    };

})();
