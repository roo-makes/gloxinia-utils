# Gloxinia Utilities

This typescript repo contains utilities assisting in the development of [Gloxinia](https://github.com/roo-makes/gloxinia-v4/).

## Setting Up

This repo uses yarn zero-installs, and should therefore mostly work right off the bat. Clone the repo and `cd` into it.

## Scripts

### Convert to Gloxinia Videos

Script to convert multiple videos (specified using a `glob` pattern) to the format and sizes required by Gloxinia.

```bash
yarn convert-videos -i ./path/to/videos/* -o ./path/to/output
```

#### Arguments

`-i`: Using a glob pattern, specify all of the videos you wish to convert. The utility expects these videos to contain an Alpha channel -- best way to generate them is to export from After Effects using the `Apple ProRes 4444` format, ensuring that you select `RGB + Alpha` for `Channels`.

`-o`: Folder to output videos to. The `height`, `width`, `fps`, `duration`, and `crf` values will be included in the filename.

All other options will be interactively prompted for once you execute the script.

### Convert to Gloxinia Images

Same as above, but converts to images.

### Convert to Ogg

Script to convert any audio files into `ogg`, which is the preferred format for use in Unity.

```bash
yarn convert-to-oggs -i ./path/to/audio/*.wav -o ./path/to/output
```

### Deploy to Steam Deck

Script to download the most recently pushed Linux build and send it to my Steam Deck. This requires a few things:

- Both this computer and the steam deck on home wifi
- Steam Deck has an entry in `knownhosts` linked to `steamdeck`
- Steam Deck is on.

Run it:

```bash
yarn deploy-to-deck
```

## Authors

Andrew Metcalf - Wrote the code - https://github.com/met5678
