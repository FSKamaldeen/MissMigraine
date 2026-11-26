/* Cycle phase constants and validation rules.
 * The four phases in cycle order, with their display names.
 */
export const PHASE_ORDER = ['menstrual', 'follicular', 'ovulatory', 'luteal'];
export const DEFAULT_CYCLE_LENGTH = 28;
export const DEFAULT_OVULATION_DAY = 14;
export const DEFAULT_MENSTRUAL_LENGTH = 5;

export const PERIMENSTRUAL_BEFORE = 2;
export const PERIMENSTRUAL_AFTER = 3;

export const OVULATION_WINDOW = 1;

/* Validation bounds for user-entered cycle values */
export const CYCLE_VALIDATION = {
  minCycleLength: 21,
  maxCycleLength: 45,
  minOvulationDay: 1,
};

/* Menstrual status options */
export const MENSTRUAL_STATUS_OPTIONS = [
  { value: 'regular', label: 'Yes, regularly' },
  { value: 'irregular', label: 'Yes, but irregularly' },
  { value: 'pregnant', label: "No — I'm pregnant" },
  { value: 'breastfeeding', label: "No — I'm breastfeeding" },
  { value: 'perimenopause', label: "No — I'm in perimenopause" },
  { value: 'menopause', label: "No — I'm in menopause" },
  { value: 'hormonal_bc', label: 'No — I use hormonal birth control' },
  { value: 'prefer_not', label: 'Prefer not to say' },
];

/* Returns true if the given menstrual status indicates
 * the user currently has an active cycle to track. */
export function isCycleTrackingEnabled(statusKey) {
  return statusKey === 'regular' || statusKey === 'irregular';
}