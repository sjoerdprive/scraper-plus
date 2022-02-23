import React, { useEffect, useState } from 'react';
import { Table } from '../Table';
import classes from './UrlList.module.scss';

interface UrlListProps {
  pages: {
    [key: string]: string | string[];
    url: string;
    featureList: string[];
  }[];
  filters: any[];
}

export const UrlList = ({ pages, filters }: UrlListProps) => {
  const [numberOfLinks, setNumberOfLinks] = useState<number>(pages.length);
  if (!pages.map || pages.length < 1)
    return <span>Geen pagina's gevonden</span>;

  const activeFilters = Object.keys(filters).map((key, i) => {
    return filters[i] && key;
  });

  const allFiltersInactive = !Object.keys(filters).find((_key, i) => {
    return filters[i] === true;
  });

  const headers = Object.keys(pages[0]);

  const filteredPages = pages.filter((page) => {
    return page?.featureList?.find((feature: string) =>
      activeFilters.some((filter) => feature.match(filter))
    );
  });

  useEffect(() => {
    setNumberOfLinks(allFiltersInactive ? pages.length : filteredPages.length);
  }, [filteredPages]);

  return (
    <div className={classes.root}>
      <p className={classes.totalResults}>
        In totaal {numberOfLinks} pagina's gevonden
      </p>
      <Table
        headers={headers}
        rows={allFiltersInactive ? pages : filteredPages}
      />
    </div>
  );
};
