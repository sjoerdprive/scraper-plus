import express from 'express';
import router from './lib/router';
import path from 'path';

import { run } from './scraper';

const { PORT = 3001 } = process.env;

const app = express();

// Middleware that parses json and looks at requests where the Content-Type header matches the type option.
app.use(express.json());

// Serve API requests from the router
app.use('/api', router);

// Serve storybook production bundle
app.use('/storybook', express.static('dist/storybook'));

app.post('/api', async (_req, res) => {
  const urlToFetch = _req.body.url;

  console.log('fetching for ', urlToFetch);

  try {
    const response = await run(2, urlToFetch);
    res.send(response);
  } catch (err) {
    res.send(err);
  }
});

// Serve app production bundle
app.use(express.static('dist/app'));

// Handle client routing, return all requests to the app
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'app/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
