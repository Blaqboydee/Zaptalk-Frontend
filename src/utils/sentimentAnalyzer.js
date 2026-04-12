// Lightweight client-side sentiment analyzer — no API needed
// Returns a mood string: "happy", "angry", "sad", "chill", "love", "hype", "neutral"

const LEXICON = {
  happy: [
    'happy', 'haha', 'lol', 'lmao', 'rofl', 'joy', 'glad', 'great', 'awesome',
    'amazing', 'wonderful', 'fantastic', 'nice', 'good', 'yay', 'woohoo', 'excellent',
    'brilliant', 'fun', 'funny', 'hilarious', 'laugh', 'smile', 'grin', 'pleased',
    'cheerful', 'delighted', 'thrilled', 'blessed', 'grateful', 'thankful', 'celebrate',
    'congrats', 'congratulations', 'cheers', 'woo', 'yeee', 'yesss', 'lessgo',
    ':)', ':-)', ':d', 'xd', '😂', '😄', '😊', '🤣', '😁', '🎉', '🥳',
  ],
  angry: [
    'angry', 'mad', 'furious', 'hate', 'damn', 'hell', 'wtf', 'stfu', 'shut up',
    'annoyed', 'frustrated', 'pissed', 'rage', 'ugh', 'terrible', 'worst', 'stupid',
    'idiot', 'dumb', 'ridiculous', 'disgusting', 'sick of', 'tired of', 'fed up',
    'unbelievable', 'pathetic', 'trash', 'garbage', 'horrible', 'awful',
    '😡', '🤬', '💢', '😤',
  ],
  sad: [
    'sad', 'cry', 'crying', 'tears', 'depressed', 'lonely', 'alone', 'miss',
    'missing', 'heartbroken', 'hurt', 'pain', 'sorry', 'apologize', 'regret',
    'unfortunately', 'disappointed', 'sigh', 'broken', 'lost', 'gone', 'died',
    'death', 'funeral', 'grief', 'mourn', 'rip', 'goodbye', 'farewell',
    'unhappy', 'miserable', 'suffer', 'struggling', 'tough', 'hard time',
    '😢', '😭', '💔', '😞', '😔', '🥺', ':(', ':(',
  ],
  love: [
    'love', 'adore', 'crush', 'babe', 'baby', 'darling', 'sweetheart', 'honey',
    'beautiful', 'gorgeous', 'pretty', 'handsome', 'cute', 'kiss', 'hugs', 'hug',
    'miss you', 'love you', 'heart', 'romance', 'romantic', 'affection', 'caring',
    'soulmate', 'forever', 'always', 'together', 'cherish', 'treasure', 'precious',
    '❤️', '💕', '💗', '💖', '😍', '🥰', '😘', '💋', '♥️', '<3',
  ],
  hype: [
    'omg', 'insane', 'crazy', 'wild', 'fire', 'lit', 'goat', 'goated', 'epic',
    'legendary', 'unreal', 'sick', 'dope', 'bussin', 'slay', 'slayed', 'no way',
    'bruh', 'bro', 'sheesh', 'dayum', 'damn', 'incredible', 'mindblowing',
    'lets go', "let's go", 'lesgooo', 'hype', 'excited', 'pumped', 'stoked',
    'can\'t wait', 'finally', 'yooo', 'yoooo',
    '🔥', '🚀', '💯', '⚡', '🐐', '😱', '🤯', '💪',
  ],
  chill: [
    'chill', 'relax', 'vibes', 'vibe', 'calm', 'peace', 'peaceful', 'cozy',
    'easy', 'meh', 'whatever', 'idk', 'hmm', 'nah', 'cool', 'alright', 'okay',
    'fine', 'sure', 'yep', 'yeah', 'k', 'kk', 'np', 'no worries', 'all good',
    'laidback', 'weekend', 'sleepy', 'tired', 'rest', 'bed', 'sleep',
    '😌', '🧘', '✌️', '💤', '😴',
  ],
};

// Emoji-only boosts
const EMOJI_MOOD = {
  '😂': 'happy', '🤣': 'happy', '😄': 'happy', '😁': 'happy', '😊': 'happy', '🥳': 'happy', '🎉': 'happy',
  '😡': 'angry', '🤬': 'angry', '😤': 'angry', '💢': 'angry',
  '😢': 'sad', '😭': 'sad', '💔': 'sad', '😞': 'sad', '😔': 'sad', '🥺': 'sad',
  '❤️': 'love', '💕': 'love', '💗': 'love', '😍': 'love', '🥰': 'love', '😘': 'love', '💋': 'love',
  '🔥': 'hype', '🚀': 'hype', '💯': 'hype', '⚡': 'hype', '🤯': 'hype', '💪': 'hype',
  '😌': 'chill', '💤': 'chill', '😴': 'chill', '✌️': 'chill',
};

export function analyzeSentiment(text) {
  if (!text) return 'neutral';
  const lower = text.toLowerCase();
  const scores = { happy: 0, angry: 0, sad: 0, love: 0, hype: 0, chill: 0 };

  // Word matching
  for (const [mood, words] of Object.entries(LEXICON)) {
    for (const word of words) {
      if (lower.includes(word)) scores[mood] += 1;
    }
  }

  // Emoji scanning — each emoji individually
  for (const char of text) {
    if (EMOJI_MOOD[char]) scores[EMOJI_MOOD[char]] += 1.5;
  }
  // Multi-char emoji
  for (const [emoji, mood] of Object.entries(EMOJI_MOOD)) {
    if (emoji.length > 1 && lower.includes(emoji)) scores[mood] += 1.5;
  }

  // Caps lock rage boost
  const capsRatio = (text.replace(/[^A-Z]/g, '').length) / Math.max(text.replace(/\s/g, '').length, 1);
  if (capsRatio > 0.6 && text.length > 4) {
    scores.angry += 2;
    scores.hype += 1;
  }

  // Exclamation marks boost hype/happy
  const exclamations = (text.match(/!/g) || []).length;
  if (exclamations >= 2) {
    scores.hype += exclamations * 0.5;
    scores.happy += exclamations * 0.3;
  }

  // Find winner
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0 ? best[0] : 'neutral';
}

// Analyse last N messages and return dominant mood
export function analyzeConversationMood(messages, count = 8) {
  if (!messages || messages.length === 0) return 'neutral';
  const recent = messages.slice(-count);
  const moodCounts = {};
  for (const msg of recent) {
    const mood = analyzeSentiment(msg.content);
    moodCounts[mood] = (moodCounts[mood] || 0) + 1;
  }
  const best = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
  return best ? best[0] : 'neutral';
}

// Returns CSS variables / config for each mood
export function getMoodTheme(mood) {
  const themes = {
    happy: {
      gradient: 'linear-gradient(135deg, rgba(255,183,77,0.08), rgba(255,235,59,0.05))',
      particleColor: '#FFB74D',
      glowColor: 'rgba(255,183,77,0.15)',
      accentBorder: 'rgba(255,183,77,0.12)',
      label: 'Warm vibes',
      emoji: '☀️',
    },
    angry: {
      gradient: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(185,28,28,0.06))',
      particleColor: '#EF4444',
      glowColor: 'rgba(239,68,68,0.12)',
      accentBorder: 'rgba(239,68,68,0.15)',
      label: 'Getting heated',
      emoji: '⚡',
    },
    sad: {
      gradient: 'linear-gradient(135deg, rgba(96,165,250,0.08), rgba(147,197,253,0.04))',
      particleColor: '#60A5FA',
      glowColor: 'rgba(96,165,250,0.1)',
      accentBorder: 'rgba(96,165,250,0.1)',
      label: 'Melancholic',
      emoji: '🌧️',
    },
    love: {
      gradient: 'linear-gradient(135deg, rgba(244,63,94,0.1), rgba(251,113,133,0.05))',
      particleColor: '#F43F5E',
      glowColor: 'rgba(244,63,94,0.12)',
      accentBorder: 'rgba(244,63,94,0.12)',
      label: 'Feeling the love',
      emoji: '💗',
    },
    hype: {
      gradient: 'linear-gradient(135deg, rgba(255,87,34,0.1), rgba(245,158,11,0.06))',
      particleColor: '#FF5722',
      glowColor: 'rgba(255,87,34,0.15)',
      accentBorder: 'rgba(255,87,34,0.15)',
      label: 'HYPE',
      emoji: '🔥',
    },
    chill: {
      gradient: 'linear-gradient(135deg, rgba(139,92,246,0.07), rgba(99,102,241,0.04))',
      particleColor: '#8B5CF6',
      glowColor: 'rgba(139,92,246,0.08)',
      accentBorder: 'rgba(139,92,246,0.08)',
      label: 'Chill zone',
      emoji: '🧘',
    },
    neutral: {
      gradient: 'none',
      particleColor: 'transparent',
      glowColor: 'transparent',
      accentBorder: 'transparent',
      label: '',
      emoji: '',
    },
  };
  return themes[mood] || themes.neutral;
}
