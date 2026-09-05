import React from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';

interface Option {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  value: string | number | null;
  onChange: (value: any) => void;
  options: Option[];
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  multiple?: boolean;
}

const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  error,
  helperText,
  disabled = false,
  required = false,
  fullWidth = true,
  multiple = false,
}) => {
  const hasError = !!error;
  
  const selectedOption = options.find((option) => option.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className={clsx('flex flex-col', fullWidth && 'w-full')}>
      {label && (
        <label className="mb-1 text-sm font-medium text-neutral-700">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <Listbox value={value} onChange={onChange} disabled={disabled} multiple={multiple}>
        <div className="relative">
          <Listbox.Button
            className={clsx(
              'relative w-full cursor-default rounded-lg border py-2 pl-3 pr-10 text-left transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
              {
                'border-neutral-300 focus:ring-primary-500 focus:border-transparent': !hasError,
                'border-error-300 focus:ring-error-500 focus:border-transparent': hasError,
                'bg-neutral-50 cursor-not-allowed': disabled,
                'bg-white': !disabled,
              }
            )}
          >
            <span
              className={clsx(
                'block truncate',
                !selectedOption && 'text-neutral-500'
              )}
            >
              {displayValue}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-neutral-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  className={({ active }) =>
                    clsx(
                      'relative cursor-default select-none py-2 pl-10 pr-4',
                      active ? 'bg-primary-100 text-primary-900' : 'text-neutral-900',
                      option.disabled && 'opacity-50 cursor-not-allowed'
                    )
                  }
                  value={option.value}
                  disabled={option.disabled}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={clsx(
                          'block truncate',
                          selected ? 'font-medium' : 'font-normal'
                        )}
                      >
                        {option.label}
                      </span>
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
      
      {(error || helperText) && (
        <p
          className={clsx(
            'mt-1 text-sm',
            hasError ? 'text-error-600' : 'text-neutral-500'
          )}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Select;