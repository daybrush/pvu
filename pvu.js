#!/usr/bin/env node
"use strict";

const args = require("args");
const path = require("path");
const fs = require("fs");
const { shell, update } = require("./utils");
const cwd = process.cwd();

args
    .option("path", "package folder", "packages")
    .option("name", "package name")
    .option("base", "base module path", "./")
    .option("versionUpdate", "", true)
    .option("update", "update", "")
    .option("build", "build", "")
    .option("publish", "publish", "");

const {
    path: packagesPath,
    name: argName,
    update: updatePaths,
    build: buildPaths,
    base: basePath,
    publish: publishPaths,
    versionUpdate: isVersionUpdate,
} = args.parse(process.argv);
const { name, version } = JSON.parse(fs.readFileSync(path.resolve(cwd, basePath, "package.json"), { encoding: "utf8" }));


const rootName = argName || name;

update(rootName, version, updatePaths, isVersionUpdate);

buildPaths.split(",").forEach(buildPath => {
    if (!buildPath) {
        return;
    }
    const packagesFullPath = path.resolve(packagesPath, buildPath);
    const relativePath = path.relative(cwd, packagesFullPath);

    shell(`cd ${relativePath} && npm run build`);
    shell(`cd ${relativePath.split("/").map(v => v ? ".." : "").join("/")}/`);
});
publishPaths.split(",").forEach(publishPath => {
    if (!publishPath) {
        return;
    }
    const packagesFullPath = path.resolve(packagesPath, publishPath);
    const relativePath = path.relative(cwd, packagesFullPath);

    shell(`cd ${relativePath} && npm publish`);
    shell(`cd ${relativePath.split("/").map(v => v ? ".." : "").join("/")}/`);
});
