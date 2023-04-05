const { crawlPage } = require('./crawl');
const { generateReport } = require('./helper');

async function main() {
    const commandLineArgs = process.argv.slice(2);
    const commandLineArgsLength = commandLineArgs.length;
    const hasOnlyOneArgument = commandLineArgsLength === 1;

    if (!hasOnlyOneArgument) {
        console.error("Wrong number of arguments provided");
        process.exit(1);
    }

    const baseUrl = commandLineArgs[0];

    const urlToCountMap = await crawlPage(baseUrl);

    generateReport(urlToCountMap, baseUrl)
}


main();