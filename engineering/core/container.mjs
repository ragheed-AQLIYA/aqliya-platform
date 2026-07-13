/**
 * AEOS Platform Core — Dependency Injection Container
 *
 * Inversion of Control: services are resolved from the container,
 * NOT imported directly. This enables:
 *   - Replacing any engine without modifying its consumers
 *   - Testing with mock implementations
 *   - Lifecycle management (singleton, transient, scoped)
 *
 * Architecture:
 *   Container → resolves → Service
 *   NOT: Module A → imports → Module B
 *
 * @module core/container
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════
// Provider Types
// ═══════════════════════════════════════════════════════════

export const LIFETIME = {
  SINGLETON: "singleton",   // One instance for the entire container
  TRANSIENT: "transient",   // New instance every time
  SCOPED: "scoped",         // One instance per scope (e.g., per cycle)
};

/**
 * @typedef {object} Provider
 * @property {string} token - Unique identifier for the service
 * @property {Function} factory - Function that creates the service
 * @property {string} lifetime - SINGLETON | TRANSIENT | SCOPED
 * @property {string[]} dependencies - Tokens this service depends on
 */

// ═══════════════════════════════════════════════════════════
// Container Implementation
// ═══════════════════════════════════════════════════════════

export class Container {
  constructor() {
    /** @type {Map<string, Provider>} */
    this._providers = new Map();

    /** @type {Map<string, any>} */
    this._singletons = new Map();

    /** @type {Map<string, Map<string, any>>} */
    this._scopes = new Map();

    /** @type {Map<string, string>} token → current state */
    this._states = new Map();

    /** @type {string[]} */
    this._bootOrder = [];

    // Register the container itself
    this.register({
      token: "container",
      factory: () => this,
      lifetime: LIFETIME.SINGLETON,
      dependencies: [],
    });
  }

  /**
   * Register a service provider.
   *
   * @param {object} provider
   * @param {string} provider.token - Unique token
   * @param {Function} provider.factory - (deps) => service
   * @param {string} [provider.lifetime] - Default: SINGLETON
   * @param {string[]} [provider.dependencies] - Token dependencies
   * @param {string} [provider.bootAfter] - Token of service to boot after
   */
  register({ token, factory, lifetime = LIFETIME.SINGLETON, dependencies = [], bootAfter = null }) {
    if (this._providers.has(token)) {
      throw new Error(`Container: token "${token}" already registered`);
    }

    this._providers.set(token, { token, factory, lifetime, dependencies, bootAfter });
    this._states.set(token, "registered");

    if (bootAfter) {
      this._bootOrder.push(token);
    }

    return this;
  }

  /**
   * Resolve a service by token.
   * Automatically resolves all dependencies first.
   *
   * @param {string} token
   * @param {string} [scopeId] - For SCOPED lifetime
   * @returns {any}
   */
  resolve(token, scopeId = null) {
    const provider = this._providers.get(token);
    if (!provider) {
      throw new Error(`Container: service "${token}" not registered. Available: ${[...this._providers.keys()].join(", ")}`);
    }

    // Check cache
    if (provider.lifetime === LIFETIME.SINGLETON && this._singletons.has(token)) {
      return this._singletons.get(token);
    }

    if (provider.lifetime === LIFETIME.SCOPED && scopeId) {
      const scope = this._scopes.get(scopeId);
      if (scope?.has(token)) {
        return scope.get(token);
      }
    }

    // Resolve dependencies first
    const deps = provider.dependencies.map((depToken) => this.resolve(depToken, scopeId));

    // Create instance
    const instance = provider.factory(...deps);

    // Cache
    if (provider.lifetime === LIFETIME.SINGLETON) {
      this._singletons.set(token, instance);
    } else if (provider.lifetime === LIFETIME.SCOPED && scopeId) {
      if (!this._scopes.has(scopeId)) {
        this._scopes.set(scopeId, new Map());
      }
      this._scopes.get(scopeId).set(token, instance);
    }

    this._states.set(token, "active");

    return instance;
  }

  /**
   * Resolve all registered services (bootstrap).
   * Respects bootAfter ordering.
   *
   * @returns {Map<string, any>} token → instance
   */
  bootstrap() {
    const instances = new Map();

    // Boot in dependency order
    const booted = new Set();

    const boot = (token) => {
      if (booted.has(token)) return;
      const provider = this._providers.get(token);
      if (!provider) return;

      // Boot dependencies first
      if (provider.bootAfter && !booted.has(provider.bootAfter)) {
        boot(provider.bootAfter);
      }

      // Boot this
      const instance = this.resolve(token);
      instances.set(token, instance);
      booted.add(token);
    };

    // First, boot ordered services
    for (const token of this._bootOrder) {
      boot(token);
    }

    // Then boot remaining
    for (const token of this._providers.keys()) {
      boot(token);
    }

    return instances;
  }

  /**
   * Check if a service is registered.
   * @param {string} token
   * @returns {boolean}
   */
  has(token) {
    return this._providers.has(token);
  }

  /**
   * Get service state.
   * @param {string} token
   * @returns {string}
   */
  state(token) {
    return this._states.get(token) || "unknown";
  }

  /**
   * Create a new scope (for SCOPED services).
   * @param {string} scopeId
   * @returns {{ resolve: Function, dispose: Function }}
   */
  createScope(scopeId) {
    return {
      resolve: (token) => this.resolve(token, scopeId),
      dispose: () => {
        this._scopes.delete(scopeId);
      },
    };
  }

  /**
   * List all registered services.
   * @returns {Array<{ token: string, lifetime: string, state: string }>}
   */
  list() {
    return [...this._providers.entries()].map(([token, p]) => ({
      token,
      lifetime: p.lifetime,
      state: this._states.get(token) || "unknown",
      dependencies: p.dependencies,
    }));
  }

  /**
   * Count registered services.
   * @returns {number}
   */
  size() {
    return this._providers.size;
  }
}

// ═══════════════════════════════════════════════════════════
// Default export
// ═══════════════════════════════════════════════════════════

export default {
  Container,
  LIFETIME,
};
