const fs = require("fs"),
  handlebars = require("handlebars");

const TEMPLATE_PATH = "sunburst_template";

// json file with sankey data
const file = process.argv[2];
if (file.indexOf(".json") < 0)
  throw new Error(`Expected json file, got ${file})`);

const fileName = parseFileName(file);
const { date, race } = parseElectionInfoFromFile(fileName);

const targetPath = buildTargetPath(date, race);
console.log(`Building sunburst: (${race}, ${date}) in ${targetPath}`);

const files = fs.readdirSync(TEMPLATE_PATH);

if (!fs.existsSync(targetPath)) {
  fs.mkdirSync(targetPath);
}

fs.copyFileSync(file, `${targetPath}/data.json`);
files.forEach(f => {
  if (isTemplate(f)) {
    const html = compileTemplate(f, race, date, targetPath);
    fs.writeFileSync(`${targetPath}/index.html`, html);
  } else {
    // just copy this to the target directory
    fs.copyFileSync(`${TEMPLATE_PATH}/${f}`, `${targetPath}/${f}`);
  }
});

function compileTemplate(f, race, date, targetPath) {
  const file = fs.readFileSync(`sunburst_template/${f}`, "utf8");
  const template = handlebars.compile(file);
  const [month, day, year] = date.split("-");
  return template({
    race,
    year,
    targetPath
  });
}

function parseElectionInfoFromFile(file) {
  const REGEX = /^(\d{2}-\d{2}-\d{4})-(.*)\.json$/;
  const [_, date, race] = REGEX.exec(file);
  return {
    date,
    race
  };
}

function buildTargetPath(date, race) {
  return `sunburst-${date}-${race.toLowerCase()}`
    .replace(/ /g, "-")
    .replace(/,/, "");
}

function isTemplate(file) {
  return file.indexOf("handlebars") > -1;
}

function parseFileName(fileName) {
  if (fileName.indexOf("/") > -1) {
    const split = fileName.split("/");
    return split[split.length - 1];
  } else {
    return fileName;
  }
}
