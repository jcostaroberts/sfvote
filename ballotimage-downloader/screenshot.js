const Nightmare = require("nightmare");
const nightmare = Nightmare({
  show: true,
  width: 1000,
  height: 800
});
/**
 * Take a screenshot of the page
 *
 * @param  {[string]} url    url to take a screenshot of
 * @param {[string]} path  path to save screenshot
 */
async function screenshot(url, path) {
  console.log(`capturing screenshot of ${url} to ${path}`);
  return await nightmare
    .goto(url)
    .wait(3000) // let d3 draw the chart
    .screenshot(`${path}`)
    .end();
}

const [url, path] = process.argv.slice(2);
screenshot(url, path);
