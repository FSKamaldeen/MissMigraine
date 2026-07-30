export const TOTAL_ONBOARDING_STEPS = 6;

export const createDefaultOnboardingAnswers = (email = '') => ({
  email,
  onsetAge: '',
  monthlyFrequency: '',
  typicalIntensity: null,
  commonSymptoms: [],
  otherSymptoms: '',
  auraFrequency: '',
  hasMenstrualCycle: '',
  cycleRegularity: '',
  cycleLength: '',
  cycleCorrelation: '',
  cycleTiming: '',
});

export const createDefaultOnboardingState = (email = '') => ({
  email,
  answers: createDefaultOnboardingAnswers(email),
  completed: false,
  skipped: false,
  firstUnansweredStep: 2,
});

export function deriveDisplayName(email, fallback = 'MissMigraine') {
  if (!email) {
    return fallback;
  }

  const localPart = email.split('@')[0] || fallback;
  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function getFirstUnansweredStep(answers) {
  if (!answers.onsetAge) {
    return 2;
  }

  if (!answers.monthlyFrequency || !answers.typicalIntensity) {
    return 3;
  }

  const hasSymptoms = answers.commonSymptoms.length > 0 || answers.otherSymptoms.trim().length > 0;
  if (!hasSymptoms || !answers.auraFrequency) {
    return 4;
  }

  if (!answers.hasMenstrualCycle) {
    return 5;
  }

  if (
    answers.hasMenstrualCycle === 'Yes' &&
    (!answers.cycleRegularity || !answers.cycleLength)
  ) {
    return 5;
  }

  if (!answers.cycleCorrelation) {
    return 5;
  }

  const needsTiming = ['Rarely', 'Sometimes', 'Often', 'Always'].includes(answers.cycleCorrelation);
  if (needsTiming && !answers.cycleTiming) {
    return 5;
  }

  return 6;
}

export function getPersonalizationMessage(step, answers) {
  if (step === 1) {
    return "Based on your answers, we'll focus on finding patterns in your migraines.";
  }

  if (step === 2) {
    return "Based on your answers, we'll track how your migraine experience changes over time.";
  }

  if (step === 3) {
    return "Based on your answers, we'll focus on your frequency and intensity trends.";
  }

  if (step === 4) {
    if (answers.auraFrequency && answers.auraFrequency !== 'Never') {
      return "Based on your answers, we'll separate aura and non-aura attacks for better insight.";
    }
    return "Based on your answers, we'll learn which symptoms show up most often in your attacks.";
  }

  if (step === 5) {
    if (answers.cycleCorrelation && ['Sometimes', 'Often', 'Always'].includes(answers.cycleCorrelation)) {
      return "Based on your answers, we'll focus on your cycle-migraine patterns and vulnerable days.";
    }
    return "Based on your answers, we'll personalise tracking around hormones and migraine timing.";
  }

  if (answers.cycleCorrelation && ['Sometimes', 'Often', 'Always'].includes(answers.cycleCorrelation)) {
    return "We'll focus on cycle-linked migraine insights first.";
  }

  if ((answers.commonSymptoms || []).includes('Sensitivity to light')) {
    return "We'll focus on symptom-heavy attack patterns first.";
  }

  return "We'll focus on building clear migraine trends from your baseline profile.";
}
