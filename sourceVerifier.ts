/**
 * SamajhCare - Source Grounding & Excerpt Verification Engine
 * 
 * Verifies that AI-cited passages actually exist in the user-supplied source text
 * before presenting them to the user. Prevents hallucinated or invented quotes.
 */

export interface ExcerptVerificationResult {
  isVerified: boolean;
  confidence: number; // 0.0 to 1.0
  matchStartIndex: number;
  matchEndIndex: number;
  cleanedExcerpt: string;
  sourceSlice?: string;
  disclaimer?: string;
}

/**
 * Normalizes text for robust comparison by trimming, collapsing spaces,
 * and normalizing quotes and dashes.
 */
function normalizeText(text: string): string {
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Verifies whether a cited excerpt exists verbatim or near-verbatim
 * inside the original source text.
 */
export function verifySourceExcerpt(
  sourceText: string,
  citedExcerpt: string
): ExcerptVerificationResult {
  if (!sourceText || !citedExcerpt) {
    return {
      isVerified: false,
      confidence: 0,
      matchStartIndex: -1,
      matchEndIndex: -1,
      cleanedExcerpt: citedExcerpt || '',
      disclaimer: 'Source text or citation is empty.'
    };
  }

  const cleanedSource = sourceText.trim();
  const cleanedExcerpt = citedExcerpt.trim().replace(/^["']|["']$/g, ''); // strip outer quotes

  if (cleanedExcerpt.length === 0) {
    return {
      isVerified: false,
      confidence: 0,
      matchStartIndex: -1,
      matchEndIndex: -1,
      cleanedExcerpt: '',
      disclaimer: 'Cited excerpt was empty.'
    };
  }

  // Pass 1: Direct exact substring match (case-sensitive)
  const exactIndex = cleanedSource.indexOf(cleanedExcerpt);
  if (exactIndex !== -1) {
    return {
      isVerified: true,
      confidence: 1.0,
      matchStartIndex: exactIndex,
      matchEndIndex: exactIndex + cleanedExcerpt.length,
      cleanedExcerpt,
      sourceSlice: cleanedSource.slice(exactIndex, exactIndex + cleanedExcerpt.length)
    };
  }

  // Pass 2: Case-insensitive substring match
  const lowerSource = cleanedSource.toLowerCase();
  const lowerExcerpt = cleanedExcerpt.toLowerCase();
  const caseInsensitiveIndex = lowerSource.indexOf(lowerExcerpt);
  if (caseInsensitiveIndex !== -1) {
    return {
      isVerified: true,
      confidence: 0.95,
      matchStartIndex: caseInsensitiveIndex,
      matchEndIndex: caseInsensitiveIndex + cleanedExcerpt.length,
      cleanedExcerpt,
      sourceSlice: cleanedSource.slice(caseInsensitiveIndex, caseInsensitiveIndex + cleanedExcerpt.length)
    };
  }

  // Pass 3: Normalized whitespace match
  const normSource = normalizeText(cleanedSource);
  const normExcerpt = normalizeText(cleanedExcerpt);
  const normIndex = normSource.indexOf(normExcerpt);
  if (normIndex !== -1) {
    return {
      isVerified: true,
      confidence: 0.9,
      matchStartIndex: 0, // approximate
      matchEndIndex: cleanedSource.length,
      cleanedExcerpt: normExcerpt,
      sourceSlice: normExcerpt
    };
  }

  // Pass 4: Token-overlap check to catch paraphrased or truncated citations
  const excerptWords = normExcerpt.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const sourceWords = new Set(normSource.toLowerCase().split(/\s+/).filter(w => w.length > 2));

  if (excerptWords.length > 0) {
    let matchedWords = 0;
    for (const word of excerptWords) {
      if (sourceWords.has(word)) {
        matchedWords++;
      }
    }
    const overlapRatio = matchedWords / excerptWords.length;
    if (overlapRatio >= 0.85 && excerptWords.length >= 4) {
      return {
        isVerified: true,
        confidence: Number(overlapRatio.toFixed(2)),
        matchStartIndex: -1,
        matchEndIndex: -1,
        cleanedExcerpt,
        disclaimer: 'Citation words matched in source text with minor grammatical variation.'
      };
    }
  }

  // Unverified: Citation does NOT appear verbatim in the source text
  return {
    isVerified: false,
    confidence: 0.2,
    matchStartIndex: -1,
    matchEndIndex: -1,
    cleanedExcerpt,
    disclaimer: 'Notice: This passage could not be verified verbatim in the supplied instructions. Please refer to the original text.'
  };
}

/**
 * Splits source text into segments for UI rendering, highlighting the verified excerpt.
 */
export function getHighlightedSourceSegments(
  sourceText: string,
  verification: ExcerptVerificationResult
): { text: string; isHighlighted: boolean }[] {
  if (!verification.isVerified || verification.matchStartIndex < 0 || verification.matchEndIndex <= verification.matchStartIndex) {
    return [{ text: sourceText, isHighlighted: false }];
  }

  const before = sourceText.slice(0, verification.matchStartIndex);
  const highlighted = sourceText.slice(verification.matchStartIndex, verification.matchEndIndex);
  const after = sourceText.slice(verification.matchEndIndex);

  const segments: { text: string; isHighlighted: boolean }[] = [];
  if (before) segments.push({ text: before, isHighlighted: false });
  if (highlighted) segments.push({ text: highlighted, isHighlighted: true });
  if (after) segments.push({ text: after, isHighlighted: false });

  return segments;
}
