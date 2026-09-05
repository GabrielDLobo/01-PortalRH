import React, { useState, useCallback } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { admissionService } from '../../services/admissionService';
import LoadingSpinner from './LoadingSpinner';

interface CEPInputProps {
  value: string;
  onChange: (value: string) => void;
  onAddressChange?: (address: {
    zip_code: string;
    street_address: string;
    neighborhood: string;
    city: string;
    state: string;
    complement: string;
  }) => void;
  error?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

const CEPInput: React.FC<CEPInputProps> = ({
  value,
  onChange,
  onAddressChange,
  error,
  label = "CEP",
  placeholder = "00000-000",
  disabled = false,
  required = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string>('');

  // Format CEP as user types
  const formatCEP = (inputValue: string): string => {
    const numbers = inputValue.replace(/\D/g, '');
    if (numbers.length <= 5) {
      return numbers;
    }
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value);
    onChange(formatted);
    setLookupError('');
  };

  const lookupCEP = useCallback(async () => {
    if (!value || value.length < 8) {
      setLookupError('CEP deve conter 8 dígitos');
      return;
    }

    setIsLoading(true);
    setLookupError('');

    try {
      const addressData = await admissionService.lookupCep(value);
      onAddressChange?.(addressData);
    } catch (error: any) {
      if (error.response?.data?.error) {
        setLookupError(error.response.data.error);
      } else {
        setLookupError('Erro ao consultar CEP');
      }
    } finally {
      setIsLoading(false);
    }
  }, [value, onAddressChange]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      lookupCEP();
    }
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={9}
          className={`
            block w-full px-3 py-2 pr-12 border rounded-lg shadow-sm text-sm
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${error || lookupError 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300'
            }
          `}
        />
        
        <button
          type="button"
          onClick={lookupCEP}
          disabled={disabled || isLoading || !value || value.length < 8}
          className={`
            absolute inset-y-0 right-0 flex items-center px-3 rounded-r-lg
            transition-all duration-200 transform
            ${disabled || isLoading || !value || value.length < 8
              ? 'text-gray-300 cursor-not-allowed bg-gray-50'
              : 'text-white bg-primary-500 hover:bg-primary-600 hover:scale-105 shadow-lg hover:shadow-xl'
            }
          `}
          title="🔍 Clique para consultar o CEP automaticamente"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <div className="flex items-center space-x-1">
              <MagnifyingGlassIcon className="h-4 w-4" />
              {value && value.length >= 8 && (
                <span className="text-xs font-medium hidden sm:inline">Buscar</span>
              )}
            </div>
          )}
        </button>
      </div>
      
      {(error || lookupError) && (
        <p className="text-sm text-red-600">
          {error || lookupError}
        </p>
      )}
      
      {value && value.length >= 8 && !isLoading && !lookupError && (
        <div className="flex items-center space-x-2 mt-2">
          <div className="flex items-center space-x-1 text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-md">
            <MagnifyingGlassIcon className="h-3 w-3" />
            <span className="font-medium">Clique no botão azul para buscar o endereço automaticamente</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CEPInput;