import React, { FormEvent, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import { UrlList } from '../UrlList/UrlList';

import classes from './Form.module.scss';
import { ResultFilter } from '../ResultFilter/ResultFilter';

export const Form = () => {
  const [url, setUrl] = useState<string>(
    'https://www.kunstcollectiemeierijstad.nl/'
  );
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AxiosResponse | undefined>(
    undefined
  );

  const [filters, setFilters] = useState<{ [key: string]: boolean }>({});

  const submitHandler = async (e: FormEvent) => {
    e.preventDefault();
    console.log('sent');
    setLoading(true);

    try {
      const response = await axios({
        method: 'post',
        url: '/api',
        data: { url: url },
      });

      setResponse(response);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  return (
    <div className={classes.root}>
      <form
        className={classes.form}
        action="/api"
        onSubmit={submitHandler}
        method="post"
      >
        <label htmlFor="urlInput" className={classes.label}>
          Url
        </label>
        <input
          className={classes.urlInput}
          onChange={(e) => setUrl(e.currentTarget.value)}
          value={url}
          type="text"
          name="url"
          id="urlInput"
        />
        <input type="submit" value="start" className={classes.submit} />
      </form>
      <div className={classes.response}>
        <ResultFilter
          filters={filters}
          setFilters={setFilters}
          disabled={!response}
        />
        <div className={classes.result} aria-live="polite">
          {loading && (
            <span role="status" className={classes.loading}>
              Loading...
            </span>
          )}
          {response && !loading && (
            <UrlList filters={filters} pages={response.data} />
          )}
        </div>
      </div>
    </div>
  );
};
