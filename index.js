const ffmpeg = require("ffmpeg");
const readdirp = require("readdirp");
const path = require("path");
const { program } = require("commander");
const fs = require("fs");

main();

async function main() {
  program.requiredOption("-i, --input <inputPath>", "mp4视频输入路径");

  program.parse(process.argv);
  const options = program.opts();
  const programInput = options.input;

  const inputPath = path.resolve(process.cwd(), programInput);

  for await (const entry of readdirp(inputPath, { fileFilter: "*.mp4" })) {
    const { fullPath } = entry;
    await convert(fullPath);
  }
}

async function convert(inputFile) {
  let outputFile = getOutputFilePath(inputFile);
  if (fs.existsSync(outputFile) || inputFile.indexOf("output") !== -1) {
    return;
  }
  try {
    let video = await ffmpeg(inputFile);
    video.addCommand("-c:v", "libx264");
    video.addCommand("-pix_fmt", "yuv420p");
    await video.save(outputFile);
  } catch (e) {
    console.error(inputFile, ":convert fail" + e);
  }
}

function getOutputFilePath(inputFile) {
  return inputFile.substr(0, inputFile.length - 4) + "-output.mp4";
}
