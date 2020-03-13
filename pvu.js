#!/usr/bin/env node
"use strict";

const args = require("args");
const path = require("path");
const fs = require("fs");
const { shell } = require("./utils");
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


const packageName = argName || name;
const versions = version.split(".");

updatePaths.split(",").forEach(updatePath => {
    if (!updatePath) {
        return;
    }
    const packagesFullPath = path.resolve(packagesPath, updatePath);
    const relativePath = path.relative(cwd, packagesFullPath);

    if (isVersionUpdate) {
        const packageJSONPath = path.resolve(packagesFullPath, "package.json");
        const packageJSON = fs.readFileSync(packageJSONPath, { encoding: "utf-8" });
        const {
            version: packageVersion,
            dependencies,
            devDependencies,
        } = JSON.parse(packageJSON);

        const originalVersion = (dependencies && dependencies[packageName]) || (devDependencies && devDependencies[packageName]);
        const originalVersions = originalVersion.replace(/^[^\d]?/g, "").split(".");
        const packageVersions = packageVersion.split(".");

        const changedIndex = originalVersions.findIndex((v, i) => v !== versions[i]);

        if (changedIndex === -1) {
            return;
        }
        packageVersions[changedIndex] = parseFloat(packageVersions[changedIndex]);


        const ov = originalVersions[changedIndex];
        const [, vv, unit] = /(\d+)(.*)/g.exec(versions[changedIndex]);

        if (ov !== parseFloat(vv)) {
            packageVersions[changedIndex] += 1;

            for (let i = changedIndex + 1; i < 3; ++i) {
                packageVersions[i] = 0;
            }
        }
        packageVersions[changedIndex] += unit || "";
        fs.writeFileSync(packageJSONPath, packageJSON.replace(packageVersion, packageVersions.join(".")), { encoding: "utf-8" });
    }
    shell(`cd ${relativePath} && npm i ${packageName}@latest`);
    shell(`cd ${relativePath.split("/").map(v => v ? ".." : "").join("/")}/`);
});
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
