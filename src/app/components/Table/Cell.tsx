import React, { useState } from 'react';

import classes from './Table.module.scss';

export interface CellProps {
  value: string | string[];
}

interface PossibleLinkProps {
  value: string;
}

const FormattedValue = ({ value }: PossibleLinkProps) => {
  const [isImgOpen, setImgOpen] = useState(false);
  // is link?
  if (value.match(/https?:\/\//)) return <a href={value}>{value}</a>;
  // is image buffer?
  if (value.match(/data:image/))
    return (
      <div className={`${classes.imgWrapper} ${isImgOpen && classes.open}`}>
        <button onClick={() => setImgOpen(!isImgOpen)}>
          {isImgOpen ? 'Verberg afbeelding' : 'Toon afbeelding'}
        </button>
        <img alt="" src={value} />
      </div>
    );

  // is plain text?
  return <span>{value}</span>;
};

export const Cell = ({ value }: CellProps) => {
  return (
    <td>
      {Array.isArray(value) ? (
        <ul>
          {value.map((item, index) => (
            <li key={index}>{<FormattedValue value={item} />}</li>
          ))}
        </ul>
      ) : (
        <FormattedValue value={value} />
      )}
    </td>
  );
};
