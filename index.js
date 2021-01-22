#!/usr/bin/env node

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

  for await (const entry of readdirp(inputPath, {
    fileFilter: ["*.mp4", "*.ogv", "*.webm"],
  })) {
    const { fullPath } = entry;
    await convert(fullPath);
  }
}

async function convert(inputFile) {
  let outputFile = getOutputFilePath(inputFile);
  // 已经转换的文件不再转换
  if (inputFile.indexOf("output") !== -1 || fs.existsSync(outputFile)) {
    return;
  }
  try {
    await exec(
      `ffmpeg -i ${inputFile} -c:v libx264 -pix_fmt yuv420p ${outputFile}`
    );
    console.log(inputFile, ":convert success");
  } catch (e) {
    console.error(inputFile, ":convert fail" + e);
  }
}

function getOutputFilePath(inputFile) {
  return inputFile + "-output.mp4";
}
