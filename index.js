#! /usr/bin/env node

const readdirp = require("readdirp");
const { program } = require("commander");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const exec = promisify(require("child_process").exec);

main();

async function main() {
  program.requiredOption("-i, --input <inputPath>", "mp4视频输入路径");

  program.parse(process.argv);
  const options = program.opts();
  const programInput = options.input;

  const inputPath = path.resolve(__dirname, programInput);

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
    await exec(
      `ffmpeg -i ${inputFile} -c:v libx264 -pix_fmt yuv420p ${outputFile}`
    );
  } catch (e) {
    console.error(inputFile, ":convert fail" + e);
  }
}

function getOutputFilePath(inputFile) {
  return inputFile.substr(0, inputFile.length - 4) + "-output.mp4";
}
