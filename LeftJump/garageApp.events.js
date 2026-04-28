// garageApp.events.js
// Time-based event list management (replaces event logic in timeSynch.js)
//
// Remote dispatch envelope schema (JSON string sent over the socket):
// {
//   "targetID" : number,   // recipient app ID, or -1 to broadcast to all clients
//   "senderID" : number,   // Config.appID of the originating client
//   "action"   : string    // JS command string to execute on the target
// }

var GarageApp = GarageApp || {};

GarageApp.Events = (function () {

    var eventList       = [];
    var lastEventParsed = -1;

    // ── Public: add ──────────────────────────────────────────────────────────
    // time      : float, seconds into the video
    // btn       : element ID string or null (reserved for future button-linked events)
    // action    : string of JS to execute via new Function()
    // targetID  : numeric app ID — must match Config.appID, or pass -1 for broadcast
    function add(time, btn, action, targetID) {
        var id = Number(targetID);
        if (id !== GarageApp.Config.appID && id >= 0) {
            console.log("Events.add: skipped — wrong appID (" + targetID + ")");
            return;
        }
        eventList.push({ time: parseFloat(time), btn: btn, action: action });
        console.log("Events.add @" + time + "s : " + action);
    }

    // ── Public: clear ────────────────────────────────────────────────────────
    // Pass -1 (or any value < 0) to clear unconditionally,
    // or pass a specific app ID to only clear when it matches.
    function clear(targetID) {
        var id = Number(targetID);
        if (id === GarageApp.Config.appID || id < 0) {
            reset();
            eventList = [];
            console.log("Events.clear: event list cleared");
        }
    }

    // ── Public: remove ───────────────────────────────────────────────────────
    // Remove the first event whose .btn property matches btnID,
    // searching forward from lastEventParsed.
    function remove(btnID) {
        for (var i = lastEventParsed + 1; i < eventList.length; i++) {
            if (eventList[i].btn === btnID) {
                eventList.splice(i, 1);
                console.log("Events.remove: removed event for btn=" + btnID);
                return;
            }
        }
    }

    // ── Public: reset ────────────────────────────────────────────────────────
    // Reset the parse cursor to -1 (used when seeking or changing clips).
    function reset() {
        lastEventParsed = -1;
    }

    // ── Public: check ────────────────────────────────────────────────────────
    // Called on every ontimeupdate tick.  Fires any events whose time has been
    // reached and that haven't been executed yet.
    function check(currentTime) {
        for (var i = lastEventParsed + 1; i < eventList.length; i++) {
            var ev = eventList[i];
            if (currentTime >= ev.time) {
                console.log("Events.check: firing @" + ev.time + "s : " + ev.action);
                lastEventParsed = i;
                _execute(ev.action);
            }
        }
    }

    // ── Public: doEvent ──────────────────────────────────────────────────────
    // Entry-point for socket-delivered messages.
    // Accepts either:
    //   • A JSON envelope string  → { targetID, senderID, action }
    //     The action is only executed when targetID matches this client's appID
    //     or targetID is -1 (broadcast). Messages sent by this client to itself
    //     are ignored (senderID === Config.appID).
    //   • A plain JS command string (legacy / local timed-event path).
    function doEvent(evData) {
        console.log("Events.doEvent: " + evData);
        try {
            var envelope = JSON.parse(evData);
            // Treat as an envelope only when it has the expected shape.
            if (typeof envelope === "object" && envelope !== null &&
                "targetID" in envelope && "action" in envelope) {
                _handleEnvelope(envelope);
                return;
            }
        } catch (e) {
            // Not JSON — fall through to plain-string execution.
        }
        // Plain command string (local timed events, legacy socket messages).
        _execute(evData);
    }

    // ── Public: dispatch ─────────────────────────────────────────────────────
    // Send a command to a specific remote client (or broadcast to all).
    //
    // targetID : numeric app ID of the intended recipient,
    //            or -1 to broadcast to every connected client.
    // action   : JS command string to execute on the target client,
    //            e.g. "GarageApp.Player.jumpTo(30.0)"
    //
    // Usage examples:
    //   GarageApp.Events.dispatch(2, "GarageApp.Player.jumpTo(30.0)");
    //   GarageApp.Events.dispatch(-1, "GarageApp.Player.pause()");
    function dispatch(targetID, action) {
        var envelope = JSON.stringify({
            targetID : Number(targetID),
            senderID : GarageApp.Config.appID,
            action   : action
        });
        console.log("Events.dispatch → targetID=" + targetID + " action=" + action);
        GarageApp.Socket.send(envelope);
    }

    // ── Private ──────────────────────────────────────────────────────────────

    function _handleEnvelope(envelope) {
        var targetID = Number(envelope.targetID);
        var senderID = Number(envelope.senderID);
        var myID     = GarageApp.Config.appID;

        // Drop messages this client sent to itself (server echo guard).
        if (senderID === myID) {
            console.log("Events._handleEnvelope: ignored own echo from senderID=" + senderID);
            return;
        }

        // Execute only when addressed to this client or broadcast.
        if (targetID === myID || targetID < 0) {
            console.log("Events._handleEnvelope: executing for targetID=" + targetID +
                        " senderID=" + senderID + " action=" + envelope.action);
            _execute(envelope.action);
        } else {
            console.log("Events._handleEnvelope: ignored — targetID=" + targetID +
                        " does not match myID=" + myID);
        }
    }

    function _execute(action) {
        try {
            new Function(action)(); // eslint-disable-line no-new-func
        } catch (e) {
            console.error("Events._execute error for action [" + action + "]:", e);
        }
    }

    return {
        add:      add,
        clear:    clear,
        remove:   remove,
        reset:    reset,
        check:    check,
        doEvent:  doEvent,
        dispatch: dispatch
    };

})();
