
#!/usr/bin/env bash

IMAGES_DIR='images';

do_run() {
  do_download $IMAGES_DIR
  node compose-ballots.js $IMAGES_DIR
}

do_sunburst() {
  do_download
  node compose-ballots.js $IMAGES_DIR sunburst
}

do_download() {
  node downloader.js $IMAGES_DIR $date
}


help() {
  cat <<EOF
./run.sh <run|download|sunburst> date(MM-DD-YYYY)
  run       download and parse ballot images, output a csv file for each race
  download  download the latest ballot images to the images directory
  sunburst  download and parse ballot images, ouput json for a sunburst chart
EOF
}

main() {
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
