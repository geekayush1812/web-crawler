const fs = require('fs');

const map = (array, ...callbacks) => {
    if (callbacks.length === 0) {
        return array;
    }

    let result = array;

    for (let cb of callbacks) {
        result = result.map(cb);
    }

    return result;
}

const pipe = (...callbacks) => {
    if (callbacks.length === 0) {
        return null;
    }

    return callbacks.reduce((previous, curr) => {
        if (previous === null) {
            return curr();
        }

        previous = curr(previous)

        return previous;
    }, null);
}

const DIRECTORY_PATH = './reports';

const generateReport = (map, baseUrl) => {

    if (fs.existsSync(DIRECTORY_PATH)) {
        console.log('Directory already exists!');

    } else {
        fs.mkdir(DIRECTORY_PATH, (err) => {
            if (err) {
                console.error(err);
            } else {
                console.log('Directory created successfully!');
            }
        });
    }

    const baseUrlFileName = baseUrl.replace(/https?:\/\//, '').replace(/\//, '-');
    const fileName = `reports/${baseUrlFileName}-${Date.now()}.json`;

    fs.writeFile(fileName, JSON.stringify(map), (err) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
    })
}

module.exports = {
    map,
    pipe,
    generateReport
}