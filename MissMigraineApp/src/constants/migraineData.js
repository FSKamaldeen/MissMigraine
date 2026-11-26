// ─────────────────────────────────────────────────────
// Trusted person: Trigger → cause + how to help
// ─────────────────────────────────────────────────────

export const TRIGGER_TIPS = {
  stress: {
    cause: 'Stress is one of the most common migraine triggers.',
    tip: "Send a short, low-pressure message — something like 'thinking of you, no need to reply'. Don't ask for a phone call unless they suggest it. Offering to take something off their plate (a chore, an errand) can help more than advice.",
  },
  'poor sleep': {
    cause: 'Poor sleep or disrupted rest is a frequent migraine trigger.',
    tip: "Encourage them to rest and offer to handle anything noisy or demanding in the next few hours. A short, quiet check-in message later in the day means more than checking in now. Avoid asking 'are you feeling better yet?'",
  },
  'sleep deprivation': {
    cause: 'Sleep deprivation is a well-documented migraine trigger.',
    tip: "Let them sleep. If they have kids, pets, or a shared space, offer to keep things quiet for a couple of hours. A gentle 'no need to reply' text in the evening checking whether they got rest is a good follow-up.",
  },
  dehydration: {
    cause: 'Dehydration can trigger or worsen migraines.',
    tip: "If you're with them, bring a glass of water without being asked. A small gesture — refilling their bottle, offering an electrolyte drink — is more useful than reminding them to drink. Skip the lecture.",
  },
  'skipped meal': {
    cause: 'Skipping meals can drop blood sugar and trigger migraines.',
    tip: "Offer to bring or order something simple — toast, fruit, yogurt. Don't insist on a full meal. If you're ordering for them, keep it plain and easy on the stomach.",
  },
  'weather change': {
    cause: 'Barometric pressure changes are a known migraine trigger.',
    tip: "There's nothing they can do about the weather, so don't suggest fixes. What helps is lowering other demands: dim the lights if you're together, keep noise down, and let them rest without guilt.",
  },
  hormonal: {
    cause: 'Hormonal shifts (especially around a period) commonly trigger migraines.',
    tip: "Acknowledge it briefly without over-explaining — 'that sounds rough, I'm here' goes a long way. Offer a hot water bottle, a warm drink, or to take over something they were going to do. Don't minimise it as 'just that time of month'.",
  },
  'screen time': {
    cause: 'Prolonged screen time can strain the eyes and trigger migraines.',
    tip: "If you're messaging them, keep it to one short text and don't expect a quick reply. Offer to handle anything that involves screens for them today — ordering food, replying to a group chat, booking something.",
  },
  caffeine: {
    cause: 'Caffeine changes (too much, too little, or withdrawal) can trigger migraines.',
    tip: "Don't make jokes about coffee. If you're together, offer a small, consistent cup if that's what they usually have — or a decaf alternative if they're cutting back. Ask what they'd prefer rather than deciding for them.",
  },
  alcohol: {
    cause: 'Alcohol, especially red wine, is a common migraine trigger.',
    tip: "Keep water nearby, and don't push them to 'just have one more'. If you're out together, offer to head home early or grab them a glass of water without making a thing of it. No teasing about the hangover.",
  },
  'bright lights': {
    cause: 'Bright lights or glare can trigger migraines.',
    tip: "If you're in the same space, dim the lights or close the curtains without being asked. Offer sunglasses if they need to move around. Don't turn on overhead lights 'just for a second'.",
  },
  'loud noises': {
    cause: 'Loud noises can trigger or worsen migraines.',
    tip: "Lower the volume — TV, music, your own voice. If you're out, offer to move somewhere quieter. If you can't, send a text instead of calling. Offering earplugs or headphones is a small but thoughtful gesture.",
  },
  'strong smells': {
    cause: 'Strong smells (perfume, smoke, chemicals) are a known trigger.',
    tip: "If you're together, skip the perfume today and open a window if you can. Don't cook anything strong-smelling nearby. If you've been near smoke or chemicals, change your clothes before visiting.",
  },
  'certain foods': {
    cause: 'Certain foods (aged cheese, processed meats, chocolate) can trigger migraines in some people.',
    tip: "When you're ordering or cooking together, ask what's safe rather than guessing. Don't take it personally if they decline a food you made. If they mention a suspected trigger, note it — it helps them track patterns.",
  },
  travel: {
    cause: 'Travel can trigger migraines through sleep changes, dehydration, or motion.',
    tip: "Offer to handle logistics — booking, driving, navigating — so they can rest. Keep water and a snack on hand. Don't schedule anything demanding for the first day after travel.",
  },
  'neck tension': {
    cause: 'Neck tension or stiffness often accompanies migraines.',
    tip: "Offer a warm compress or a gentle shoulder rub if they're comfortable with touch. A supportive pillow or a heat pack on the back of the neck helps. Don't suggest a deep massage — the neck may be sensitive.",
  },
  anxiety: {
    cause: 'Anxiety is a common migraine trigger, often paired with stress.',
    tip: "Keep your tone calm and steady. A short message like 'no pressure to reply, just letting you know I'm here' is better than a long one. Don't try to problem-solve unless they ask — offering presence is often enough.",
  },
  exercise: {
    cause: 'Intense exercise can trigger migraines in some people.',
    tip: "If they usually work out with you, let them skip today without comment. Don't suggest 'pushing through it' or 'sweating it out' — that can make the migraine worse. Offer a low-key alternative like a walk or stretching later.",
  },
};

export const FALLBACK_TIP = {
  cause: "The cause isn't always clear — migraines often have more than one trigger.",
  tip: "A short, gentle check-in goes a long way: 'no need to reply, just thinking of you.' Offer to take something off their plate if you can. Don't ask how they're feeling repeatedly — give them space to rest.",
};

export function getTipForLog(log) {
  const triggers = log?.migraine_log_triggers || [];
  for (const t of triggers) {
    const name = (t.triggers?.name || '').toLowerCase();
    if (TRIGGER_TIPS[name]) return TRIGGER_TIPS[name];
  }
  return FALLBACK_TIP;
}

// ─────────────────────────────────────────────────────
// Main user: Trigger → cause + what you can do right now
// ─────────────────────────────────────────────────────

export const USER_TRIGGER_TIPS = {
  stress: {
    cause: 'Stress is a common migraine trigger — your body may still be holding onto tension.',
    tip: 'Close your eyes and take 10 slow breaths. If you can, lie down in a quiet room for 15 minutes. A warm compress on your shoulders can also help.',
  },
  'poor sleep': {
    cause: 'Poor sleep is one of the most common migraine triggers.',
    tip: 'Rest in a dark room. If you can nap, keep it under 30 minutes. Avoid screens for the next hour and try to get to bed at your usual time tonight.',
  },
  'sleep deprivation': {
    cause: 'Sleep deprivation can push your nervous system into a migraine.',
    tip: 'Lie down and close your eyes for 20–30 minutes. Hydrate, and avoid caffeine after 2pm so tonight’s sleep comes easier.',
  },
  dehydration: {
    cause: "Dehydration is a likely contributor — your body needs fluids.",
    tip: 'Sip a glass of water slowly. Add a pinch of salt or an electrolyte drink if you have one. Avoid alcohol and coffee for now.',
  },
  'skipped meal': {
    cause: 'Skipping meals can drop blood sugar and trigger a migraine.',
    tip: 'Try a small snack — something with protein and a bit of carbohydrate (yogurt, toast with peanut butter, a banana). Eat slowly.',
  },
  'weather change': {
    cause: 'Barometric pressure changes can trigger migraines — not something you can control, but worth noting for patterns.',
    tip: 'Rest in a dark, quiet room. If you have an acute medication prescribed, take it early — it works better at the first sign.',
  },
  hormonal: {
    cause: 'Hormonal shifts (especially around your period) are a very common migraine trigger.',
    tip: 'A warm compress on your lower belly or neck can ease tension. Rest, hydrate, and be gentle with yourself — this one is often harder to push through.',
  },
  'screen time': {
    cause: 'Prolonged screen time strains your eyes and can trigger a migraine.',
    tip: 'Put your phone down. Dim the lights, close the blinds, and rest your eyes for at least 20 minutes. If you must look at a screen, lower the brightness.',
  },
  caffeine: {
    cause: 'Caffeine changes — too much, too little, or withdrawal — can trigger a migraine.',
    tip: 'If you usually have caffeine, a small cup may ease withdrawal. If you’ve had too much, drink water and rest. Try to stay consistent tomorrow.',
  },
  alcohol: {
    cause: 'Alcohol, especially red wine, is a common migraine trigger.',
    tip: 'Drink water steadily for the next few hours. Rest, avoid more alcohol, and eat something light if you can.',
  },
  'bright lights': {
    cause: 'Bright lights or glare can trigger a migraine.',
    tip: 'Dim the room, close the blinds, and rest with your eyes closed. Sunglasses indoors can help if you need to move around.',
  },
  'loud noises': {
    cause: 'Loud noises can trigger or worsen a migraine.',
    tip: 'Move to a quieter space if possible. Earplugs or noise-cancelling headphones can take the edge off while you rest.',
  },
  'strong smells': {
    cause: 'Strong smells (perfume, smoke, chemicals) are a known trigger.',
    tip: 'Get fresh air if you can, or move away from the source. A fan or open window in a dark room often helps.',
  },
  'certain foods': {
    cause: 'Certain foods (aged cheese, processed meats, chocolate) can trigger migraines in some people.',
    tip: 'Note what you ate today in the Notes field — it’s useful for spotting patterns. Avoid that food for the rest of the day and hydrate.',
  },
  travel: {
    cause: 'Travel can trigger migraines through sleep changes, dehydration, or motion.',
    tip: 'Hydrate, rest when you can, and try to keep your sleep schedule as normal as possible. A cool compress on your forehead can ease the throbbing.',
  },
  'neck tension': {
    cause: 'Neck tension or stiffness often accompanies migraines.',
    tip: 'Gentle neck stretches, a warm compress on the back of the neck, or a supportive pillow can help. Avoid looking down at your phone for a while.',
  },
  anxiety: {
    cause: 'Anxiety is a common migraine trigger and often pairs with stress.',
    tip: 'Try 4-6 breathing: inhale for 4 seconds, exhale for 6 seconds, for 5 minutes. Lie down if you can. Your body needs to feel safe right now.',
  },
  exercise: {
    cause: 'Intense exercise can trigger a migraine in some people.',
    tip: 'Rest and hydrate. Gentle stretching is usually fine, but avoid strenuous activity for the rest of the day. A cool shower may help.',
  },
};

export const USER_FALLBACK_TIP = {
  cause: "Migraines often have more than one trigger, and sometimes the cause isn't clear.",
  tip: 'Rest in a dark, quiet room, sip some water, and give yourself permission to slow down. If it gets worse, reach out to someone you trust.',
};

export function getTipForUserLog(triggerNames) {
  // triggerNames is a plain array of strings from the draft
  for (const name of triggerNames || []) {
    const key = String(name || '').toLowerCase();
    if (USER_TRIGGER_TIPS[key]) return USER_TRIGGER_TIPS[key];
  }
  return USER_FALLBACK_TIP;
}