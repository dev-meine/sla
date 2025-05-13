import React, { useState } from 'react';
import { X } from 'lucide-react';

interface Option {
  id: string;
  name: string;
  role?: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select options...'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOptions = options.filter(option => value.includes(option.id));
  const availableOptions = options.filter(option => !value.includes(option.id));

  const handleSelect = (optionId: string) => {
    onChange([...value, optionId]);
    setIsOpen(false);
  };

  const handleRemove = (optionId: string) => {
    onChange(value.filter(id => id !== optionId));
  };

  return (
    <div className="relative">
      <div
        className="min-h-[42px] px-3 py-2 border rounded-md bg-white cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOptions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedOptions.map(option => (
              <div
                key={option.id}
                className="flex items-center gap-1 bg-primary-50 text-primary-700 px-2 py-1 rounded-full text-sm"
              >
                <span>{option.name}</span>
                {option.role && <span className="text-primary-500">({option.role})</span>}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(option.id);
                  }}
                  className="ml-1 text-primary-500 hover:text-primary-700"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
      </div>

      {isOpen && availableOptions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {availableOptions.map(option => (
            <div
              key={option.id}
              className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
              onClick={() => handleSelect(option.id)}
            >
              <div className="font-medium">{option.name}</div>
              {option.role && (
                <div className="text-sm text-gray-500">{option.role}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;