import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  createDefaultOnboardingAnswers,
  createDefaultOnboardingState,
  getFirstUnansweredStep,
  getPersonalizationMessage,
  TOTAL_ONBOARDING_STEPS,
} from './onboardingConfig';

const onsetOptions = ['Under 10', '10-14', '15-19', '20-24', '25-29', '30-39', '40-49', '50+', 'Unsure'];
const frequencyOptions = ['0-1', '2-4', '5-7', '8-10', '11-14', '15+', 'Varies greatly', 'Unsure'];
const symptomOptions = [
  'Nausea',
  'Vomiting',
  'Sensitivity to light',
  'Sensitivity to sound',
  'Dizziness',
  'Fatigue',
  'Neck pain',
  'Other',
];
const auraOptions = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always', 'Unsure what aura is'];
const cyclePresenceOptions = [
  'Yes',
  'No (postmenopausal)',
  'No (medical condition/hysterectomy)',
  'Prefer not to say',
];
const cycleRegularityOptions = [
  'Regular (predictable within 3-5 days)',
  'Irregular (varies significantly)',
  'Unsure',
];
const cycleLengthOptions = ['Under 21 days', '21-24', '25-28', '29-32', '33-35', '36-40', 'Over 40', 'Very irregular', 'Unsure'];
const cycleCorrelationOptions = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always', 'Not applicable', 'Unsure'];
const cycleTimingOptions = ['2-3 days before period', 'During period', 'During ovulation', 'Week after period', 'Random throughout cycle'];

function useAppFonts() {
  return useFonts({
    'ReemKufi-Medium': require('../assets/fonts/ReemKufi-Medium.ttf'),
    'Plein-Regular': require('../assets/fonts/Plein-Regular.otf'),
    'Plein-Medium': require('../assets/fonts/Plein-Medium.otf'),
    'Plein-Light': require('../assets/fonts/Plein-Light.otf'),
  });
}

function getPasswordStrength(password) {
  if (!password) {
    return { label: 'Weak', color: '#d94764', width: '20%' };
  }
  const hasLetters = /[A-Za-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  if (password.length >= 10 && hasLetters && hasNumbers && hasSymbol) {
    return { label: 'Strong', color: '#2f855a', width: '100%' };
  }
  if (password.length >= 7 && hasLetters && hasNumbers) {
    return { label: 'Medium', color: '#d69e2e', width: '65%' };
  }
  return { label: 'Weak', color: '#d94764', width: '35%' };
}

function ProgressHeader({ step, onSkipForNow, allowSkip = true }) {
  return (
    <View style={styles.progressHeader}>
      <View style={styles.progressTopRow}>
        <Text style={styles.progressText}>Step {step} of {TOTAL_ONBOARDING_STEPS}</Text>
        {allowSkip ? (
          <Pressable style={({ pressed }) => [styles.topSkipButton, pressed && styles.topSkipPressed]} onPress={onSkipForNow}>
            <Text style={styles.topSkipText}>Skip for now</Text>
          </Pressable>
        ) : (
          <View style={styles.topSkipSpacer} />
        )}
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(step / TOTAL_ONBOARDING_STEPS) * 100}%` }]} />
      </View>
    </View>
  );
}

function QuestionBlock({ title, tooltip, tooltipKey, activeTooltip, onToggleTooltip, children }) {
  const expanded = activeTooltip === tooltipKey;
  return (
    <View style={styles.questionBlock}>
      <View style={styles.questionHeader}>
        <Text style={styles.questionTitle}>{title}</Text>
        <Pressable style={({ pressed }) => [styles.infoButton, pressed 
          && styles.infoButtonPressed]} onPress={() => onToggleTooltip(tooltipKey)}>
          <Text style={styles.infoButtonText}>i</Text>
        </Pressable>
      </View>
      {expanded && <Text style={styles.tooltipText}>Why we're asking this: {tooltip}</Text>}
      {children}
    </View>
  );
}

function OptionGrid({ options, selectedValue, onSelect }) {
  return (
    <View style={styles.optionGrid}>
      {options.map((option) => {
        const active = selectedValue === option;
        return (
          <Pressable key={option} style={({ pressed }) => 
            [styles.option, active && styles.optionActive, pressed 
            && styles.optionPressed]} onPress={() => onSelect(option)}>
            <Text style={[styles.optionText, active && styles.optionTextActive]}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function MultiOptionGrid({ options, selectedValues, onToggle }) {
  return (
    <View style={styles.optionGrid}>
      {options.map((option) => {
        const active = selectedValues.includes(option);
        return (
          <Pressable key={option} style={({ pressed }) => 
            [styles.option, active && styles.optionActive, pressed 
            && styles.optionPressed]} onPress={() => onToggle(option)}>
            <Text style={[styles.optionText, active && styles.optionTextActive]}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function RegistrationScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [fontsLoaded] = useAppFonts();

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSignUp = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      navigation.navigate('OTPVerification', { email: email.trim() });
    }, 350);
  };

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7f011f" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 0}
      >
        <ScrollView
          contentContainerStyle={[styles.content, keyboardVisible ? styles.contentKeyboardOpen : styles.contentKeyboardClosed]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        >
          <Text style={styles.heading}>Create Account</Text>
          <Text style={styles.subheading}>Set up your Miss Migraine account</Text>

          <View style={styles.formCard}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#aaaaaa"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Create a password"
              placeholderTextColor="#aaaaaa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <View style={styles.strengthRow}>
              <View style={styles.strengthTrack}>
                <View style={[styles.strengthFill, { width: strength.width, backgroundColor: strength.color }]} />
              </View>
              <Text style={[styles.strengthText, { color: strength.color }]}>{strength.label}</Text>
            </View>

            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              placeholderTextColor="#aaaaaa"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, submitting && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </Pressable>
          </View>

          <Pressable style={({ pressed }) => [styles.loginLinkWrap, pressed && styles.linkPressed]} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Already have an account? Login</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function OtpVerificationScreen({ navigation, route }) {
  const email = route.params?.email || '';
  const role = route.params?.role || 'user';
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);
  const [fontsLoaded] = useAppFonts();

  useEffect(() => {
    if (secondsLeft <= 0) {
      return undefined;
    }
    const timer = setTimeout(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handleDigitChange = (text, index) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const nextDigits = [...otpDigits];
    nextDigits[index] = digit;
    setOtpDigits(nextDigits);
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (event, index) => {
    if (event.nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    if (role === 'trusted_person') {
      navigation.reset({
        index: 0,
        routes: [{ name: 'TrustedApp', params: { role: 'trusted_person', email } }],
      });
      return;
    }

    navigation.replace('Onboarding', {
      email,
      onboardingState: createDefaultOnboardingState(email),
      initialStep: 1,
      frontendOnly: true,
    });
  };

  const handleResend = () => {
    setResending(true);
    setTimeout(() => {
      setResending(false);
      setSecondsLeft(60);
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      Alert.alert('Code resent', 'A new dummy code was sent.');
    }, 500);
  };

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7f011f" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.otpHeader}>
          <Text style={styles.heading}>Verify Email</Text>
          <Text style={styles.subheading}>We sent a 6-digit code to {email}</Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.otpInputRow}>
            {otpDigits.map((value, index) => (
              <TextInput
                key={`${index}`}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={styles.otpInput}
                value={value}
                onChangeText={(text) => handleDigitChange(text, index)}
                onKeyPress={(event) => handleKeyPress(event, index)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
              />
            ))}
          </View>

          <Text style={styles.otpTimer}>OTP expires in {secondsLeft}s</Text>

          <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={handleVerify}>
            <Text style={styles.buttonText}>Verify</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.loginLinkWrap, pressed && styles.linkPressed, (secondsLeft > 0 || resending) && styles.buttonDisabled]}
            onPress={handleResend}
            disabled={secondsLeft > 0 || resending}
          >
            <Text style={styles.loginLink}>{secondsLeft > 0 ? `Resend Code in ${secondsLeft}s` : 'Resend Code'}</Text>
          </Pressable>

          <Pressable style={({ pressed }) => [styles.loginLinkWrap, pressed && styles.linkPressed]} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Back to Login</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function OnboardingScreen({ navigation, route }) {
  const seedState = route.params?.onboardingState || createDefaultOnboardingState(route.params?.email || '');
  const [step, setStep] = useState(route.params?.initialStep || 1);
  const [answers, setAnswers] = useState(seedState.answers || createDefaultOnboardingAnswers(seedState.email));
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [fontsLoaded] = useAppFonts();

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const toggleTooltip = (key) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTooltip((prev) => (prev === key ? null : key));
  };

  const update = (field, value) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSymptom = (value) => {
    setAnswers((prev) => {
      const exists = prev.commonSymptoms.includes(value);
      return {
        ...prev,
        commonSymptoms: exists
          ? prev.commonSymptoms.filter((item) => item !== value)
          : [...prev.commonSymptoms, value],
      };
    });
  };

  const completeAndGoMain = (completed) => {
    const onboardingState = {
      email: seedState.email,
      answers,
      completed,
      skipped: !completed,
      firstUnansweredStep: completed ? TOTAL_ONBOARDING_STEPS : getFirstUnansweredStep(answers),
    };
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainApp', params: { onboardingState, showPostSignupWelcome: true } }],
    });
  };

  const continueStep = () => {
    if (step === TOTAL_ONBOARDING_STEPS) {
      completeAndGoMain(true);
      return;
    }
    setStep((prev) => Math.min(prev + 1, TOTAL_ONBOARDING_STEPS));
  };

  const skipStep = () => {
    setStep((prev) => Math.min(prev + 1, TOTAL_ONBOARDING_STEPS));
  };

  const summaryLines = [
    answers.onsetAge ? `First migraine age: ${answers.onsetAge}` : null,
    answers.monthlyFrequency ? `Monthly frequency: ${answers.monthlyFrequency}` : null,
    answers.typicalIntensity ? `Typical intensity: ${answers.typicalIntensity}/10` : null,
    answers.auraFrequency ? `Aura: ${answers.auraFrequency}` : null,
    answers.cycleCorrelation ? `Cycle correlation: ${answers.cycleCorrelation}` : null,
  ].filter(Boolean);

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7f011f" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.onboardingScreenRoot}>
        <ProgressHeader step={step} onSkipForNow={() => completeAndGoMain(false)} allowSkip={step !== TOTAL_ONBOARDING_STEPS} />

        <View style={styles.onboardingMiddleArea}>
          <View style={[styles.formCard, styles.onboardingFormCard]}>
            <ScrollView
              style={styles.onboardingCardScroll}
              contentContainerStyle={styles.onboardingCardContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {step === 1 && (
                <>
                  <Text style={styles.heading}>Let's get to know you</Text>
                  <Text style={styles.subheading}>Answering a few questions will help us personalise your experience</Text>
                  <Text style={styles.previewText}>We'll use your answers to find patterns in your migraines.</Text>
                  <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={continueStep}>
                    <Text style={styles.buttonText}>Get Started</Text>
                  </Pressable>
                </>
              )}

              {step === 2 && (
                <QuestionBlock
                  title="At what age did you experience your first migraine?"
                  tooltip="Knowing your migraine onset helps us understand how long you've been experiencing them"
                  tooltipKey="onset"
                  activeTooltip={activeTooltip}
                  onToggleTooltip={toggleTooltip}
                >
                  <OptionGrid options={onsetOptions} selectedValue={answers.onsetAge} onSelect={(value) => update('onsetAge', value)} />
                </QuestionBlock>
              )}

              {step === 3 && (
                <>
                  <QuestionBlock
                    title="How many migraine attacks do you experience per month?"
                    tooltip="Your frequency helps us set a baseline to track improvements"
                    tooltipKey="frequency"
                    activeTooltip={activeTooltip}
                    onToggleTooltip={toggleTooltip}
                  >
                    <OptionGrid options={frequencyOptions} selectedValue={answers.monthlyFrequency} onSelect={(value) => update('monthlyFrequency', value)} />
                  </QuestionBlock>

                  <QuestionBlock
                    title="What is your typical migraine pain intensity?"
                    tooltip="We'll compare your intensity over time and suggest patterns"
                    tooltipKey="intensity"
                    activeTooltip={activeTooltip}
                    onToggleTooltip={toggleTooltip}
                  >
                    <View style={styles.intensityScaleLabels}>
                      <Text style={styles.scaleHint}>1 = Very mild</Text>
                      <Text style={styles.scaleHint}>5 = Moderate</Text>
                      <Text style={styles.scaleHint}>10 = Severe</Text>
                    </View>
                    <View style={styles.intensityGrid}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                        const selected = answers.typicalIntensity === num;
                        return (
                          <Pressable
                            key={`${num}`}
                            style={({ pressed }) => [styles.intensityCell, selected && styles.optionActive, pressed && styles.optionPressed]}
                            onPress={() => update('typicalIntensity', num)}
                          >
                            <Text style={[styles.intensityCellText, selected && styles.optionTextActive]}>{num}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </QuestionBlock>
                </>
              )}

              {step === 4 && (
                <>
                  <QuestionBlock
                    title="What symptoms do you commonly experience?"
                    tooltip="Tracking symptoms helps us understand your migraine type"
                    tooltipKey="symptoms"
                    activeTooltip={activeTooltip}
                    onToggleTooltip={toggleTooltip}
                  >
                    <MultiOptionGrid options={symptomOptions} selectedValues={answers.commonSymptoms} onToggle={toggleSymptom} />
                    {answers.commonSymptoms.includes('Other') && (
                      <TextInput
                        style={styles.input}
                        placeholder="Add other symptoms"
                        placeholderTextColor="#aaaaaa"
                        value={answers.otherSymptoms}
                        onChangeText={(value) => update('otherSymptoms', value)}
                      />
                    )}
                  </QuestionBlock>

                  <QuestionBlock
                    title="Do you experience aura before your migraines?"
                    tooltip="Aura includes visual disturbances like flashes, zigzag lines, or blind spots"
                    tooltipKey="aura"
                    activeTooltip={activeTooltip}
                    onToggleTooltip={toggleTooltip}
                  >
                    <OptionGrid options={auraOptions} selectedValue={answers.auraFrequency} onSelect={(value) => update('auraFrequency', value)} />
                  </QuestionBlock>
                </>
              )}

              {step === 5 && (
                <>
                  <QuestionBlock
                    title="Do you currently have a menstrual cycle?"
                    tooltip="This helps us identify hormonal patterns in your migraines"
                    tooltipKey="hasCycle"
                    activeTooltip={activeTooltip}
                    onToggleTooltip={toggleTooltip}
                  >
                    <OptionGrid options={cyclePresenceOptions} selectedValue={answers.hasMenstrualCycle} onSelect={(value) => update('hasMenstrualCycle', value)} />
                  </QuestionBlock>

                  {answers.hasMenstrualCycle === 'Yes' && (
                    <>
                      <QuestionBlock
                        title="Is your cycle regular or irregular?"
                        tooltip="Cycle regularity affects how we predict your patterns"
                        tooltipKey="cycleRegularity"
                        activeTooltip={activeTooltip}
                        onToggleTooltip={toggleTooltip}
                      >
                        <OptionGrid options={cycleRegularityOptions} selectedValue={answers.cycleRegularity} onSelect={(value) => update('cycleRegularity', value)} />
                      </QuestionBlock>

                      <QuestionBlock
                        title="What is your average cycle length?"
                        tooltip="This helps us predict your cycle phases accurately"
                        tooltipKey="cycleLength"
                        activeTooltip={activeTooltip}
                        onToggleTooltip={toggleTooltip}
                      >
                        <OptionGrid options={cycleLengthOptions} selectedValue={answers.cycleLength} onSelect={(value) => update('cycleLength', value)} />
                      </QuestionBlock>
                    </>
                  )}

                  <QuestionBlock
                    title="Do you experience migraine in relation to your menstrual cycle?"
                    tooltip="This is the core of our cycle-migraine tracking"
                    tooltipKey="cycleCorrelation"
                    activeTooltip={activeTooltip}
                    onToggleTooltip={toggleTooltip}
                  >
                    <OptionGrid options={cycleCorrelationOptions} selectedValue={answers.cycleCorrelation} onSelect={(value) => update('cycleCorrelation', value)} />
                  </QuestionBlock>

                  {['Rarely', 'Sometimes', 'Often', 'Always'].includes(answers.cycleCorrelation) && (
                    <QuestionBlock
                      title="When do your migraines typically occur?"
                      tooltip="This helps us pinpoint your most vulnerable days"
                      tooltipKey="cycleTiming"
                      activeTooltip={activeTooltip}
                      onToggleTooltip={toggleTooltip}
                    >
                      <OptionGrid options={cycleTimingOptions} selectedValue={answers.cycleTiming} onSelect={(value) => update('cycleTiming', value)} />
                    </QuestionBlock>
                  )}
                </>
              )}

              {step === 6 && (
                <>
                  <Text style={styles.heading}>You're all set!</Text>
                  <Text style={styles.subheading}>Your profile is complete. We'll now personalise your experience.</Text>
                  <View style={styles.summaryBox}>
                    {summaryLines.length > 0 ? (
                      summaryLines.map((line) => (
                        <Text key={line} style={styles.summaryLine}>• {line}</Text>
                      ))
                    ) : (
                      <Text style={styles.summaryLine}>You skipped some questions — you can complete your profile anytime.</Text>
                    )}
                  </View>
                  <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={continueStep}>
                    <Text style={styles.buttonText}>Go to Dashboard</Text>
                  </Pressable>
                </>
              )}

              <View style={styles.personalizationBanner}>
                <Text style={styles.personalizationText}>{getPersonalizationMessage(step, answers)}</Text>
              </View>
            </ScrollView>
          </View>
        </View>

        {step > 1 && step < TOTAL_ONBOARDING_STEPS && (
          <View style={styles.bottomNavDock}>
            <View style={styles.bottomNavRow}>
              <Pressable style={({ pressed }) => [styles.backButton, pressed && styles.optionPressed]} onPress={() => setStep((prev) => Math.max(prev - 1, 1))}>
                <Text style={styles.backButtonText}>Back</Text>
              </Pressable>
              <Pressable style={({ pressed }) => [styles.skipButton, pressed && styles.topSkipPressed]} onPress={skipStep}>
                <Text style={styles.skipButtonText}>Skip</Text>
              </Pressable>
              <Pressable style={({ pressed }) => [styles.continueButton, pressed && styles.buttonPressed]} onPress={continueStep}>
                <Text style={styles.continueButtonText}>Continue</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardContainer: {
    flex: 1,
  },
  onboardingScreenRoot: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 10,
  },
  onboardingMiddleArea: {
    flex: 1,
    paddingBottom: 8,
  },
  onboardingFormCard: {
    flex: 1,
    padding: 0,
    overflow: 'hidden',
  },
  onboardingCardScroll: {
    flex: 1,
  },
  onboardingCardContent: {
    padding: 16,
    paddingBottom: 14,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
  },
  contentKeyboardClosed: {
    justifyContent: 'center',
  },
  contentKeyboardOpen: {
    justifyContent: 'flex-start',
  },
  heading: {
    fontSize: 30,
    fontFamily: 'ReemKufi-Medium',
    color: '#7f011f',
    textAlign: 'center',
    marginBottom: 6,
  },
  subheading: {
    fontSize: 14,
    fontFamily: 'Plein-Light',
    color: '#777777',
    textAlign: 'center',
    marginBottom: 20,
  },
  formCard: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ececec',
    borderRadius: 16,
    padding: 16,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Plein-Medium',
    color: '#0d0d0d',
    marginBottom: 7,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e2e2',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    fontFamily: 'Plein-Regular',
    color: '#0d0d0d',
  },
  strengthRow: {
    marginTop: 8,
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  strengthTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#ececec',
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 999,
  },
  strengthText: {
    fontSize: 12,
    fontFamily: 'Plein-Medium',
  },
  button: {
    marginTop: 16,
    backgroundColor: '#7f011f',
    borderRadius: 12,
    paddingVertical: 13,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48,
  },
  buttonPressed: {
    backgroundColor: '#ff727b',
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'Plein-Medium',
  },
  loginLinkWrap: {
    marginTop: 18,
    alignItems: 'center',
  },
  loginLink: {
    fontSize: 14,
    fontFamily: 'Plein-Medium',
    color: '#7f011f',
  },
  linkPressed: {
    opacity: 0.65,
  },
  otpHeader: {
    marginBottom: 18,
  },
  otpInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  otpInput: {
    width: 44,
    height: 52,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dfdfdf',
    backgroundColor: '#ffffff',
    fontSize: 20,
    fontFamily: 'Plein-Medium',
    color: '#0d0d0d',
  },
  otpTimer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#777777',
    fontFamily: 'Plein-Light',
    marginBottom: 4,
  },
  progressHeader: {
    marginBottom: 14,
  },
  progressTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    color: '#7f011f',
    fontSize: 13,
    fontFamily: 'Plein-Medium',
  },
  topSkipButton: {
    backgroundColor: '#fff3f6',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#f0d1da',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  topSkipPressed: {
    backgroundColor: '#f7e7ec',
  },
  topSkipText: {
    color: '#7f011f',
    fontSize: 12,
    fontFamily: 'Plein-Medium',
  },
  topSkipSpacer: {
    width: 86,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#ececec',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7f011f',
  },
  questionBlock: {
    marginBottom: 16,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 10,
  },
  questionTitle: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Plein-Medium',
    color: '#0d0d0d',
    lineHeight: 21,
  },
  infoButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#efe5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoButtonPressed: {
    opacity: 0.7,
  },
  infoButtonText: {
    fontSize: 13,
    fontFamily: 'Plein-Medium',
    color: '#7f011f',
  },
  tooltipText: {
    fontSize: 12,
    fontFamily: 'Plein-Light',
    color: '#666666',
    lineHeight: 18,
    marginBottom: 10,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e2e2',
    borderRadius: 16,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  optionActive: {
    backgroundColor: '#7f011f',
    borderColor: '#7f011f',
  },
  optionPressed: {
    opacity: 0.7,
  },
  optionText: {
    color: '#555555',
    fontSize: 12,
    fontFamily: 'Plein-Medium',
  },
  optionTextActive: {
    color: '#ffffff',
  },
  intensityScaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  scaleHint: {
    fontSize: 11,
    fontFamily: 'Plein-Light',
    color: '#888888',
  },
  intensityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  intensityCell: {
    width: '18%',
    aspectRatio: 1,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e2e2e2',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  intensityCellText: {
    fontFamily: 'Plein-Medium',
    fontSize: 13,
    color: '#0d0d0d',
    textAlign: 'center',
    includeFontPadding: false,
  },
  previewText: {
    fontSize: 13,
    fontFamily: 'Plein-Regular',
    color: '#555555',
    marginBottom: 10,
  },
  personalizationBanner: {
    marginTop: 12,
    backgroundColor: '#fff5f7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f2d7df',
    padding: 10,
  },
  personalizationText: {
    fontSize: 12,
    fontFamily: 'Plein-Regular',
    color: '#5a3e46',
    lineHeight: 17,
  },
  bottomNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bottomNavDock: {
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: '#ffffff',
  },
  backButton: {
    borderWidth: 1,
    borderColor: '#dfdfdf',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  backButtonText: {
    color: '#555555',
    fontSize: 14,
    fontFamily: 'Plein-Medium',
  },
  skipButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#f0c7d1',
    backgroundColor: '#fff5f7',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#7f011f',
    fontSize: 14,
    fontFamily: 'Plein-Medium',
  },
  continueButton: {
    flex: 1,
    backgroundColor: '#7f011f',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Plein-Medium',
  },
  summaryBox: {
    borderWidth: 1,
    borderColor: '#ececec',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 12,
    marginBottom: 10,
    gap: 6,
  },
  summaryLine: {
    color: '#333333',
    fontSize: 13,
    fontFamily: 'Plein-Regular',
    lineHeight: 18,
  },
});
