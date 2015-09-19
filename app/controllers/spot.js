var spot = (function () {
    var exports = function (uri) {
        this.uri = uri;
        this.user = {};

        this.playlist = Array();
        this.playing = {};
        this.state = {};

        this.connect = function () {
            if (typeof this.sock === 'WebSocket') {
                if (this.sock.readyState === 1) {
                    return this.sock;
                }
            }

            this.sock = new WebSocket('ws://' + this.uri + '/v2/sock');

            this.sock.onopen = function () {
                console.log('WebSocket connected');
            };

            this.sock.onclose = function () {
                console.log('WebSocket closed');
            };

            return this.sock;
        };

        this.register_user = function (uid, callback) {
            var method = typeof uid !== 'undefined' ? 'user/' + uid : 'user';
            var inner = this;

            $.get('//' + this.uri + '/v2/' + method)
                .done(function (data, status, jqxhr) {
                    inner.user = (JSON.parse(JSON.stringify(data)));
                    console.log(inner.user);
                    callback(inner.user, status, jqxhr);
                })
                .fail(function (err) {
                    console.log('register_user:', err);
                });
        };

        this.update_track = function (callback) {
            $.get('//' + this.uri + '/v2/state')
                .done(function (data) {
                    this.state = data;
                    this.playing = data.currently_playing;
                    this.playing.next = data.next;
                    callback(this);
                })
                .fail(function (err) {
                    console.log('update:', err);
                });
        };

        this.update_playlist = function (callback) {
            $.get('//' + this.uri + '/v2/playlist')
                .done(function (data) {
                    this.playlist = data;
                    callback(this);
                })
                .fail(function (err) {
                    console.log('update_playlist:', err);
                });
        };

        this.queue_track = function (uri) {
            $.get('//' + this.uri + '/v2/append/' + uri)
                .always(function (jqxhr) {
                    //console.log('queue_track:', data);
                    if (jqxhr.status == 401) {
                        alert('You must log in to play');
                        return;
                    }
                });
        };

        this.vote_track = function (uri) {
            $.get('//' + this.uri + '/v2/vote/' + uri)
                .always(function (data, status, jqxhr) {
                    console.log('vote_track:', data);
                    if (jqxhr.status == 401) {
                        alert('You must log in to play');
                        return;
                    }
                });
        };
    };

    return exports;
})();

module.exports = spot;
