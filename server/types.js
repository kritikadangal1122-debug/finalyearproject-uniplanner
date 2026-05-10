export const toPublicUser = (user) => {
  const { passwordHash, ...rest } = user;
  return rest;
};

export const toPublicAppState = (app) => ({
  ...app,
  users: app.users.map(toPublicUser),
});

export const toPublicSnapshot = (snapshot) => ({
  ...snapshot,
  app: toPublicAppState(snapshot.app),
});
