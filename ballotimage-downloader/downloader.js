/**
 * Doanload ballot images from an election
 */
const request = require("request"),
  fs = require("fs");

const downloadBallotImages = require("./ballot-images.js");

const ELECTION_DATE = "11-06-2018";

(async function() {
  const images = await downloadBallotImages(ELECTION_DATE);
  console.log(images);

  images.forEach(image => {
    console.log(`Downloading image: ${image.race} - ${image.url}`);

    const dir = "images";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    const fileName = `${dir}/${ELECTION_DATE}-${image.race}.txt`;
    const file = fs.createWriteStream(fileName);
    fs.writeFileSync(fileName);

    request
      .get(image.url)
      .pipe(file)
      .on("finish", function() {
        console.log(`Finished downloading image: ${image.race}`);
        file.close();
      });
  });
})();
