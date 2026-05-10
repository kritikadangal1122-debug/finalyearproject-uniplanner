const splitSentences = (text) => text
  .replace(/\s+/g, ' ')
  .split(/(?<=[.!?])\s+/)
  .map((sentence) => sentence.trim())
  .filter(Boolean);

const extractKeywords = (text) => {
  const words = text.toLowerCase().match(/[a-z]{5,}/g) ?? [];
  const unique = Array.from(new Set(words));
  return unique.slice(0, 6);
};

const buildQuestion = (sentence) => {
  const keywords = extractKeywords(sentence);
  const primary = keywords[0] ?? 'the concept';
  return {
    question: `What does the material say about ${primary}?`,
    answer: sentence.replace(/^[-*]\s*/, '').trim(),
    hint: `Focus on the sentence about ${primary}.`,
  };
};

export const summarizeText = (title, text) => {
  const sentences = splitSentences(text);
  const summary = sentences.slice(0, 2).join(' ') || text.slice(0, 240);
  const keywords = extractKeywords(text);

  return {
    title,
    summary,
    simpleExplanation: keywords.length
      ? `This content is mainly about ${keywords.join(', ')}.`
      : 'This content explains the core idea in a concise way.',
    keyPoints: keywords.length
      ? keywords.map((keyword) => keyword.replace(/-/g, ' '))
      : ['Review the full source', 'Capture one action item'],
  };
};

export const generateQuiz = (title, text, count = 3) => {
  const sentences = splitSentences(text);
  const questions = sentences.slice(0, count).map((sentence) => buildQuestion(sentence));

  while (questions.length < count) {
    questions.push({
      question: `What is a key takeaway from ${title}?`,
      answer: 'Use the source to restate the main idea in your own words.',
      hint: 'Find the most important sentence and restate it simply.',
    });
  }

  return { title, questions };
};

export const generateAssignmentFeedback = (submissionText, rubric = []) => {
  const wordCount = submissionText.trim().split(/\s+/).filter(Boolean).length;
  const score = Math.max(40, Math.min(98, Math.round(wordCount / 6)));
  const rubricFocus = rubric.length ? rubric.slice(0, 3) : ['clarity', 'evidence', 'structure'];

  return {
    title: 'Pre-submission feedback',
    score,
    strengths: [
      `The draft shows ${wordCount > 120 ? 'strong coverage' : 'a focused start'} of the topic.`,
      `It already touches on ${rubricFocus.join(', ')}.`,
    ],
    concerns: [
      'Check whether every rubric criterion has a clear example or proof point.',
      'Look for one paragraph that could be more concise or specific.',
    ],
    nextSteps: [
      'Tighten the thesis and remove one redundant sentence.',
      'Add one evidence block that directly supports the main claim.',
      'Read the rubric once more before submitting.',
    ],
  };
};

export const summarizeDiscussion = (title, messages) => {
  const combined = messages.join(' ');
  const keywords = extractKeywords(combined);
  return {
    title,
    summary: messages.slice(0, 3).join(' ') || 'No discussion content available yet.',
    highlights: keywords.length
      ? keywords.map((keyword) => keyword.replace(/-/g, ' '))
      : ['Clarify the main question', 'Add one example', 'Close the loop'],
    actionItems: [
      'Summarize unresolved questions at the top of the thread.',
      'Assign one follow-up response to the teacher or group lead.',
    ],
  };
};
