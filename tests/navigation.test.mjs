import { test } from "node:test";
import assert from "node:assert/strict";
import { createNavigationSequence } from "../lib/navigation.ts";

function setup(overrides = {}) {
  const calls = [];
  const timers = new Map();
  let nextTimer = 0;
  const effects = {
    cover: async () => { calls.push("cover"); },
    reveal: async () => { calls.push("reveal"); },
    reset: () => calls.push("reset"),
    push: (href, options) => calls.push({ href, options }),
    busy: (value) => calls.push(value ? "busy" : "idle"),
    schedule: (callback, delay) => { const id = ++nextTimer; timers.set(id, { callback, delay }); return id; },
    cancelTimer: (id) => timers.delete(id),
    ...overrides,
  };
  const sequence = createNavigationSequence(effects);
  const runTimer = async (delay) => {
    const [id, timer] = [...timers].find(([, value]) => value.delay === delay) || [];
    assert.ok(timer, `Expected ${delay}ms timer`);
    timers.delete(id);
    timer.callback();
    await Promise.resolve();
  };
  return { sequence, calls, timers, runTimer };
}

test("covers completely before pushing and ignores overlapping clicks", async () => {
  let completeCover;
  const { sequence, calls } = setup({ cover: () => new Promise((resolve) => { completeCover = resolve; }) });
  const pending = sequence.navigate("/about", "/");
  await sequence.navigate("/gallery", "/");
  assert.deepEqual(calls, ["busy"]);
  completeCover();
  await pending;
  assert.deepEqual(calls, ["busy", { href: "/about", options: {} }]);
});

test("reveals after a committed route, cancels fallback and releases navigation", async () => {
  const { sequence, calls, timers, runTimer } = setup();
  await sequence.navigate("/about", "/", { replace: true, scroll: false });
  sequence.routeCommitted("/about");
  sequence.routeCommitted("/about");
  assert.equal(timers.size, 1);
  assert.equal([...timers.values()][0].delay, 350);
  await runTimer(350);
  assert.deepEqual(calls, ["busy", "cover", { href: "/about", options: { replace: true, scroll: false } }, "reveal", "reset", "idle"]);
  await sequence.navigate("/gallery", "/about");
  assert.equal(calls.at(-1).href, "/gallery");
});

test("same-page and hash destinations do not trigger the curtain", async () => {
  const { sequence, calls } = setup();
  await sequence.navigate("/about", "/about");
  await sequence.navigate("/about#crew", "/about");
  assert.deepEqual(calls, []);
});

test("slow or failed navigation cannot leave the screen covered", async () => {
  const { sequence, calls, runTimer } = setup();
  await sequence.navigate("/about", "/");
  await runTimer(4000);
  await runTimer(0);
  assert.deepEqual(calls.slice(-3), ["reveal", "reset", "idle"]);
});

test("a cancelled old timeout cannot reveal a later navigation", async () => {
  const { sequence, calls, timers, runTimer } = setup();
  await sequence.navigate("/about", "/");
  const staleCallback = [...timers.values()][0].callback;
  sequence.routeCommitted("/about");
  await runTimer(350);
  await sequence.navigate("/gallery", "/about");
  staleCallback();
  assert.equal([...timers.values()][0].delay, 4000);
  assert.equal(calls.filter((value) => value === "reveal").length, 1);
});

test("browser traversal during cover cancels the pending push", async () => {
  let completeCover;
  const { sequence, calls, timers } = setup({ cover: () => new Promise((resolve) => { completeCover = resolve; }) });
  const pending = sequence.navigate("/about", "/");
  sequence.cancel();
  completeCover();
  await pending;
  assert.deepEqual(calls, ["busy", "reset", "idle"]);
  assert.equal(timers.size, 0);
});

test("unmount clears pending timers and never touches unmounted animation controls", async () => {
  const { sequence, calls, timers } = setup();
  await sequence.navigate("/about", "/");
  sequence.dispose();
  assert.equal(timers.size, 0);
  assert.ok(!calls.includes("reset"));
  await sequence.navigate("/gallery", "/");
  assert.equal(calls.filter((value) => value === "cover").length, 1);
});

test("development effect remount can activate navigation again", async () => {
  const { sequence, calls } = setup();
  sequence.activate();
  sequence.dispose();
  sequence.activate();
  await sequence.navigate("/about", "/");
  assert.equal(calls.at(-1).href, "/about");
});

test("redirected paths reveal and a push failure restores the page", async () => {
  const redirected = setup();
  await redirected.sequence.navigate("/about", "/");
  redirected.sequence.routeCommitted("/gallery");
  await redirected.runTimer(350);
  assert.equal(redirected.calls.at(-1), "idle");
  const failed = setup({ push: () => { throw new Error("Routing unavailable"); } });
  await failed.sequence.navigate("/about", "/");
  await failed.runTimer(0);
  assert.equal(failed.calls.at(-1), "idle");
});
