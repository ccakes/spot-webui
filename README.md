# Spot

This is the web interface for [Spot](https://github.com/ccakes/spot) - a Spotify-powered office jukebox.

This depends on the Spot daemon running somewhere nearby and can be built using [Brunch](https://brunch.io).

## Setup

```bash
git clone https://github.com/ccakes/spot-webui
cd spot-webui

npm install
bower install
npm run start
```

If you're running [Spot](https://github.com/ccakes/spot) on a different machine, edit application.js line 12. If you're running them on the machine, running `npm run build` and copying the public/ directory to the Mojolicious app should Just Work(tm) but I haven't actually tested this.

## Support

The best way to get support is using the [GitHub issue tracker](https://github.com/ccakes/spot-webui/issues). Please raise an issue for any bugs, feature requests or general questions.

## Contributing

I try to create issues for features that I want to include over time tagged with the enhancement label. Pull Requests are welcome.
