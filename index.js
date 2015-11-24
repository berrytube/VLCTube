var VLCPlayer = require('./vlc');
var SYNC_ACCURACY = 2;

var vlc = new VLCPlayer(process.argv[2], process.argv[3], function onReady() {
    var tube = require('./tube');
    tube.onVideoChange(function (link, time) {
        vlc.load(link);
        vlc.seek(time);
        vlc.play();
    });

    tube.onTimeChange(function (time) {
        vlc.getTime(function (t) {
            if (Math.abs(time - t) >= SYNC_ACCURACY) {
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
});
