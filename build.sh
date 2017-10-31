#!/usr/bin/env bash

function contains {
  local e match="$1"
  shift
  for e; do [[ "$e" == "$match" ]] && return 0; done
  return 1
}

function remove_toplevel {
  local blacklist=(build.sh CNAME keybase.txt README.md .nojekyll src)
  local trigger=0

  for i in *; do
    if contains "$i" "${blacklist[@]}"; then
      trigger=1
      echo "this is a blacklist file: $i"
    else
      rm -rf "$i"
    fi
  done

  if [[ $trigger -eq 1 ]]; then
    printf "\n...we won't delete these files.\n\n"
  fi
}

function build_site {
  pushd "./src" 1>/dev/null
  hugo
  cp -r ./public/ ../
  popd 1>/dev/null
}

remove_toplevel
build_site
