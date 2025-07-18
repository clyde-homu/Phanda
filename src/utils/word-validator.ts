// Basic word dictionary for validation
const VALID_WORDS = new Set([
  // 3-letter words
  'CAT',
  'CAR',
  'ART',
  'TAR',
  'RAT',
  'ACT',
  'SUN',
  'RUN',
  'NUN',
  'SON',
  'WON',
  'ONE',
  'ORE',
  'ROE',
  'ERA',
  'EAR',
  'ARE',
  'AND',
  'CAN',
  'GOD',
  'COD',

  // 4-letter words
  'CART',
  'CARD',
  'CARE',
  'RACE',
  'ACRE',
  'ARCH',
  'LOVE',
  'OVER',
  'ROVE',
  'LORE',
  'ROLE',
  'VOLE',
  'WORN',
  'NORM',
  'FORM',
  'ROOM',
  'MOON',
  'SOON',

  // 5-letter words
  'LOVER',
  'ROVER',
  'COVER',
  'CLOVER',
  'MOURN',
  'ROUND',
  'SOUND',
  'POUND',
  'BOUND',
  'GREAT',
  'TREAT',
  'WHEAT',
  'CHEAT',
  'HEART',

  // 6-letter words
  'WONDER',
  'WANDER',
  'TENDER',
  'RENDER',
  'SENDER',
  'MASTER',
  'MISTER',
  'SISTER',
  'LISTER',
  'FISTER',
  'CANADA',

  // 7-letter words
  'AMAZING',
  'AWESOME',
  'SPECIAL',
  'MAGICAL',
  'CAREFUL',

  // 8-letter words
  'ANACONDA',
]);

export const isValidWord = (word: string): boolean => {
  return VALID_WORDS.has(word.toUpperCase());
};

export const validateConnectedWord = (letters: string[]): string | null => {
  if (letters.length < 3) return null;

  const word = letters.join('').toUpperCase();
  return isValidWord(word) ? word : null;
};

export const areLettersAdjacent = (
  index1: number,
  index2: number,
  totalLetters: number,
): boolean => {
  // For circular arrangement, check if indices are adjacent
  const diff = Math.abs(index1 - index2);
  return diff === 1 || diff === totalLetters - 1;
};

export const canConnectLetters = (
  currentIndices: number[],
  newIndex: number,
  totalLetters: number,
): boolean => {
  if (currentIndices.length === 0) return true;

  const lastIndex = currentIndices[currentIndices.length - 1];
  if (lastIndex === undefined) return false;

  // Allow connections within a larger range for smoother interaction
  return (
    isWithinConnectionRange(lastIndex, newIndex, totalLetters) && !currentIndices.includes(newIndex)
  );
};

export const isWithinConnectionRange = (
  index1: number,
  index2: number,
  totalLetters: number,
): boolean => {
  // Allow connections to adjacent letters or with a gap of 1 for smoother interaction
  const diff = Math.abs(index1 - index2);
  const circularDiff = Math.min(diff, totalLetters - diff);
  return circularDiff <= 2; // Allow up to 2 steps for easier connection
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    const temp2 = shuffled[j];
    if (temp !== undefined && temp2 !== undefined) {
      shuffled[i] = temp2;
      shuffled[j] = temp;
    }
  }
  return shuffled;
};

export const getWordPositionInGrid = (word: string, targetWords: string[]): number => {
  return targetWords.findIndex((target) => target.toUpperCase() === word.toUpperCase());
};
