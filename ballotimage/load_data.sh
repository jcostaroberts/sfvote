# Requires database named sfvote

set -e

if [ $# -ne 2 ]; then
  echo "usage: $0 <election-date (yyyymmdd)> <results-date (yyyymmdd)>"
  exit 1
fi

if ! [ -x "$(command -v wget)" ]; then
  echo "install wget"
  exit 1
fi

if ! [ -x "$(command -v psql)" ]; then
  echo "install postgres"
  exit 1
fi

ELECTION_DATE="$1"
RESULTS_DATE="$2"

echo "Downloading ${RESULTS_DATE} results for ${ELECTION_DATE} election"

BALLOT_IMAGE_URL="http://www.sfelections.org/results/${ELECTION_DATE}/data/${RESULTS_DATE}/${RESULTS_DATE}_ballotimage.txt"
MASTER_LOOKUP_URL="http://www.sfelections.org/results/${ELECTION_DATE}/data/${RESULTS_DATE}/${RESULTS_DATE}_masterlookup.txt"
LOCAL_DIR="/tmp/sfvote/${ELECTION_DATE}"

wget "$BALLOT_IMAGE_URL" -P "$LOCAL_DIR"
wget "$MASTER_LOOKUP_URL" -P "$LOCAL_DIR"

BALLOT_IMAGE_FILE="${LOCAL_DIR}/${RESULTS_DATE}_ballotimage.txt"
MASTER_LOOKUP_FILE="${LOCAL_DIR}/${RESULTS_DATE}_masterlookup.txt"

SCHEMA_NAME="votes_${ELECTION_DATE}_${RESULTS_DATE}"
echo "creating schema ${SCHEMA_NAME}"

psql -d sfvote -c "
DROP SCHEMA IF EXISTS ${SCHEMA_NAME} CASCADE;
CREATE SCHEMA $SCHEMA_NAME;
SET SEARCH_PATH = ${SCHEMA_NAME};
create table ballot_image ( input text not null );
create table master_lookup ( input text not null );"

psql -d sfvote -c "COPY ${SCHEMA_NAME}.ballot_image FROM '${BALLOT_IMAGE_FILE}';"
psql -d sfvote -c "COPY ${SCHEMA_NAME}.master_lookup FROM '${MASTER_LOOKUP_FILE}';"

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "extracting ballot image into tables"
PGOPTIONS=--search_path=${SCHEMA_NAME} psql -d sfvote -f "${DIR}/load_ballot_image.sql"

echo "creating contest tables"
PGOPTIONS=--search_path=${SCHEMA_NAME} psql -d sfvote -f "${DIR}/create_contest_tables.sql"

echo "done!"
