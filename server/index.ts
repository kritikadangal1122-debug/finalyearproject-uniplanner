import 'dotenv/config';
import { createLearningOsApp } from './app.ts';

const port = Number(process.env.PORT ?? 4000);
const app = createLearningOsApp();

app.listen(port, () => {
  console.log(`Learning OS API running on http://localhost:${port}`);
});
