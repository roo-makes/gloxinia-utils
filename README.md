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

### Convert to Gloxinia Images

Same as above, but converts to images.

#### Arguments

`-i`: Using a glob pattern, specify all of the videos you wish to convert. The utility expects these videos to contain an Alpha channel -- best way to generate them is to export from After Effects using the `Apple ProRes 4444` format, ensuring that you select `RGB + Alpha` for `Channels`.

`-o`: Folder to output videos to. The `height`, `width`, `fps`, `duration`, and `crf` values will be included in the filename.

All other options will be interactively prompted for once you execute the script.

## Authors

Andrew Metcalf - Wrote the code - https://github.com/met5678
