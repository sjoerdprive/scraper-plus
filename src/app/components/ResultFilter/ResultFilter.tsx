import React, { FormHTMLAttributes, useEffect } from 'react';

import classes from './ResultFilter.module.scss';

interface ResultFilterProps extends FormHTMLAttributes<HTMLFormElement> {
  disabled?: boolean;
  filters: any;
  setFilters: any;
}

export const ResultFilter = (props: ResultFilterProps) => {
  const { disabled, filters, setFilters, ...formProps } = props;

  const fields: { label: string; tag: string }[] = [
    { label: 'Afbeeldingen', tag: 'img' },
    { label: 'Formulieren', tag: 'form' },
    { label: 'Tabellen', tag: 'table' },
    { label: 'iframes', tag: 'iframe' },
    { label: 'PDF', tag: 'pdf' },
  ];

  useEffect(() => {
    fields.forEach((field: any) => {
      setFilters((prevState: any) => {
        return { ...prevState, [field.tag]: false };
      });
    });
  }, []);
  return (
    <form {...formProps} className={classes.root}>
      <fieldset disabled={disabled} className={classes.fieldset}>
        <legend className={classes.legend}>Filters:</legend>
        {fields.map((field, index) => {
          const { label, tag } = field;
          return (
            <div key={index} className={classes.item}>
              <input
                onChange={(e) => {
                  const { name, checked } = e.currentTarget;
                  setFilters((prevState: any) => {
                    return { ...prevState, [name]: checked };
                  });
                }}
                checked={filters[tag] || false}
                type="checkbox"
                name={`${tag}`}
                id={`${tag}`}
              />
              <label htmlFor={`${tag}`}>{label}</label>
            </div>
          );
        })}
      </fieldset>
    </form>
  );
};
