const { test, expect } = require('@jest/globals')
const { normalizeUrl, getUrlsFromHtml } = require('./crawl')

describe('normalizeUrl', () => {
    it('should remove trailing slash from URL', () => {
        const inputUrl = 'https://example.com/';
        const expectedOutput = 'https://example.com';
        expect(normalizeUrl(inputUrl)).toBe(expectedOutput);
    });

    it('should lowercase URL', () => {
        const inputUrl = 'https://ExaMPle.cOM';
        const expectedOutput = 'https://example.com';
        expect(normalizeUrl(inputUrl)).toBe(expectedOutput);
    });

    it('should remove www subdomain from URL', () => {
        const inputUrl = 'https://www.example.com';
        const expectedOutput = 'https://example.com';
        expect(normalizeUrl(inputUrl)).toBe(expectedOutput);
    });

    it('should remove query parameters from URL', () => {
        const inputUrl = 'https://example.com/?foo=bar&baz=qux';
        const expectedOutput = 'https://example.com';
        expect(normalizeUrl(inputUrl)).toBe(expectedOutput);
    });

    it('should handle malformed URLs', () => {
        const inputUrl = 'foo';
        const expectedOutput = null;
        expect(normalizeUrl(inputUrl)).toBe(expectedOutput);
    });
});

describe('getUrlsFromHtml', () => {
    test('returns an empty array when the input HTML string is empty', () => {
        const html = '';
        const baseUrl = 'https://example.com/';
        const expectedUrls = [];
        expect(getUrlsFromHtml(html, baseUrl)).toEqual(expectedUrls);
    });

    test('returns an empty array when the input HTML string is null', () => {
        const html = null;
        const baseUrl = 'https://example.com/';
        const expectedUrls = [];
        expect(getUrlsFromHtml(html, baseUrl)).toEqual(expectedUrls);
    });

    test('throws an error when the input base URL is empty', () => {
        expect(() => {
            getUrlsFromHtml('<a href="/about">About</a>', '');
        }).toThrow('Base URL is required.');
    });

    test('throws an error when the input base URL is null', () => {
        expect(() => {
            getUrlsFromHtml('<a href="/about">About</a>', null);
        }).toThrow('Base URL is required.');
    });

    test('returns the input URL unchanged when it is an absolute URL', () => {
        const html = '<a href="https://example.com/about">About</a>';
        const baseUrl = 'https://example.com/';
        const expectedUrls = ['https://example.com/about'];
        expect(getUrlsFromHtml(html, baseUrl)).toEqual(expectedUrls);
    });

    test('converts relative URLs to absolute URLs based on the input base URL', () => {
        const html = '<a href="/about">About</a>';
        const baseUrl = 'https://example.com/';
        const expectedUrls = ['https://example.com/about'];
        expect(getUrlsFromHtml(html, baseUrl)).toEqual(expectedUrls);
    });

    test('extracts all URLs from all <a> tags in the input HTML', () => {
        const html = `
      <a href="/about">About</a>
      <a href="https://example.com/contact">Contact</a>
    `;
        const baseUrl = 'https://example.com/';
        const expectedUrls = ['https://example.com/about', 'https://example.com/contact'];
        expect(getUrlsFromHtml(html, baseUrl)).toEqual(expectedUrls);
    });

    test('correctly handles URLs with query strings and fragments', () => {
        const html = '<a href="/about?id=123#section1">About</a>';
        const baseUrl = 'https://example.com/';
        const expectedUrls = ['https://example.com/about'];
        expect(getUrlsFromHtml(html, baseUrl)).toEqual(expectedUrls);
    });

    test('correctly handles URLs with special characters', () => {
        const html = '<a href="/search?q=hello world">Search</a>';
        const baseUrl = 'https://example.com/';
        const expectedUrls = ['https://example.com/search'];
        expect(getUrlsFromHtml(html, baseUrl)).toEqual(expectedUrls);
    });

});
