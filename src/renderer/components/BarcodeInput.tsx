// src/components/BarcodeInput.tsx (modificado)
import React, { useState, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';

interface BarcodeInputProps {
  onBarcodeScanned: (barcode: string) => Promise<void>;
}

export const BarcodeInput: React.FC<BarcodeInputProps> = ({ onBarcodeScanned }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Debounce para evitar múltiples búsquedas rápidas
  const debouncedSearch = useDebouncedCallback(
    async (value: string) => {
      if (!value.trim()) return;
      
      setIsLoading(true);
      setSearchError(null);
      
      try {
        await onBarcodeScanned(value);
        // Limpiar input después de búsqueda exitosa
        if (inputRef.current) {
          inputRef.current.value = '';
          inputRef.current.focus();
        }
      } catch (error) {
        console.error('Error en búsqueda:', error);
      } finally {
        setIsLoading(false);
      }
    },
    300, // delay de 300ms
    { maxWait: 1000 }
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    if (value.length >= 2) { // Mínimo 3 caracteres para buscar
      debouncedSearch(value);
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        placeholder="Escanear código o buscar por nombre/código..."
        onChange={handleInputChange}
        className="w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
        disabled={isLoading}
      />
      {isLoading && (
        <div className="absolute right-3 top-2.5">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        </div>
      )}
      {searchError && (
        <div className="absolute top-full mt-1 text-sm text-red-600">
          {searchError}
        </div>
      )}
    </div>
  );
};