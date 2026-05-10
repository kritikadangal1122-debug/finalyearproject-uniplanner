import { createJsonRoute } from '../http.js';
import { generateAssignmentFeedback, generateQuiz, summarizeDiscussion, summarizeText } from '../ai.js';

export const registerAiModule = (app) => {
  app.post('/api/ai/study-copilot/summary', createJsonRoute((req, res) => {
    const { title, text } = req.body;
    if (!title || !text) {
      res.status(400).json({ error: 'Title and text are required.' });
      return;
    }
    res.json(summarizeText(title, text));
  }));

  app.post('/api/ai/study-copilot/quiz', createJsonRoute((req, res) => {
    const { title, text, count } = req.body;
    if (!title || !text) {
      res.status(400).json({ error: 'Title and text are required.' });
      return;
    }
    res.json(generateQuiz(title, text, count ?? 3));
  }));

  app.post('/api/ai/assignment-feedback', createJsonRoute((req, res) => {
    const { submissionText, rubric } = req.body;
    if (!submissionText) {
      res.status(400).json({ error: 'Submission text is required.' });
      return;
    }
    res.json(generateAssignmentFeedback(submissionText, rubric ?? []));
  }));

  app.post('/api/ai/discussion-summary', createJsonRoute((req, res) => {
    const { title, messages } = req.body;
    if (!title || !messages?.length) {
      res.status(400).json({ error: 'Title and messages are required.' });
      return;
    }
    res.json(summarizeDiscussion(title, messages));
  }));
};
