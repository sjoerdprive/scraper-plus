import React from 'react';
import { Cell } from '.';
import classes from './Table.module.scss';

export interface RowProps {
  cells: [string, string | string[]][];
}

export const Row = ({ cells }: RowProps) => {
  return (
    <tr className={classes.row}>
      {cells.map(([key, value]) => (
        <Cell key={key} value={value} />
      ))}
    </tr>
  );
};
