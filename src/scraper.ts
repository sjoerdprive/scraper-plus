/* eslint-disable no-async-promise-executor */
import puppeteer from 'puppeteer';

type url = {
  [key: string]: string | string[];
  url: string;
};

export const run = async (pagesToScrape: number, url: string) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      if (!pagesToScrape) {
        pagesToScrape = 1;
      }
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          '--disable-dev-shm-usage',
          '--no-sandbox',
          '--disable-setuid-sandbox',
        ],
      });
      const page = await browser.newPage();
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        if (request.resourceType() === 'document') {
          request.continue();
        } else {
          request.abort();
        }
      });
      page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));

      await page.goto(url, { waitUntil: 'load' });

      let currentPage = 1;
      let urls: url[] = [];
      const formattedUrl = url.replace(/\/$/, '');

      while (currentPage <= pagesToScrape) {
        await page.waitForSelector('a');

        const newUrls = await page.evaluate(() => {
          const results: url[] = [];
          const items = document.querySelectorAll('a');
          items.forEach((item) => {
            const itemUrl = item.getAttribute('href');
            if (itemUrl?.match(/^\/(?!#)/)) {
              results.push({
                text: item.innerText,
                url: itemUrl,
              });
            }
          });
          return results;
        });
        urls = urls.concat(newUrls);
        if (currentPage < pagesToScrape) {
          await Promise.all([
            await page.click('a'),
            await page.waitForSelector('a'),
          ]);
        }
        currentPage++;
      }

      const filteredUrls: url[] = urls.reduce(
        (previousValue: url[], currentValue: url) => {
          const fullUrl = formattedUrl + currentValue.url;
          if (previousValue.find((furl) => furl.url === fullUrl))
            return previousValue;

          const result = {
            ...currentValue,
            url: fullUrl,
          };
          return [...previousValue, result];
        },
        []
      );

      const richUrls = filteredUrls.map(async (filteredUrl: url) => {
        // eslint-disable-next-line no-async-promise-executor
        return await new Promise<url>(async (_resolve, _reject) => {
          if (!filteredUrl.url) return;
          const _page = await browser.newPage();
          await _page.setRequestInterception(true);
          _page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
          _page.on('request', (request) => {
            if (request.resourceType() === 'document') {
              request.continue();
            } else {
              request.abort();
            }
          });
          console.log('going to', filteredUrl.url);
          await _page.goto(filteredUrl.url, {
            timeout: 0,
          });

          const filters = ['form', 'img', 'table', 'iframe'];

          const features = filters.map(async (ft: string) => {
            return _page.$$(ft).then((value) => {
              return value.length > 0 ? `${ft}(${value.length})` : '';
            });
          });

          await Promise.all(features).then(async (value) => {
            const filteredValue = value.filter((val) => val !== '');
            const result = { ...filteredUrl, featureList: filteredValue };
            return _resolve(result);
          });
        });
      });

      await Promise.all(richUrls).then(async (value) => {
        return resolve(value);
      });
    } catch (e) {
      return reject(e);
    }
  });
};
