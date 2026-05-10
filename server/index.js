import 'dotenv/config';
import { createLearningOsApp } from './app.js';
import { ensureUnsignedPreset } from './upload.js';

const port = Number(process.env.PORT ?? 4000);
const app = createLearningOsApp();

app.listen(port, async () => {
  console.log(`Learning OS API running on http://localhost:${port}`);
  await ensureUnsignedPreset();
});
