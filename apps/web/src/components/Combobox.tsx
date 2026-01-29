'use client';

import { useState, useId } from 'react';
import {
  Combobox as HeadlessCombobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
} from '@headlessui/react';

interface ComboboxProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  error?: string;
  required?: boolean;
}

export default function Combobox({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  required,
}: ComboboxProps): React.JSX.Element {
  const [query, setQuery] = useState('');
  const errorId = useId();

  const filteredOptions =
    query === ''
      ? options
      : options.filter((option) => option.toLowerCase().includes(query.toLowerCase()));

  const handleChange = (newValue: string | null) => {
    if (newValue !== null) {
      onChange(newValue);
      setQuery('');
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle Enter for free text submission when no option is selected
    if (event.key === 'Enter' && filteredOptions.length === 0 && query) {
      event.preventDefault();
      onChange(query);
      setQuery('');
    }
  };

  const handleBlur = () => {
    // Save the typed query as the value when input loses focus
    if (query && query !== value) {
      onChange(query);
      setQuery('');
    }
  };

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="block font-bold mb-0.5"
        style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px' }}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <HeadlessCombobox value={value} onChange={handleChange} onClose={() => setQuery('')}>
        <div className="relative">
          <ComboboxInput
            id={id}
            className="w-full rounded border-0 py-2 px-3 text-sm leading-6 focus:ring-2 focus:ring-wine-burgundy"
            style={{
              minHeight: '44px',
              backgroundColor: 'rgba(255, 255, 255, 0.75)',
              color: 'rgba(0, 0, 0, 0.8)',
            }}
            placeholder={placeholder}
            displayValue={(val: string) => val || query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            required={required}
            aria-describedby={error ? errorId : undefined}
          />
          <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
            <svg
              className="h-5 w-5 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </ComboboxButton>
        </div>

        <ComboboxOptions
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
          style={{ backgroundColor: '#fff' }}
        >
          {filteredOptions.length === 0 && query !== '' ? (
            <div
              className="relative cursor-default select-none py-2 px-4 text-gray-700"
              style={{ minHeight: '44px' }}
            >
              No matching options
            </div>
          ) : (
            filteredOptions.map((option) => (
              <ComboboxOption
                key={option}
                value={option}
                className="relative cursor-pointer select-none py-2 px-4 data-[active]:bg-wine-burgundy data-[active]:text-white text-gray-900"
                style={{ minHeight: '44px' }}
              >
                {option}
              </ComboboxOption>
            ))
          )}
        </ComboboxOptions>
      </HeadlessCombobox>

      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
