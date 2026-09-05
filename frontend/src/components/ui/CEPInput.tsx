import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { admissionService } from '../../services/admissionService';
import { CepAddress } from '../../types/admission';
import Input from './Input';
import Button from './Button';

function formatCep(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

interface CEPInputProps {
  value: string;
  onChange: (value: string) => void;
  onAddressFound: (address: CepAddress) => void;
}

export default function CEPInput({ value, onChange, onAddressFound }: CEPInputProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const lookup = async () => {
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 8) {
      setError('CEP deve ter 8 dígitos.');
      return;
    }
    try {
      setIsLoading(true);
      setError('');
      const address = await admissionService.lookupCep(digits);
      onAddressFound(address);
    } catch {
      setError('CEP não encontrado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            label="CEP"
            placeholder="00000-000"
            value={value}
            onChange={(event) => onChange(formatCep(event.target.value))}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                lookup();
              }
            }}
          />
        </div>
        <Button type="button" variant="secondary" onClick={lookup} isLoading={isLoading}>
          <MagnifyingGlassIcon className="h-4 w-4" />
          Buscar
        </Button>
      </div>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}
