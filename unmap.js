#!/usr/bin/env node

const fs = require('fs-extra');
const { resolve } = require('path');
const { Command } = require('commander');
const program = new Command();

const opts = program
  .option('-p, --path <p>', 'input source map file')
  .option('-f, --filter <f>', 'filter out file names')
  .option('-o, --output <o>', 'output folder', './')
  .parse(process.argv)
  .opts();

fs.stat(opts.output)
  .then(async (exists) => {
    return fs.readFile(opts.path);
  })
  .catch(async () => {
    await fs.mkdir(opts.output);
    return fs.readFile(opts.path);
  })
  .then((js) => {
    js = JSON.parse(js.toString());

    const files = js.sources
      .filter((path) => (opts.filter ? path.includes(opts.filter) : true))
      .map((path, idx) =>
        fs.outputFile(resolve(opts.output, path), js.sourcesContent[idx])
      );
    return Promise.all(files);
  })
  .then(() => console.log(`${opts.path} unpacked`));
