const Nightmare = require("nightmare");

const nightmare = Nightmare({
  show: false
});

async function downloadBallotImages(electionDate) {
  const url = buildResultsUrl(electionDate);

  console.log(`Downloading most recent results from ${url}`);
  return await nightmare
    .goto(url)
    .wait()
    .on("console", function(log, msg) {
      console.log(msg);
    })
    .evaluate(() => {
      /**
       * Filter table rows for ranked choice ballot images
       */
      function isRankedChoiceBallotImage() {
        const text = $(this).text();
        return (
          text.indexOf("Ranked-Choice Voting: Ballot Image:") > -1 ||
          text.indexOf("Ranked-Choice Voting: Master Lookup") > -1
        );
      }

      /**
       * Return race title from RCV ballot image row
       */
      function rankedChoiceRaceTitle() {
        return $(this)
          .find("th")
          .text()
          .replace("Ranked-Choice Voting: Ballot Image:", "")
          .replace("Ballot Image help", "")
          .trim();
      }

      function rankedChoiceDownloadLink() {
        return $(this)
          .find("td")
          .filter(function(idx) {
            return idx === 1;
          })
          .find("a")
          .prop("href");
      }

      const title = $(".panel-title");
      console.log(`Found ${title.length} election results`);
      if (!title) {
        console.log("No election results found");
        return;
      }

      console.log(`Parsing election results from ${title.first().text()}...`);

      const ballotImages = $(".panel-title")
        .first()
        .closest("div.row")
        .find("tr")
        .filter(isRankedChoiceBallotImage)
        .map(function() {
          return {
            race: rankedChoiceRaceTitle.call(this),
            url: rankedChoiceDownloadLink.call(this)
          };
        })
        .get();

      console.log(`Found ${ballotImages.length} ballot images:`);
      ballotImages.forEach(x => {
        console.log(`   -->${x.race}`);
      });

      return ballotImages;
    })
    .end()
    .then(x => x);
}

// election date format: MM-DD-YYYY
function buildResultsUrl(electionDate) {
  [_, m, d, y] = electionDate.match(/(\d{2})-(\d{2})-(\d{4})/);
  const month = monthName(+m);
  console.log(`Downloading results for ${month} ${+d} ${+y}`);
  return `https://sfelections.sfgov.org/${month}-${+d}-${+y}-election-results-detailed-reports`;
}

function monthName(monthNumber) {
  switch (monthNumber) {
    case 6:
      return "june";
    case 11:
      return "november";
  }
  throw new Error(`add month ${monthNumber}`);
}

module.exports = downloadBallotImages;
