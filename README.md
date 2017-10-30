# www.integralist.co.uk

## Build

- `cd src`
- `hugo new ./posts/<some-title>.md`
- `vim **<Tab>` (using [fzf](https://github.com/junegunn/fzf) for file searching)
- edit the file content (copy meta header from another post for consistency)
- `hugo server` (for visual testing)
- `cd ../ && ./build.sh` (to compile files to be pushed to GitHub)
