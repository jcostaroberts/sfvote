
#!/usr/bin/env bash

IMAGES_DIR='images';

do_dependency_check() {
  required=(http-server node magick)

  for x in ${required[@]}; do
    if ! [[ -x `command -v ${x}` ]]; then
      log "missing required executable ${x}"
      failed=true
    fi
  done

  if [ ${failed} ]; then
    exit 1
  fi
  log "all deps satisfied"
}

do_run() {
  do_download $IMAGES_DIR
  node compose-ballots.js $IMAGES_DIR
}

do_sunburst() {
  do_download
  node compose-ballots.js $IMAGES_DIR --sunburst
  # sunburst json data is now in the sunburst directory
  for file in sunburst/*;
  do
    log "Generating sunburst page for ${file}"
    node template-compiler.js "${file}"
  done

  # take a screenshot of each page to use as a twitter card preview
  log "starting http server"
  http-server -p 8082 &
  sleep 5
  log "started http server"
  for dir in sunburst-${date}*;
  do
    log "generating screenshot for ${dir}"
    # generate preview image for twitter card
    node screenshot.js "http://localhost:8082/${dir}" "${dir}/preview.png"
    # create thumbnail for github gist
    magick convert "${dir}/preview.png" -resize 230x120 "${dir}/thumbnail.png"
  done
}

do_download() {
  node downloader.js $IMAGES_DIR $date
}

log() {
  echo `date +%y/%m/%d_%H:%M:%S`:: $*
}


help() {
  cat <<EOF
./run.sh <run|download|sunburst> date(MM-DD-YYYY)
  run       download and parse ballot images, output a csv file for each race
  download  download the latest ballot images to the images directory
  sunburst  download and parse ballot images, produce sunburst chart for each race
EOF
}

main() {
  do_dependency_check
  local cmd=${1}
  local date=${2}

  case ${cmd} in
    run)
      do_run
      ;;
    download)
      do_download
      ;;
    sunburst)
      do_sunburst
      ;;
    ballots )
      do_run
      ;;
    help )
      help
      ;;
    * )
      help
      ;;
  esac

}

main $@
