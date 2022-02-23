import React from 'react';
import { Row } from '.';
import classes from './Table.module.scss';

interface TableProps {
  headers: string[];
  rows: { [key: string]: string | string[] }[];
}

export const Table = ({ headers, rows }: TableProps) => {
  return (
    <table className={classes.table}>
      <thead>
        <tr className={classes.headers}>
          {headers.map((key, index) => {
            return <th key={index}>{key}</th>;
          })}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <Row key={index} cells={Object.entries(row)} />
        ))}
      </tbody>
    </table>
  );
};
