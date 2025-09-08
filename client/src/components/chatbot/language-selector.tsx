import React from 'react';

interface LanguageSelectorProps {
  onSelect: (language: string) => void;
  currentLanguage: string;
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'ta', name: 'Tamil' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onSelect, currentLanguage }) => {
  return (
    <select
      value={currentLanguage}
      onChange={(e) => onSelect(e.target.value)}
      className="p-2 border rounded-md"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  );
};