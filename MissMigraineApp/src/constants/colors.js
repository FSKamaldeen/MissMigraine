/* Central color definitions */

// Cycle phase colors
export const CYCLE_PHASE_COLORS = {
  menstrual: '#7F011F',
  follicular: '#B81B3B',
  ovulatory: '#D9455F',
  luteal: '#E87A8E',
};

// Intensity scale colors
export const INTENSITY_COLORS = {
  low: '#6ca45b',
  mid: '#ffe162',
  high: '#e07a5f',
  severe: '#a01717',
};

// Intensity colors
export function getIntensityColor(value) {
  if (value <= 3) return '#6ca45b';
  if (value <= 5) return '#8fbf58';
  if (value <= 6) return '#ffe162';
  if (value <= 7) return '#f0a84c';
  if (value <= 8) return '#e07a5f';
  return '#a01717';
}

// Cycle phase metadata
export const CYCLE_PHASE_META = {
  menstrual: {
    name: 'Menstrual',
    fullName: 'Menstrual Phase',
    color: '#7F011F',
  },
  follicular: {
    name: 'Follicular',
    fullName: 'Follicular Phase',
    color: '#B81B3B',
  },
  ovulatory: {
    name: 'Ovulatory',
    fullName: 'Ovulatory Phase',
    color: '#D9455F',
  },
  luteal: {
    name: 'Luteal',
    fullName: 'Luteal Phase',
    color: '#E87A8E',
  },
};