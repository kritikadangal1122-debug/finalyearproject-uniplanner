import type express from 'express';
import { registerAuthModule } from './auth.module';
import { registerAdminModule } from './admin.module';
import { registerDashboardModule } from './dashboard.module';
import { registerClassesModule } from './classes.module';
import { registerAssignmentsModule } from './assignments.module';
import { registerDiscussionsModule } from './discussions.module';
import { registerMessagesModule } from './messages.module';
import { registerNotificationsModule } from './notifications.module';
import { registerEventsModule } from './events.module';
import { registerResourcesModule } from './resources.module';
import { registerAiModule } from './ai.module';
import { registerUploadModule } from './upload.module';

export const registerLearningModules = (app: express.Express) => {
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
