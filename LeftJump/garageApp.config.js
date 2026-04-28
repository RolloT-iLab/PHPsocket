// garageApp.config.js
// App configuration and event definitions (replaces timeEvents.js)

var GarageApp = GarageApp || {};

GarageApp.Config = (function () {

    var appID     = 0;
    var curVideo  = 'DelanieJumpLoop';
    var curVidNum = 0;
    var bLoop     = false;       // false = no loop, true = infinite, int N = loop N times
    var curLoopNum = 0;
    var clipList  = ['DelanieJumpLoop'];
    var curTheme  = 0;

    return {
        get appID()      { return appID; },
        get curVideo()   { return curVideo; },
        set curVideo(v)  { curVideo = v; },
        get curVidNum()  { return curVidNum; },
        set curVidNum(v) { curVidNum = v; },
        get bLoop()      { return bLoop; },
        set bLoop(v)     { bLoop = v; },
        get curLoopNum() { return curLoopNum; },
        set curLoopNum(v){ curLoopNum = v; },
        get clipList()   { return clipList; },
        get curTheme()   { return curTheme; },
        set curTheme(v)  { curTheme = v; }
    };

})();


GarageApp.EventDefs = (function () {

    // Add timed event definitions per clip ID.
    // Each entry calls GarageApp.Events.add(time, btnID, actionString, targetAppID).
    //
    // actionString is eval'd at runtime — keep to single GarageApp.* calls where possible.
    // targetAppID : match Config.appID to target this device only, or pass -1 to broadcast.

    function load(vID) {
        console.log("EventDefs.load: vID=" + vID);

        GarageApp.Events.clear(-1);   // clear all events before repopulating

        // Global event present on every clip
        GarageApp.Events.add(0.6, null, "GarageApp.Player.pause()", -1);

        if (vID === 0) {
            // Clip 0 — omniClip1
            // Uncomment to re-enable proto API events:
            // GarageApp.Events.add(0.0, null, "GarageApp.UI.showButton('subNav')", 0);
        }

        if (vID === 1) {
            // Clip 1 — 1-5
            // GarageApp.Events.add(0.0,  null, "GarageApp.UI.hideButton('subNav')", -1);
            // GarageApp.Events.add(4.5,  null, "GarageApp.Player.jumpTo(0.0)", -1);
            // GarageApp.Events.add(22.0, null, "GarageApp.Player.pause()", -1);
        }
    }

    return { load: load };

})();
