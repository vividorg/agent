import { Tool, ToolOperation } from '../types';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';

export default class WebTool implements Tool {
    name = 'web';
    description = 'Search the internet and read web pages';
    operations: ToolOperation[] = [
        {
            name: 'search',
            description: 'Search the web using DuckDuckGo',
            params: { query: 'string' }
        },
        {
            name: 'fetch',
            description: 'Read the content of a specific URL',
            params: { url: 'string' }
        }
    ];

    private turndownService = new TurndownService();

    constructor() {
        this.turndownService.remove(['script', 'style', 'noscript', 'iframe', 'header', 'footer', 'nav']);
    }

    private async search(query: string): Promise<string> {
        try {
            const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            if (!response.ok) {
                return `Error searching: ${response.status} ${response.statusText}`;
            }

            const html = await response.text();
            const $ = cheerio.load(html);
            const results: string[] = [];

            $('.result').slice(0, 5).each((i, el) => {
                const title = $(el).find('.result__title').text().trim();
                const link = $(el).find('.result__url').text().trim();
                const snippet = $(el).find('.result__snippet').text().trim();
                results.push(`### ${title}\nLink: ${link}\nSnippet: ${snippet}\n`);
            });

            if (results.length === 0) {
                return 'No results found.';
            }

            return `Top search results for "${query}":\n\n${results.join('\n')}`;
        } catch (error: any) {
            return `Search failed: ${error.message}`;
        }
    }

    private async fetchPage(url: string): Promise<string> {
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            if (!response.ok) {
                return `Error fetching page: ${response.status} ${response.statusText}`;
            }

            const html = await response.text();
            const $ = cheerio.load(html);
            const title = $('title').text() || 'No title';
            const bodyHtml = $('body').html() || '';
            let markdown = this.turndownService.turndown(bodyHtml);

            if (markdown.length > 8000) {
                markdown = markdown.substring(0, 8000) + '\n\n... (content truncated)';
            }

            return `--- PAGE: ${title} ---\nURL: ${url}\n\n${markdown}`;
        } catch (error: any) {
            return `Fetch failed: ${error.message}`;
        }
    }

    public async execute(operation: any, params: any): Promise<any> {
        switch (operation) {
            case 'search':
                if (!params?.query) return 'Error: "query" parameter is required.';
                return await this.search(params.query);
            case 'fetch':
                if (!params?.url) return 'Error: "url" parameter is required.';
                return await this.fetchPage(params.url);
            default:
                return `Unknown operation: ${operation}`;
        }
    }
}
