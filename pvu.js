#!/usr/bin/env node
'use strict';

const args = require('args');
const path = require('path');
const fs = require('fs');
const { splitUnit } = require("@daybrush/utils");
const { shell } = require('./utils');

args
    .option('path', 'package folder', "packages")
    .option('packages', 'packages', "")

const {
    path: packagesPath,
    packages,
} = args.parse(process.argv);


const cwd = process.cwd();
const { name, version } = JSON.parse(fs.readFileSync(path.resolve(cwd, "package.json"), { encoding: "utf8" }));
const versions = version.split(".");

packages.split(",").forEach(packagePath => {
    const packageFullPath = path.resolve(packagesPath, packagePath);
    const packageJSONPath = ath.resolve(packageFullPath, "package.json");
    const packageJSON = fs.readFileSync(packageJSONPath);

    const
    const {
        version: packageVersion,
        dependencies: {
            [name]: originalVersion,
        },
    } = JSON.parse(packageJSON);
    const originalVersions = originalVersion.split(".");
    const packageVersions = packageVersion.split(".");

    const changedIndex = originalVersions.find((v, i) => v !== verions[i]);

    if (changedIndex === -1) {
        return;
    }
    const ov = splitUnit(originalVerions[changedIndex]);
    const vv = splitUnit(versions);

    if (ov.value === vv.value) {
        packageVersions[changedIndex] = parseFloat(packageVersions[changedIndex]) + vv.unit;
    } else {
        packageVersions[changedIndex] = parseFloat(packageVersions[changedIndex]) + 1;

        for (let i = changedIndex + 1; i < 3; ++i) {
            packageVersions[i] = 0;
        }
    }
    fs.writeFileSync(packageJSONPath, packageJSON.replace(packageVersion, packageVersions.join(".")), { encoding: "utf-8" });
    shell(`cd ${packageFullPath} && npm i ${name}@latest`);
    shell(`cd ${packageFullPath.split("/").map(v => v ? ".." : "").join("/")}/`);
});
