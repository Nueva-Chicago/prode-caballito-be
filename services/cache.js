"use strict";

/**
 * Simple TTL cache. Today backed by Lambda in-memory (per-instance).
 * To swap for Redis: replace get/set/invalidate keeping the same interface.
 *
 * Lambda note: in-memory means each warm instance has its own cache — still
 * a net win since it eliminates repeated DB hits within the same instance's
 * lifetime. A shared Redis can be wired in later without changing callers.
 */

const store = new Map();

function get(key) {
    const entry = store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        store.delete(key);
        return null;
    }
    return entry.value;
}

function set(key, value, ttlMs) {
    store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

/** Exact-key invalidation (e.g. after a write). */
function invalidate(key) {
    store.delete(key);
}

/** Prefix invalidation — removes all keys starting with prefix. */
function invalidatePrefix(prefix) {
    for (const key of store.keys()) {
        if (key.startsWith(prefix)) store.delete(key);
    }
}

module.exports = { get, set, invalidate, invalidatePrefix };
