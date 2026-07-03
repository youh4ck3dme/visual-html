let migrationPersistWarningShown = false;

export function shouldShowMigrationPersistWarning(): boolean {
  if (migrationPersistWarningShown) return false;
  migrationPersistWarningShown = true;
  return true;
}

/** @internal test-only */
export function resetProjectsStorageWarningsForTests() {
  migrationPersistWarningShown = false;
}
