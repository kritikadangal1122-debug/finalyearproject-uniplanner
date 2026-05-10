const dueSoonRank = (value) => {
  const lower = value.toLowerCase();
  if (lower.includes('today')) return 0;
  if (lower.includes('tomorrow')) return 1;
  if (lower.includes('friday')) return 2;
  return 3;
};

export const collectPlatformSignals = (snapshot) => {
  const activeClasses = snapshot.app.classes.filter((item) => !item.archived);
  const unreadNotifications = snapshot.app.notifications.filter((item) => item.unread).length;
  const draftOrActiveAssignments = snapshot.app.assignments.filter((item) => item.status !== 'graded');
  const lowProgressClasses = [...activeClasses].sort((left, right) => left.progress - right.progress);

  return {
    activeClasses,
    unreadNotifications,
    draftOrActiveAssignments,
    lowProgressClasses,
    atRiskStudents: snapshot.goals
      .filter((goal) => goal.targetType === 'completion' && goal.progressValue < 75)
      .map((goal) => goal.userId),
  };
};

export const deriveNextBestAction = (snapshot, userId) => {
  const user = snapshot.app.users.find((item) => item.id === userId);
  if (!user) {
    return {
      title: 'Sign in',
      reason: 'No user profile is currently active.',
      action: 'Authenticate to see recommendations.',
      priority: 'low',
      entityType: 'auth',
      entityId: 'login',
    };
  }

  const signals = collectPlatformSignals(snapshot);

  if (user.role === 'student') {
    const assignment = [...snapshot.app.assignments]
      .sort((left, right) => dueSoonRank(left.dueDate) - dueSoonRank(right.dueDate))[0];

    return {
      title: assignment ? `Finish ${assignment.title}` : 'Review your next lesson',
      reason: assignment
        ? `It is still ${assignment.status} and due ${assignment.dueDate.toLowerCase()}.`
        : 'You are ready for the next concept review.',
      action: assignment
        ? 'Open the assignment, review the rubric, and submit your draft.'
        : 'Continue the next active module and capture one learning goal.',
      priority: assignment ? 'high' : 'normal',
      entityType: 'assignment',
      entityId: assignment?.id ?? 'learning-path',
    };
  }

  if (user.role === 'teacher') {
    const classHealth = [...signals.lowProgressClasses].filter((item) => item.teacherId === user.id)[0] ?? signals.lowProgressClasses[0];
    const gradingQueue = snapshot.app.assignments.filter((item) => item.manualReview && item.status !== 'graded');

    return {
      title: gradingQueue[0] ? `Review ${gradingQueue[0].title}` : 'Check class health',
      reason: gradingQueue[0]
        ? `${gradingQueue.length} items are waiting for manual feedback.`
        : classHealth
          ? `${classHealth.title} is your lowest-progress live class.`
          : 'Your classrooms are up to date.',
      action: gradingQueue[0]
        ? 'Open submissions, apply the rubric, and send feedback.'
        : 'Open the class health dashboard and identify learners who need support.',
      priority: gradingQueue[0] ? 'high' : 'normal',
      entityType: gradingQueue[0] ? 'assignment' : 'class',
      entityId: gradingQueue[0]?.id ?? classHealth?.id ?? 'dashboard',
    };
  }

  const riskGoal = snapshot.goals.find((goal) => goal.progressValue < 75);
  const unread = signals.unreadNotifications;

  return {
    title: unread > 0 ? 'Review platform alerts' : 'Audit learning risk trends',
    reason: unread > 0
      ? `${unread} notifications are unread across the workspace.`
      : riskGoal
        ? 'One or more learning goals are below the intervention threshold.'
        : 'The platform is stable and up to date.',
    action: unread > 0
      ? 'Review priority alerts, acknowledgements, and unresolved issues.'
      : 'Open risk analytics and verify schools that need intervention.',
    priority: unread > 0 || riskGoal ? 'high' : 'normal',
    entityType: unread > 0 ? 'notification' : 'analytics',
    entityId: unread > 0 ? 'inbox' : 'platform-health',
  };
};

export const scoreSubmissionQuality = (submission) => {
  const lengthScore = Math.min(100, Math.max(35, Math.round(submission.contentText.length / 6)));
  const plagiarismPenalty = Math.min(35, submission.plagiarismScore);
  const latePenalty = submission.lateFlag ? 10 : 0;
  return Math.max(0, Math.min(100, lengthScore - plagiarismPenalty - latePenalty));
};

export const buildPlatformHealth = (snapshot) => {
  const signals = collectPlatformSignals(snapshot);
  const submissions = snapshot.submissions.length || 1;
  const scoreTotal = snapshot.submissions.reduce((total, submission) => total + (submission.score ?? scoreSubmissionQuality(submission)), 0);
  const averageScore = Math.round(scoreTotal / submissions);
  return {
    activeClasses: signals.activeClasses.length,
    unreadNotifications: signals.unreadNotifications,
    averageSubmissionScore: averageScore,
    assignmentsAwaitingReview: signals.draftOrActiveAssignments.length,
    atRiskProfiles: signals.atRiskStudents.length,
  };
};
