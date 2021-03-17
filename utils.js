const exec = require('sync-exec');
const path = require("path");
const fs = require("fs");
const cwd = process.cwd();

function shell(cmd) {
    let result;
    try {
        result = exec(cmd);
    }  catch (e) {
        throw new Error(`invalid arguments '${cmd}'`);
    }
    if (!result.stderr) {
      console.log(result.stdout);
      console.log(`# ${cmd}`);
    } else {
        throw new Error(`${result.stderr} '${cmd}'`);
    }
    return result.stdout;
}


function getNextPackageVersion(packageVersion, rootVersion, dependencyVersion) {
    // "name": "test", "version": "0.1.0"
    const packageVersions = packageVersion.split(".");

    // "name": "package", "version": "0.1.0"
    const rootVersions = rootVersion.split(".");

    // "dependencies": { "@test/test": "^0.1.0-beta.1" }
    const dependencyVersions = dependencyVersion.replace(/^[^\d]?/g, "").split(".");
    const changedRootVersionIndex = rootVersions.findIndex((v, i) => v !== dependencyVersions[i]);
    const changedDependencyVersionIndex = dependencyVersions.findIndex((v, i) => v !== rootVersions[i]);

    if (changedRootVersionIndex === -1 && changedDependencyVersionIndex === -1) {
        return packageVersions.join(".");
    }
    if (changedRootVersionIndex === -1 && changedDependencyVersionIndex > -1) {
        // remove last version
        return packageVersions.slice(0, rootVersion.length).join(".");
    }
    if (changedRootVersionIndex > -1 && changedDependencyVersionIndex === -1) {
        // add last version
        return [...packageVersions, ...rootVersion.slice(changedRootVersionIndex)].join(".");
    }
    const length = rootVersions.length;
    const [,, prevPackageUnit] = /(\d+)(.*)/g.exec(packageVersions[changedRootVersionIndex]);
    const [, prevVersion, prevUnit] = /(\d+)(.*)/g.exec(dependencyVersions[changedRootVersionIndex]);
    const [, nextVersion, nextUnit] = /(\d+)(.*)/g.exec(rootVersions[changedRootVersionIndex]);

    const isVersionChange = prevVersion !== nextVersion || prevPackageUnit !== prevUnit;
    const isUnitChange = prevUnit !== nextUnit && prevPackageUnit === prevUnit;

    if (isVersionChange || isUnitChange) {
        packageVersions[changedRootVersionIndex] = `${parseFloat(packageVersions[changedRootVersionIndex]) + (isVersionChange && !isUnitChange ? 1 : 0)}${nextUnit || ""}`;

        for (let i = changedRootVersionIndex + 1; i < length; ++i) {
            const [,, afterUnit] = /(\d+)(.*)/g.exec(rootVersions[i]);

            packageVersions[i] = `${0}${afterUnit || ""}`;
        }
    }
    return packageVersions.slice(0, length).join(".");
}
function update(rootName, rootVersion, packagesPath, updatePaths, isVersionUpdate) {
    const rootVersions = rootVersion.split(".");
    updatePaths.split(",").forEach(updatePath => {
        if (!updatePath) {
            return;
        }
        const packagesFullPath = path.resolve(packagesPath, updatePath);
        const relativePath = path.relative(cwd, packagesFullPath);

        if (isVersionUpdate) {
            const packageJSONPath = path.resolve(packagesFullPath, "package.json");
            let packageJSON = fs.readFileSync(packageJSONPath, { encoding: "utf-8" });
            const {
                version: packageVersion,
                dependencies,
                devDependencies,
            } = JSON.parse(packageJSON);

            const saveDependencyVersion = dependencies && dependencies[rootName];
            const devDependencyVersion = devDependencies && devDependencies[rootName];
            const nextPackageVersion = getNextPackageVersion(packageVersion, rootVersion, saveDependencyVersion || devDependencyVersion);

            packageJSON = packageJSON.replace(new RegExp(`"${rootName}": "[^"]+"`, "g"), `"${rootName}": "~${rootVersions.join(".")}"`);
            packageJSON = packageJSON.replace(packageVersion, nextPackageVersion);

            fs.writeFileSync(packageJSONPath, packageJSON, { encoding: "utf-8" });
        }
        shell(`cd ${relativePath} && npm i`);
        shell(`cd ${relativePath.split("/").map(v => v ? ".." : "").join("/")}/`);
    });
}
exports.getNextPackageVersion = getNextPackageVersion;
exports.update = update;
exports.shell = shell;
