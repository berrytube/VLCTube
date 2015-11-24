var spawn = require('child_process').spawn;
var connect = require('net').connect;
var existsSync = require('fs').existsSync;

var WINDOWS_VLC = [
    'C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe',
    'C:\\Program Files\\VideoLAN\\VLC\\vlc.exe'
];

function VLCPlayer(executable, port, readyCallback) {
    if (!executable) {
        executable = 'vlc';
        if (process.platform == 'win32'){
            WINDOWS_VLC.forEach(function (path) {
                if (existsSync(path)){
                    executable = path;
                }
            });
        }
    }

    if (!port){
        port = 7564;
    }

    spawn(executable,
        ['--extraintf', 'rc', '--rc-host', 'localhost:' + port],
        { stdio: 'ignore' }
    );

    this.initialized = false;
    var self = this;
    var warmup = setInterval(function () {
        self.sock = connect({ port: port }, function () {
            clearInterval(warmup);
            self.sock.on('data', self.handleData.bind(self));
            self.sock.on('end', self.handleEnd.bind(self));
            if (readyCallback) {
                readyCallback();
            }
        });

        self.sock.on('error', function (error) {
            if (!self.initialized) {
                self.sock.destroy();
            } else {
                console.error('Socket error: ' + error);
            }
        });
    }, 500);

    this.waiting = [];
}

VLCPlayer.prototype = {
    handleData: function (data) {
        data = (data+'').trim('\n');
        if (data.trim() !== '>') {
            console.log(data);
        }

        if (this.waiting.length > 0) {
            var fn = this.waiting.shift();
            setImmediate(function () {
                fn(data);
            });
        }
    },

    handleEnd: function(){
        console.log('socket ended');
        process.exit(0);
    },

    play: function () {
        if (!this.sock) {
            return;
        }

        this.sock.write('play\n');
    },

    pause: function () {
        if (!this.sock) {
            return;
        }

        this.sock.write('pause\n');
    },

    getTime: function (cb) {
        this.sock.write('get_time\n');
        this.waiting.push(function (data) {
            cb(parseInt(data));
        });
    },

    seek: function (to) {
        if (!this.sock) {
            return;
        }

        if (to < 0) {
            this.pause();
            return;
        } else {
            this.play();
        }

        this.sock.write('seek ' + to + '\n');
    },

    load: function (link) {
        if (!this.sock) {
            return;
        }

        this.sock.write('clear\nadd ' + link + '\n');
    }
};

module.exports = VLCPlayer;
