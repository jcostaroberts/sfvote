/**
 * Doanload ballot images from an election
 */
const request = require("request"),
  fs = require("fs"),
  moment = require("moment"),
  downloadBallotImages = require("./ballot-images.js");

const DATE_FORMAT = "MM-DD-YYYY";

const args = process.argv.slice(2);
const imagesDir = args[0];
const electionDate = args[1];
if (!isValid(electionDate)) {
  throw new Error(
    `Invalid date ${electionDate} - expected format ${DATE_FORMAT}`
  );
}

function isValid(date) {
  return moment(date, DATE_FORMAT).isValid();
}

(async function() {
  const images = await downloadBallotImages(electionDate);

  images.forEach(image => {
    console.debug(`Downloading image: ${image.race} - ${image.url}`);

    if (!fs.existsSync(imagesDir)) fs.mkdirSync(dir);
    const fileName = `${imagesDir}/${electionDate}-${image.race}.txt`;
    const file = fs.createWriteStream(fileName);
    fs.writeFileSync(fileName);

    request
      .get(image.url)
      .pipe(file)
      .on("finish", function() {
        console.debug(`Finished downloading image: ${image.race}`);
        file.close();
      });
  });
})();
