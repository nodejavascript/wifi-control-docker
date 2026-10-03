# wifi-control-docker

A Wi-Fi controller that has quietly stopped passing traffic is the hardest outage to notice — everything looks
connected. This watches the connection and puts it back when it drops, and it tells you when it does.

## What it does

- Reads the machine's own network state with `node-wifi` and re-associates the adapter when the connection has
  gone.
- Serves its log over HTTP with `express` and `helmet` on `APP_PORT`, so a headless box can be checked from a
  browser.
- Sounds `beepbeep` on a state change, and dates each entry with `dayjs`.
- Accepts a command from the terminal with `readline`, so a reset can be forced by hand.

## Run it

```bash
npm install
cp .env.example .env
npm start             # nodemon -r esm index.js
```

Then open the log:

```
http://localhost:<APP_PORT>/
```

The server's standard output carries the same log.

```bash
npm test              # standard --verbose
```

## Layout

```
index.js      entry point
src/lib/      the connection watch and the reset
```

## Licence

MIT — see [LICENSE](./LICENSE).
