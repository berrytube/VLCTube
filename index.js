var VLCPlayer = require('./vlc');
var tube = require('./tube');
var SYNC_ACCURACY = 2;

var vlc = new VLCPlayer();

tube.onVideoChange(function (link, time) {
    vlc.load(link);
    vlc.seek(time);
    vlc.play();
});

tube.onTimeChange(function (time) {
    vlc.getTime(function (t) {
        if (Math.abs(time - t) >= SYNC_ACCURACY) {
            console.log('seekforward', time - t);
            vlc.seek(Math.round(time));
        }
    });
});

tube.onStateChange(function (state) {
    switch (state) {
        case 1:
            vlc.play();
            break;
        case 2:
        case 3:
            vlc.pause();
            break;
    }
});
