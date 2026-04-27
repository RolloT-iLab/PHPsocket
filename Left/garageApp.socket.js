// garageApp.socket.js
// WebSocket connection — decoupled from index.html inline script.
// Incoming message strings are forwarded directly to GarageApp.Events.doEvent().

var GarageApp = GarageApp || {};

GarageApp.Socket = (function () {

    var _socket      = null;
    var _messagesDiv = null;

    // Default host — override by passing a wsURL to init().
    var _defaultURL = "ws://192.168.0.105:8080";
	_defaultURL = "ws://localhost:8080";
	
    // ── Public: init ─────────────────────────────────────────────────────────
    // wsURL (optional) : WebSocket server address.
    //                    Falls back to _defaultURL when omitted.
    function init(wsURL) {
        _messagesDiv = document.getElementById("messages");
        var url = wsURL || _defaultURL;

        console.log("Socket.init: connecting to " + url);
        _socket = new WebSocket(url);

        _socket.onerror = function (error) {
            console.error("Socket error:", error);
            _log("Socket error — see console");
        };

        _socket.onopen = function () {
            console.log("Socket.onopen: connected to " + _socket.url);
            _log("Connected → " + _socket.url);
        };

        _socket.onmessage = function (event) {
            console.log("Socket.onmessage: " + event.data);
            _log(event.data);
            GarageApp.Events.doEvent(event.data);
        };

        _socket.onclose = function () {
            console.log("Socket.onclose: disconnected");
            _log("Disconnected");
        };
    }

    // ── Public: send ─────────────────────────────────────────────────────────
    // Utility for sending a command string to the server (future use).
    function send(message) {
        if (_socket && _socket.readyState === WebSocket.OPEN) {
            _socket.send(message);
        } else {
            console.warn("Socket.send: socket not open, message dropped:", message);
        }
    }

    // ── Public: disconnect ───────────────────────────────────────────────────
    function disconnect() {
        if (_socket) { _socket.close(); }
    }

    // ── Private ──────────────────────────────────────────────────────────────
    function _log(text) {
        if (_messagesDiv) { _messagesDiv.value = text; }
    }

    return {
        init:       init,
        send:       send,
        disconnect: disconnect
    };

})();
