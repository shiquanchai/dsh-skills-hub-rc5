/**
 * Windows filesystem retry policy.
 *
 * A directory rename or tree delete can fail with `EPERM`/`EACCES`/`EBUSY` while
 * another process (antivirus, Search indexing, the host's skill watcher) holds a
 * transient handle on a freshly written file. The same operation succeeds a few
 * milliseconds later, so these codes are retried with exponential backoff
 * instead of being surfaced as a disk failure. Anything else — and the last
 * attempt — is rethrown unchanged so callers keep their precise classification.
 *
 * @module dsh-skills-hub/fs-retry
 */
/** Codes that represent a transient sharing violation on Windows. */
export declare const TRANSIENT_FS_CODES: ReadonlySet<string>;
/** The OS error code behind a rejected filesystem promise, when it has one. */
export declare function errorCode(error: unknown): string | undefined;
/**
 * Run one filesystem operation, retrying only transient sharing violations.
 *
 * @param operation - the filesystem promise factory to attempt.
 * @param attempts - total attempts, including the first one.
 * @returns the operation's value on success.
 * @throws the last error after the final attempt, or immediately for a
 *   non-transient or codeless failure.
 */
export declare function retryTransient<T>(operation: () => Promise<T>, attempts?: number): Promise<T>;
