var io = require('socket.io-client');
var socket = io.connect('96.127.152.99:8344');
var links = require('./links');

var newVideoListeners = [];
var timeChangeListeners = [];
var stateChangeListeners = [];

var lastState = -1;

socket.emit('myPlaylistIsInited');
socket.on('forceVideoChange', handleNewVideo);
socket.on('createPlayer', handleNewVideo);
socket.on('hbVideoDetail', handleTimeChange);

function handleNewVideo(data) {
    var cb = function (link) {
        if (link) {
            emitLink(link, data.time);
        }
    };

    switch (data.video.videotype) {
        case 'yt':
            links.youtube(data.video.videoid, cb);
            break;
        case 'vimeo':
            links.vimeo(data.video.videoid, cb);
            break;
        case 'dailymotion':
            links.dailymotion(data.video.videoid, cb);
            break;
        case 'soundcloud':
            links.soundcloud(data.video.videoid, cb);
            break;
        case 'osmf':
            links.osmf(data.video.videoid, cb);
            break;
        default:
            break;
    }
}

function handleTimeChange(data) {
    emitTimeChange(data.time);
    if (data.state !== lastState) {
        lastState = data.state;
        emitStateChange(data.state);
    }
}

function emitLink(link, inittime) {
    newVideoListeners.forEach(function (fn) {
        setImmediate(function () {
            fn(link, inittime);
        });
    });
}

function emitTimeChange(time) {
    timeChangeListeners.forEach(function (fn) {
        setImmediate(function () {
            fn(time);
        });
    });
}

function emitStateChange(state) {
    stateChangeListeners.forEach(function (fn) {
        setImmediate(function () {
            fn(state);
        });
    });
}

module.exports = {
    onVideoChange: function (cb) {
        newVideoListeners.push(cb);
    },

    onTimeChange: function (cb) {
        timeChangeListeners.push(cb);
    },

    onStateChange: function (cb) {
        stateChangeListeners.push(cb);
    }
};
