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
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();

      const allowedResourceTypes = ['document', 'script', 'xhr', 'fetch'];
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        if (allowedResourceTypes.includes(request.resourceType())) {
          request.continue();
        } else {
          console.log(
            `request ${request.url()} is type ${request.resourceType()}. Not scraping`
          );
          request.abort();
        }
      });
      page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));

      await page.goto(url, { waitUntil: 'load' });
      await page.waitForTimeout(2000);

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
      const ssAllowedResourceTypes = [
        'image',
        'document',
        'stylesheet',
        'fetch',
        'xhr',
      ];

      const richUrls = filteredUrls.map(async (filteredUrl: url) => {
        // eslint-disable-next-line no-async-promise-executor
        return await new Promise<url>(async (_resolve, _reject) => {
          if (!filteredUrl.url) return;
          const _page = await browser.newPage();
          await _page.setRequestInterception(true);
          _page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
          _page.on('request', (request) => {
            if (
              ssAllowedResourceTypes.includes(request.resourceType()) &&
              request.url().match(url)
            ) {
              request.continue();
            } else {
              request.abort();
            }
          });
          console.log('going to', filteredUrl.url);
          const isPdf = filteredUrl.url.match(/\.pdf$/);

          if (isPdf)
            return _resolve({
              ...filteredUrl,
              features: ['pdf'],
              preview: 'Niet beschikbaar',
            });

          await _page.goto(filteredUrl.url, {
            timeout: 0,
          });
          await _page.waitForTimeout(2000);

          const filters = ['form', 'img', 'table', 'iframe'];

          const features = filters.map(async (ft: string) => {
            return _page.$$(ft).then((value) => {
              return value.length > 0 ? `${ft} (${value.length})` : '';
            });
          });

          if (_page.url().match(/\.pdf$/)) {
            features.push(Promise.resolve('pdf'));
          }

          const ss = await _page.screenshot({
            type: 'webp',
            quality: 20,
            fullPage: true,
          });

          await Promise.all(features).then(async (value) => {
            const filteredValue = value.filter((val) => val !== '');
            const result = {
              ...filteredUrl,
              features: filteredValue,
              preview: `data:image/jpg;base64, ${ss.toString('base64')}`,
            };
            return _resolve(result);
          });
        });
      });

      await Promise.all(richUrls).then(async (value) => {
        setTimeout(async () => {
          await browser.close();
        }, 10000);
        return resolve(value);
      });
    } catch (e) {
      return reject(e);
    }
  });
};
