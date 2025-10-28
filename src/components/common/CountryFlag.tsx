import React from 'react';
import { Text, TextStyle } from 'react-native';

interface CountryFlagProps {
  countryCode: string;
  size?: number;
  style?: TextStyle;
}

/**
 * Renders a country flag emoji based on ISO 3166-1 alpha-2 country code
 * @param countryCode - Two-letter country code (e.g., 'US', 'TR', 'GB')
 * @param size - Font size for the emoji (default: 24)
 * @param style - Additional text styles
 */
const CountryFlag: React.FC<CountryFlagProps> = ({ countryCode, size = 24, style }) => {
  // Convert country code to flag emoji using Regional Indicator Symbols
  const getCountryFlag = (code: string): string => {
    if (!code || code.length !== 2) {
      return '🏳️'; // Return white flag for invalid codes
    }

    // Unicode flag emoji: Regional Indicator Symbol Letters
    // A = U+1F1E6, B = U+1F1E7, ..., Z = U+1F1FF
    // Formula: 127397 + charCode gives us the regional indicator
    const codePoints = code
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    
    return String.fromCodePoint(...codePoints);
  };

  return (
    <Text style={[{ fontSize: size }, style]}>
      {getCountryFlag(countryCode)}
    </Text>
  );
};

export default CountryFlag;
