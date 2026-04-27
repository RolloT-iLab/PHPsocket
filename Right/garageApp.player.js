// garageApp.player.js
// Video player controls and media event wiring (replaces timeSynch.js player logic)

var GarageApp = GarageApp || {};

GarageApp.Player = (function () {

    var _player          = null;
    var _startButton     = null;
    var _timeCodeDisplay = null;
    var _playStateDisplay = null;
    var _bAutoPlay       = true;

    // ── Public: init ─────────────────────────────────────────────────────────
    // Call once on page load to wire up DOM elements and media event listeners.
    function init() {
        _player           = document.getElementById("vplayer");
        _startButton      = document.getElementById("start");
        _timeCodeDisplay  = document.getElementById("timecode");
        _playStateDisplay = document.getElementById("playState");

        _bindMediaEvents();
        console.log("Player.init: complete");
    }

    // ── Public: setSourceByID ────────────────────────────────────────────────
    // Load a clip from Config.clipList by index, reset events, start from 0.
    function setSourceByID(vID) {
        GarageApp.EventDefs.load(vID);
        console.log("Player.setSourceByID: " + vID);

        GarageApp.Config.curVideo  = GarageApp.Config.clipList[vID];
        GarageApp.Config.curVidNum = vID;

        var vsrc = _buildSrc(GarageApp.Config.curVideo);
        console.log("Player.setSourceByID src: " + vsrc);

        if (_player.src !== vsrc) {
            _player.src = vsrc;
            GarageApp.Events.reset();
        }

        _player.addEventListener("loadedmetadata", function onMeta() {
            _player.currentTime = 0.0;
            _player.removeEventListener("loadedmetadata", onMeta);
        });
    }

    // ── Public: setSourceByName ──────────────────────────────────────────────
    function setSourceByName(vStr) {
        GarageApp.Config.curVideo = vStr;
        var vsrc = _buildSrc(vStr);
        console.log("Player.setSourceByName src: " + vsrc);

        if (_player.src !== vsrc) {
            _player.src = vsrc;
            _player.load();
            GarageApp.Events.reset();
        }

        _player.addEventListener("loadedmetadata", function onMeta() {
            _player.currentTime = 0.0;
            _player.removeEventListener("loadedmetadata", onMeta);
        });
    }

    // ── Public: play ─────────────────────────────────────────────────────────
    function play() {
        var promise = _player.play();
        console.log("Player.play: promise started");

        if (promise !== undefined) {
            promise.then(function () {
                console.log("Player.play: autoplay OK");
                _startButton.style.display = "none";
            }).catch(function (err) {
                console.warn("Player.play: autoplay blocked —", err);
                _startButton.style.display = "block";
            });
        }
    }

    // ── Public: pause ────────────────────────────────────────────────────────
    function pause() {
        _player.pause();
        //_playStateDisplay.innerHTML = "paused";
    }

    // ── Public: togglePause ──────────────────────────────────────────────────
    function togglePause() {
        if (_player.paused) {
            _player.play();
            //_playStateDisplay.innerHTML = "playing";
        } else {
            _player.pause();
           // _playStateDisplay.innerHTML = "paused";
            console.log("Player.togglePause: paused @" + _player.currentTime);
        }
    }

    // ── Public: jumpTo ───────────────────────────────────────────────────────
    function jumpTo(newTime) {
        _player.currentTime = newTime;
        _bAutoPlay = true;
        _showTime();
    }

    // ── Public: appJumpTo ────────────────────────────────────────────────────
    // Jump only when targetID matches this device's appID, or is -1 (broadcast).
    function appJumpTo(newTime, targetID) {
        if (_idMatches(targetID)) {
            _player.currentTime = newTime;
            _bAutoPlay = true;
            _showTime();
        }
    }

    // ── Public: appJumpToPause ───────────────────────────────────────────────
    function appJumpToPause(newTime, targetID) {
        if (_idMatches(targetID)) {
            _player.currentTime = newTime;
            _bAutoPlay = false;
        }
    }

    // ── Public: changeTheme ──────────────────────────────────────────────────
    function changeTheme(themeValue) {
        console.log("Player.changeTheme: " + themeValue);
        _player.pause();
        GarageApp.Config.curTheme = themeValue;
        var vsrc = _buildSrc(GarageApp.Config.curVideo);
        if (_player.src !== vsrc) {
            _player.src = vsrc;
        }
        _player.addEventListener("loadedmetadata", function onMeta() {
            _player.currentTime = GarageApp.Config.curVTime || 0;
            _player.removeEventListener("loadedmetadata", onMeta);
        });
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    function _buildSrc(videoName) {
        var theme = GarageApp.Config.curTheme;
        if (theme === 1) return "vid/" + videoName + "-low.mp4";
        if (theme === 2) return "vid/" + videoName + "-high.mp4";
        return "vid/" + videoName + ".mp4";
    }

    function _idMatches(targetID) {
        var id = Number(targetID);
        return id === GarageApp.Config.appID || id < 0;
    }

    function _showTime() {
        _timeCodeDisplay.innerHTML = String(_player.currentTime);
        _playStateDisplay.innerHTML = _player.paused ? "paused" : "playing";
    }

    function _bindMediaEvents() {

        _player.oncanplay = function () {
            console.log("Player: canplay — src: " + _player.src);
            if (_bAutoPlay) { play(); }
        };

        _player.onplay = function () {
            console.log("Player: play @" + _player.currentTime);
            _showTime();
        };

        _player.onplaying = function () {
            console.log("Player: playing");
        };

        _player.onended = function () {
            console.log("Player: ended");
			//hardcoded to loop to wave entry loop point
			jumpTo(79.0);
            var loop = GarageApp.Config.bLoop;
            if (loop === true || (typeof loop === "number" && loop !== 0)) {
                if (typeof loop === "number" && loop > 0) {
                    GarageApp.Config.curLoopNum++;
                    if (GarageApp.Config.curLoopNum >= loop) {
                        GarageApp.Config.bLoop = false;
                        return;
                    }
                }
                jumpTo(0.0);
            }
        };

        _player.onpause = function () {
            _playStateDisplay.innerHTML = "paused";
        };

        _player.onseek = function () {
            console.log("Player: seek @" + _player.currentTime);
        };

        _player.ontimeupdate = function () {
            _showTime();
            GarageApp.Events.check(_player.currentTime);
        };
    }

    return {
        init:            init,
        setSourceByID:   setSourceByID,
        setSourceByName: setSourceByName,
        play:            play,
        pause:           pause,
        togglePause:     togglePause,
        jumpTo:          jumpTo,
        appJumpTo:       appJumpTo,
        appJumpToPause:  appJumpToPause,
        changeTheme:     changeTheme
    };

})();
