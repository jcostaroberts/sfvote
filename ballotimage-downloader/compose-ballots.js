const fs = require("fs"),
  readline = require("readline"),
  stringify = require("csv-stringify"),
  sunburst = require("./sunburst.js");

const MASTER_LOOKUP_PATTERN = /^(.{10})(\d{7})(.{50})(\d{7})(\d{7})(\d)(\d)$/;
const BALLOT_IMAGE_PATTERN = /^(\d{7})(\d{9})(\d{7})(\d{3})(\d{7})(\d{3})(\d{7})(\d)(\d)$/;

/**
 * Parse ballot images
 *
 * @param directory location of the ballot images
 * @param outputType if not sankey, outputs to csv
 */
async function composeBallots(directory, outputType) {
  console.log(`dir=${directory}`);
  const files = fs.readdirSync(directory);
  const master = files.filter(f => f.indexOf("Master") > -1);
  const results = files.filter(f => f.indexOf("Master") === -1);

  if (!master) throw new Error(`No master lookup file found in ${directory}`);

  console.log(`Found ${results.length} RCV election results`);

  const masterLookup = await readMaster(`${directory}/${master}`);

  results.forEach(async r => {
    const path = `${directory}/${r}`;
    const choices = await readBallot(path);
    console.log(`read ${choices.length} choices from ${path}`);
    // choices contains one object for each first, second, and third choice vote
    const ballots = choices.reduce(function(rv, b) {
      // map first, second, third choice votes from the same ballot
      (rv[b["perfVoterId"]] = rv[b["perfVoterId"]] || []).push(b);
      return rv;
    }, {});
    console.log(`read ${Object.keys(ballots).length} ballots from ${path}`);

    const lines = Object.keys(ballots).map(voterId => {
      return ballotToLine(voterId, ballots[voterId], masterLookup);
    });

    if (outputType === "--sunburst") {
      console.log(`---Generating sunburst output for ${r} ---`);
      const file = `sunburst/${r}`.replace(".txt", ".json");
      fs.writeFile(file, JSON.stringify(sunburst(lines)), function(err) {
        if (err) {
          console.log(`Error writing ${file}`);
        } else {
          console.log(`Saved file ${file}!`);
        }
      });
    } else {
      // write csv file with one ballot per line
      stringify(lines, { header: true }, function(err, output) {
        const file = `csv/${r}`.replace(".txt", ".csv");
        fs.writeFile(file, output, function(err) {
          if (err) {
            console.log(`Error writing ${file}`);
          } else {
            console.log(`Saved file ${file}!`);
          }
        });
      });
    }
  });
}

function ballotToLine(voterId, ballot, masterLookup) {
  const first = ballot.filter(x => x.voteRank === 1)[0];
  const second = ballot.filter(x => x.voteRank === 2)[0];
  const third = ballot.filter(x => x.voteRank === 3)[0];

  const contest = readContest(first, masterLookup),
    precinct = readPrecinct(first, masterLookup),
    tallyType = readTallyType(first, masterLookup),
    firstChoice = candidate(first, masterLookup),
    secondChoice = candidate(second, masterLookup),
    thirdChoice = candidate(third, masterLookup);

  if (
    !contest ||
    !precinct ||
    !tallyType ||
    !firstChoice ||
    !secondChoice ||
    !thirdChoice
  ) {
    console.error(`unable to parse ballot: ${voterId}`);
    return;
  }

  return {
    voterId,
    contest: contest.description,
    precinct: precinct.description,
    tallyType: tallyType.description,
    first: firstChoice.description,
    second: secondChoice.description,
    third: thirdChoice.description,
    overVote: first.overVote, // 1 or 0?
    underVote: first.underVote
  };
}

function readContest(ballot, masterLookup) {
  return masterLookup["Contest"][ballot.contestId];
}

function readPrecinct(ballot, masterLookup) {
  return masterLookup["Precinct"][ballot.precinctId];
}

function readTallyType(ballot, masterLookup) {
  return masterLookup["Tally Type"][ballot.tallyTypeId];
}

function candidate(ballot, masterLookup) {
  return masterLookup["Candidate"][ballot.candidateId];
}

function readBallot(path) {
  const ballots = [];
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: fs.createReadStream(path)
    });

    rl.on("line", line => {
      const parsed = BALLOT_IMAGE_PATTERN.exec(line);
      if (!parsed) return reject(`Could not parse ${line}`);

      const contestId = +parsed[1].trim(),
        perfVoterId = +parsed[2].trim(),
        serialNumber = +parsed[3].trim(),
        tallyTypeId = +parsed[4].trim(),
        precinctId = +parsed[5].trim(),
        voteRank = +parsed[6].trim(),
        candidateId = +parsed[7].trim(),
        overVote = +parsed[8].trim(),
        underVote = +parsed[9].trim();

      ballots.push({
        contestId,
        perfVoterId,
        serialNumber,
        tallyTypeId,
        precinctId,
        voteRank,
        candidateId,
        overVote,
        underVote
      });
    }).on("close", () => {
      resolve(ballots);
      console.log(`finished parsing ${path}`);
    });
  });
}

function readMaster(path) {
  return new Promise((resolve, reject) => {
    const data = {};

    console.log(`Reading master file: ${path}`);
    const rl = readline.createInterface({
      input: fs.createReadStream(path)
    });

    rl.on("line", line => {
      const parsed = MASTER_LOOKUP_PATTERN.exec(line);
      if (!parsed) throw new Error(`invalid line ${line}`);

      const recordType = parsed[1].trim(),
        id = +parsed[2].trim(),
        description = parsed[3].trim(),
        listOrder = parsed[4].trim(),
        candidatesContestId = parsed[5].trim(),
        isWriteIn = parsed[6].trim(),
        isProvisional = parsed[7].trim();

      if (!data[recordType]) data[recordType] = {};

      data[recordType][id] = {
        recordType,
        id,
        description,
        listOrder,
        candidatesContestId,
        isWriteIn,
        isProvisional
      };

      //CandidateId 0 indicates no vote
      data["Candidate"][0] = {
        recordType: "Candidate",
        id: 0,
        description: "No Vote Recorded"
      };
    }).on("close", () => {
      resolve(data);
      console.log("finished reading master lookup file");
    });
  });
}

const args = process.argv.slice(2);

composeBallots(args[0], args[1]);
