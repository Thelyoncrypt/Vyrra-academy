/**
 * Test-only stub for the `server-only` package.
 *
 * Several core-logic modules (`progress/service`, `authz/gating`,
 * `content/queries`, …) start with `import "server-only"`, which throws when
 * evaluated outside a React Server Component build. Vitest aliases the import
 * to this empty module so the PURE logic in those files is unit-testable
 * without touching source. It does not weaken the runtime guard — production
 * still resolves the real package.
 */
export {};
