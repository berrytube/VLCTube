var http = require('http');

module.exports = {
    youtube: function (id, cb) {
        setImmediate(function() {
            cb('http://www.youtube.com/watch?v=' + id);
        });
    },

    vimeo: function (id, cb, qual) {
        if (!qual) {
            qual = 'sd';
        }

        var options = {
            host: 'player.vimeo.com',
            path: '/video/' + id,
            port: 443,
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Referer': 'player.vimeo.com'
            }
        };

        var parse = function (data) {
            var i = data.indexOf('{"cdn_url"');
            if (i === -1) {
                console.log('Vimeo link failed: http://vimeo.com/' + id);
                setImmediate(function () {
                    cb(null);
                });
                return;
            }

            var j = data.indexOf('};', i);
            var json = data.substring(i, j+1);
            try {
                json = JSON.parse(json);
                var codec = json.request.files.codecs[0];
                var files = json.request.files[codec];
                if (qual in files) {
                    setImmediate(function () {
                        cb(files[qual]);
                    });
                } else {
                    setImmediate(function () {
                        cb(files.sd);
                    });
                }
            } catch (e) {
                console.log('Error parsing Vimeo response: ' + e);
                setImmediate(function () {
                    cb(null);
                });
            }
        };

        http.get(options, function (res) {
            res.setEncoding('utf-8');
            var buffer = '';

            res.on('data', function (data) {
                buffer += data;
            });

            res.on('end', function () {
                parse(buffer);
            });
        });
    },

    dailymotion: function (id, cb, qual) {
        if (!qual) {
            qual = 'sd';
        }

        var options = {
            host: 'www.dailymotion.com',
            path: '/embed/video/' + id.substring(2),
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Referer': 'www.dailymotion.com'
            }
        };

        var parse = function (data) {
            var i = data.indexOf('info = {');
            var j = data.indexOf('fields = ');
            if (i === -1 || j === -1) {
                console.log('Bad dailymotion output: ' + id);
                setImmediate(function () {
                    cb(null);
                });
                return;
            }

            data = data.substring(i+7, j).replace(/[\s,]*$/, '');
            try {
                data = JSON.parse(data);
                var videos = {
                    'sd': data.stream_h264_url,
                    'ld': data.stream_h264_ld_url,
                    'hd': data.stream_h264_hq_url,
                    '720': data.stream_h264_hd_url,
                    '1080': data.stream_h264_hd1080_url
                };

                if (qual in videos && videos[qual] != null) {
                    setImmediate(function () {
                        cb(videos[qual]);
                    });
                } else {
                    setImmediate(function () {
                        cb(videos.sd);
                    });
                }
            } catch (e) {
                console.log('Bad dailymotion output: ' + id + ' - ' + e);
                setImmediate(function () {
                    cb(null);
                });
            }
        };

        http.get(options, function (res) {
            res.setEncoding('utf-8');
            var buffer = '';

            res.on('data', function (data) {
                buffer += data;
            });

            res.on('end', function () {
                parse(buffer);
            });
        });
    },

    soundcloud: function (id, cb) {
        var options = {
            host: 'api.soundcloud.com',
            path: '/i1/tracks/' + id.substring(2) + '/streams?client_id=b45b1aa10f1ac2941910a7f0d10f8e28&secret_token='
        };

        console.log(options.path);

        var parse = function (data) {
            try {
                data = JSON.parse(data);
                var max = -1;
                var kmax = -1;
                for (var key in data) {
                    var m = key.match(/http_mp3_(\d+)_url/);
                    if (m) {
                        if (parseInt(m[1]) > max) {
                            max = parseInt(m[1]);
                            kmax = key;
                        }
                    }
                }

                setImmediate(function () {
                    if (kmax !== -1) {
                        cb(data[kmax]);
                    } else {
                        cb(null);
                    }
                });
            } catch (e) {
                console.log('Bad response from soundcloud for id ' + id);
                setImmediate(function () {
                    cb(null);
                });
            }
        };

        http.get(options, function (res) {
            res.setEncoding('utf-8');
            var buffer = '';

            res.on('data', function (data) {
                buffer += data;
            });

            res.on('end', function () {
                parse(buffer);
            });
        });
    },

    osmf: function (id, cb) {
        setImmediate(function () {
            cb(id);
        });
    }
};
