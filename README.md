# Gloxinia Utilities

This typescript repo contains utilities assisting in the development of [Gloxinia](https://github.com/roo-makes/gloxinia-v4/).

## Setting Up

This repo uses yarn zero-installs, and should therefore mostly work right off the bat. Clone the repo and `cd` into it.

The only prerequisite is to install `ffmpeg` with a version that has support for the `hap` codec. The homebrew version (>=v8) has this, so you just need to run:
```bash
brew install ffmpeg
```

## Scripts

### Convert to Gloxinia Videos

Script to convert multiple videos (specified using a `glob` pattern) to the format and sizes required by Gloxinia.

```bash
yarn convert-to-hap -i ./path/to/videos/* -o ./path/to/output
yarn convert-to-webm -i ./path/to/videos/* -o ./path/to/output
```

#### Arguments

`-i`: Using a glob pattern, specify all of the videos you wish to convert. The utility expects these videos to contain an Alpha channel -- best way to generate them is to export from After Effects using the `Apple ProRes 4444` format, ensuring that you select `RGB + Alpha` for `Channels`.

`-o`: Folder to output videos to. The `height`, `width`, `fps`, `duration`, and `crf` values will be included in the filename.

`--inputBasePath` (_Optional_): The base path for the input. `-i` will be applied on top of this. When rendering many videos at once, their folder structure will be preserved in `-o` starting at the `--inputBasePath`

Other options will be interactively prompted for once you execute the script.

#### Examples

```bash
yarn convert-to-hap --inputBasePath ../gloxinia-nongit/gloxinia-ready/hap -i "**/Nightclub/**" -o ../gloxinia-nongit/gloxinia-converted
```

### Convert to Gloxinia Images

Same as above, but converts to image sequences. Creates a folder containing all of the frames as `pngs` for each input video.

```bash
yarn convert-to-images --inputBasePath ../gloxinia-nongit/gloxinia-ready/hap -i "**/Nightclub/**" -o ../gloxinia-nongit/gloxinia-converted
```

### Convert to Placeholder Images

Converts only the first frame in each input video. Useful for outputting a single iamge to represent the video. This is used in DancerMovesets as the image to show in the editor.

```bash
yarn convert-to-placeholders --inputBasePath ../gloxinia-nongit/gloxinia-ready/hap -i "**/*-idle.mov" -o ../gloxinia-nongit/gloxinia-placeholders
```

### Convert to Ogg

Script to convert any audio files into `ogg`, which is the preferred format for use in Unity.

```bash
yarn convert-to-oggs -i ./path/to/audio/*.wav -o ./path/to/output
```

You can also supply `-r` to do this recursively. It will mimic the directory structure found in the supplied input directory. When doing this, pass a single directory rather than a wildcard. For example:

```
yarn convert-to-oggs -i ../gloxinia-content/vo-final -o ../gloxinia-v4/Assets/_Game/Audio/Voice
```

The convention is:
[performer]/[category]/[file].wav

I have a function in my `.zshrc` allowing me to run this by writing `glox-convert-vo` (no path arguments needed).

### Deploy to Steam Deck

Script to download the most recently pushed Linux build and send it to my Steam Deck. This requires a few things:

- Both this computer and the steam deck on home wifi
- Steam Deck has an entry in `knownhosts` linked to `steamdeck`
- Steam Deck is on.

Run it:

```bash
yarn deploy-to-deck
```

TODO: Possibly just write this as a script I can run directly on my steam deck, which connects and downloads remotely. Doesn't require laptop/wifi setup, good for taking steamdeck on the road.

## Authors

Andrew Metcalf - Wrote the code - https://github.com/met5678
