import { registerAuthModule } from './auth.module.js';
import { registerAdminModule } from './admin.module.js';
import { registerDashboardModule } from './dashboard.module.js';
import { registerClassesModule } from './classes.module.js';
import { registerAssignmentsModule } from './assignments.module.js';
import { registerDiscussionsModule } from './discussions.module.js';
import { registerMessagesModule } from './messages.module.js';
import { registerNotificationsModule } from './notifications.module.js';
import { registerEventsModule } from './events.module.js';
import { registerResourcesModule } from './resources.module.js';
import { registerAiModule } from './ai.module.js';
import { registerUploadModule } from './upload.module.js';

export const registerLearningModules = (app) => {
  registerAuthModule(app);
  registerAdminModule(app);
  registerDashboardModule(app);
  registerClassesModule(app);
  registerAssignmentsModule(app);
  registerDiscussionsModule(app);
  registerMessagesModule(app);
  registerNotificationsModule(app);
  registerEventsModule(app);
  registerResourcesModule(app);
  registerAiModule(app);
  registerUploadModule(app);
};
