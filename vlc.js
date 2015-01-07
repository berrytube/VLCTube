var spawn = require('child_process').spawn;
var connect = require('net').connect;
var existsSync = require('fs').existsSync;

function VLCPlayer(executable, port) {
    if ( !executable ){
        executable = 'vlc';
        if ( process.platform == 'win32' ){
            [
                'C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe',
                'C:\\Program Files\\VideoLAN\\VLC\\vlc.exe'
            ].forEach(function(path){
                if ( existsSync(path) ){
                    executable = path;
                }
            });
        }
    }

    if ( !port ){
        port = 7564;
    }

    spawn(
        executable,
        ['--extraintf', 'rc', '--rc-quiet', '--rc-host', 'localhost:' + port],
        {'stdio': 'ignore'}
    );

    this.sock = connect({
        'host': 'localhost',
        'port': port
    })
    this.sock.on('data', this.handleData.bind(this));
    this.sock.on('end', this.handleEnd.bind(this));

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
        this.sock = null;
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
