import React from 'react';

export interface CellProps {
  value: string | string[];
}

interface PossibleLinkProps {
  text: string;
}

const PossibleLink = ({ text }: PossibleLinkProps) => {
  return text.match(/https?:\/\//) ? (
    <a href={text}>{text}</a>
  ) : (
    <span>{text}</span>
  );
};

export const Cell = ({ value }: CellProps) => {
  return (
    <td>
      {Array.isArray(value) ? (
        <ul>
          {value.map((item, index) => (
            <li key={index}>{<PossibleLink text={item} />}</li>
          ))}
        </ul>
      ) : (
        <PossibleLink text={value} />
      )}
    </td>
  );
};
