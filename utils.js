const exec = require('sync-exec');

exports.shell = function shell(cmd) {
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
