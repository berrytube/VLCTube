var spawn = require('child_process').spawn;

function VLCPlayer(link) {
    var args = ['--extraintf', 'rc'];
    if (link != null) {
        args.unshift(link);
    }

    this.vlc = spawn('vlc', args);
    this.vlc.stdout.on('data', this.handleStdout.bind(this));
    this.vlc.stderr.on('data', this.handleStderr.bind(this));
    this.vlc.on('close', this.handleClose.bind(this));

    this.waiting = [];
}

VLCPlayer.prototype = {
    handleStdout: function (data) {
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

    handleStderr: function (data) {
        data = (data+'').trim('\n');
        console.error(data);
    },

    handleClose: function (code) {
        console.log('VLC process exited with code', code);
        this.vlc = null;
    },

    play: function () {
        if (!this.vlc) {
            return;
        }

        this.vlc.stdin.write('play\n');
    },

    pause: function () {
        if (!this.vlc) {
            return;
        }

        this.vlc.stdin.write('pause\n');
    },

    getTime: function (cb) {
        this.vlc.stdin.write('get_time\n');
        this.waiting.push(function (data) {
            cb(parseInt(data));
        });
    },

    seek: function (to) {
        if (!this.vlc) {
            return;
        }

        this.vlc.stdin.write('seek ' + to + '\n');
    },

    load: function (link) {
        if (!this.vlc) {
            return;
        }

        this.vlc.stdin.write('clear\nadd ' + link + '\n');
    }
};

module.exports = VLCPlayer;
