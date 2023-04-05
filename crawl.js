const jsdom = require('jsdom');
const { pipe, map } = require('./helper');

const removeSubdomain = (url, subdomain) => {
    return url.replace(subdomain, '');
}

const removeTrailingSlash = (url) => {
    return url.replace(/\/$/, '');
}

const createUrlStringFromObject = (urlObj) => {
    return urlObj.protocol + "//" + urlObj.host + urlObj.pathname;
}

const normalizeUrl = (url) => {
    try {
        const urlObj = new URL(url);

        urlObj.host = removeSubdomain(urlObj.host, 'www.');

        const pureUrl = removeTrailingSlash(createUrlStringFromObject(urlObj));

        return pureUrl;
    } catch (e) {
        console.error(e.message);
        return null;
    }
}

const getHrefFromLink = (link) => {
    return link.href;
}

const getValidUrl = (url, normalizedBaseUrl) => {
    let urlToReturn = url;

    if (urlToReturn.startsWith('/')) {
        urlToReturn = normalizedBaseUrl + urlToReturn;
    }

    return normalizeUrl(urlToReturn);
}

const filterFalsyUrls = (urls) => {
    return urls.filter(Boolean);
}

const getUrlsFromHtml = (htmlBody, baseUrl) => {

    if (!baseUrl) {
        throw new Error('Base URL is required.');
    }

    const normalizedBaseUrl = normalizeUrl(baseUrl);

    const { JSDOM } = jsdom;
    const dom = new JSDOM(htmlBody);

    const links = dom.window.document.querySelectorAll('a');
    const linksAsList = Array.from(links);

    const urls = pipe(
        () => map(
            linksAsList,
            getHrefFromLink,
            (urls) => getValidUrl(urls, normalizedBaseUrl),
        ),
        filterFalsyUrls
    )

    return urls;
}

const printCrawling = (url) => {
    console.log(`Crawling ${url} ...`);
}

const hasSameDomain = (url, baseUrl) => {
    const urlObj = new URL(url);
    const baseUrlObj = new URL(baseUrl);

    return urlObj.host === baseUrlObj.host;
}

const handlePageResponseError = (pageResponse, currentUrl) => {
    if (pageResponse.status !== 200) {
        throw new Error(`Failed to fetch ${currentUrl}`);
    }

    if (!pageResponse.headers.get('content-type').includes('text/html')) {
        throw new Error(`Page ${currentUrl} is not HTML`);
    }
}
const crawlPage = async (baseUrl, currentUrl = baseUrl, pages = {}) => {
    try {

        if (!hasSameDomain(currentUrl, baseUrl)) {
            return pages;
        }

        const normalizedCurrentUrl = normalizeUrl(currentUrl);
        const normalizedBaseUrl = normalizeUrl(baseUrl);

        if (pages[normalizedCurrentUrl]) {
            pages[normalizedCurrentUrl] = pages[normalizedCurrentUrl] + 1;
            return pages;
        } else {
            pages[normalizedCurrentUrl] = 1;
        }

        printCrawling(normalizedCurrentUrl);

        const pageResponse = await fetch(normalizedCurrentUrl);

        handlePageResponseError(pageResponse, normalizedCurrentUrl);

        const htmlBody = await pageResponse.text();


        const urls = getUrlsFromHtml(htmlBody, normalizedBaseUrl);

        if (urls.length === 0) {
            return pages;
        }

        const promises = urls.map((url) => crawlPage(normalizedBaseUrl, normalizeUrl(url), pages));

        (await Promise.all(promises))

        return pages;

    } catch (e) {
        console.dir(e.message);
        return pages;
    }
}


module.exports = {
    normalizeUrl,
    getUrlsFromHtml,
    crawlPage
};