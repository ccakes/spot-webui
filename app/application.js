$(function () {
    T = function (tpl, data) {
        data = data || {};
        var template = require('views/' + tpl);
        return $(Mustache.render(template, data));
    };

    var spotify = new SpotifyWebApi();
    var progress = progressJs().start();

    var spot = require('controllers/spot');
    var s = new spot(location.hostname);
    
    // event handlers
    var ui = {
        toggle_overlay: function () {
            var overlay = localStorage.getItem('spot_overlay');

            if (overlay === 'true') {
                $('#container .overlay').removeClass('overlay');
                $('#overlay').removeClass('fa-square-o');
                $('#overlay').addClass('fa-check-square-o');
            } else {
                $('#container .top .right').addClass('overlay');
                $('#container .bottom').addClass('overlay');
                $('#overlay').removeClass('fa-check-square-o');
                $('#overlay').addClass('fa-square-o');
            }
        },

        // UI updates
        track_update: function () {
            var nn = arguments[0]; // grab parent object

            $('#player').html(T('player.tpl', {
                playing: nn.playing
            }));

            var album = ui.album_update(nn.playing.album.uri);

            // calculate current percentage and percentage size of 10sec (refresh interval)
            var played = Math.ceil((nn.playing.time.current / nn.playing.time.length) * 100);
            var interval = nn.playing.time.length / 100;

            progress.set(played);
            // smooth transitions
            if (nn.state.playing == 1) {
                progress.autoIncrease(1, interval * 1000);
            }
        },
        playlist_update: function () {
            var nn = arguments[0]; // grab parent object

            $('#playlist').html(T('playlist.tpl', {
                playlist: nn.playlist
            }));

            ui.bind_vote_click();
        },
        album_update: function (uri) {
            if (RegExp('^spotify:').test(uri)) {
                uri = uri.split(':')[2];
            }

            spotify.getAlbums([uri], function (err, data) {
                var album = {
                    name: data.albums[0].name,
                    artist: data.albums[0].artists[0].name,
                    cover: data.albums[0].images[0].url,
                    release_date: data.albums[0].release_date,
                    link: data.albums[0].external_urls.spotify
                };

                $('#about').html(T('album.tpl', {
                    album: album
                }));
            });
        },
        users_update: function(msg) {
            console.log("FUNC: " + msg);
            $('<p>' + msg + '</p>').appendTo('#events').fadeOut(3000, function () {
                $(this).remove();
            });
        },

        // bind click event to elements
        bind_results_click: function () {
            $('a[data-track-results]').on('click', function () {
                s.queue_track($(this).attr('data-track-results'));
            });
        },
        bind_vote_click: function () {
            $('a[data-track-playlist]').on('click', function () {
                s.vote_track($(this).attr('data-track-playlist'));
            });

            $('.tooltip').tooltipster();
        },

        // audio
        stream: {
            src: '//' + location.hostname + '/listen',
            audio: new Audio(this.src),

            start: function () {
                console.log('audio playing');
                this.audio.src = this.src;
                this.audio.muted = true;
                this.audio.play();
            },
            play: function () {
                if (this.audio.muted) {
                    console.log('audio unmuting');
                    this.audio.muted = false;
                    return;
                }

                //this.audio.play();
                //this.playing = true;
            },
            reset: function () {
                //this.audio.pause();
                //this.audio.src = 'about:blank';
                //this.audio.load();
                console.log('audio muting');
                this.audio.muted = true;
            },
            is_playing: function () {
                return !this.audio.muted;
            }
        },

        // users
        is_auth: function () {
            var uid;
            if (localStorage.getItem('spot_uid')) {
                uid = localStorage.getItem('spot_uid');

                s.register_user(uid, function (data) {
                    $('#login span').replaceWith(
                        $('<span>').text(data.display_name)
                    );
                });
            }

            return;
        },
        login: function () {
            var x = screen.width / 2 - 700 / 2;
            var y = screen.height / 2 - 450 / 2;

            var pop = window.open('/auth/google/authenticate', 'Register', 'location=0,status=0,width=450,height=500,left=' + x + ',top=' + y);
            var pop_interval = window.setInterval(function () {
                if (pop.closed) {
                    window.clearInterval(pop_interval);

                    s.register_user(undefined, function (data, status, jqxhr) {
                        localStorage.setItem('spot_uid', data.id);

                        //$('div#login').empty();
                        $('#login span').replaceWith(
                            $('<span>').text(data.display_name)
                        )
                    });
                }
            });
        },

        login_new: function () {
            var uid = localStorage.getItem('spot_uid');
            var x = screen.width / 2 - 700 / 2;
            var y = screen.height / 2 - 450 / 2;

            s.register_user(uid, function (data, status, jqxhr) {
                if (jqhxr.status !== 200) {
                    var res = JSON.parse(data);
                    if (typeof res.popup !== 'undefined' && res.action == 'login') {

                        var pop = window.open('/auth/google/authenticate', 'Register', 'location=0,status=0,width=450,height=500,left=' + x + ',top=' + y);
                        //
                    }
                }
            });
        }
    };

    // fuck it, just play
    ui.stream.start();

    $('#container').html(T('main.tpl', {}));
    $('#player').html(T('player.tpl', {}));

    $('#search').typing({
        stop: function (event, elem) {
            var query = elem.val();
            if (!query)
                return;

            var search = {
                results: []
            };

            spotify.searchTracks(query, {
                limit: 50
            }, function (err, data) {
                $.each(data.tracks.items, function (key, value) {
                    if (value.available_markets.indexOf('AU') == -1) {
                        //console.log(value);
                        return; // skip this track
                    }

                    search.results.push({
                        uri: value.uri,
                        artist: value.artists[0].name,
                        album: value.album.name,
                        track: value.name
                    });
                });

                $('#results').html(T('search.tpl', search));
                ui.bind_results_click();
            });
        },
        delay: 800
    });

    $('#stream').on('click', function () {
        console.log('stream: click');
        if (ui.stream.is_playing()) {
            console.log('reset stream');
            ui.stream.reset();
            $('#control').attr('class', 'fa fa-play');
        } else {
            console.log('start stream');
            ui.stream.play();
            $('#control').attr('class', 'fa fa-stop');
        }
    });

    $('#login').on('click', ui.login);

    $('#toggle_overlay').on('click', function () {
        var overlay = localStorage.getItem('spot_overlay');

        if (overlay === 'true') {
            localStorage.setItem('spot_overlay', 'false');
        } else {
            localStorage.setItem('spot_overlay', 'true');
        }

        ui.toggle_overlay();
    });

    // testing
    s.update_track(ui.track_update);
    s.update_playlist(ui.playlist_update);

    ui.is_auth();
    ui.toggle_overlay();

    //return;

    s.connect().onmessage = function (event) {
        var msg = JSON.parse(event.data);

        if (msg.type == 'pong')
            return;

        console.log('Received WebSocket message:', msg);

        if (msg.type == 'update') {
            switch (msg.item) {
            case 'track':
                s.update_track(ui.track_update);
                break;

            case 'playlist':
                s.update_playlist(ui.playlist_update);
                break;
                    
            case 'users':
                ui.users_update(msg.message);
                break;
            }
        }
    };

    // keepalive
    window.setInterval(function () {
        s.sock.send(JSON.stringify({
            type: 'ping'
        }));
    }, 5000);
});
