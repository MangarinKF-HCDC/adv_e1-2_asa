import { test } from "node:test";
import assert from "node:assert/strict";
import { act, createElement } from "react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { JSDOM } from "jsdom";
import { useReducedMotion } from "../lib/reduced-motion.ts";

for (const initialPreference of [false, true]) {
  test(`hydrates without mismatches when reduced motion is ${initialPreference}`, async () => {
    const renders = [];
    function MotionPreferenceFixture() {
      const reducedMotion = useReducedMotion();
      renders.push(reducedMotion);
      // Both count-up text and initial motion styles depend on this preference.
      return createElement("span", {
        style: { transform: reducedMotion ? "none" : "translateY(30px)" },
      }, reducedMotion ? 4 : 0);
    }

    const markup = renderToString(createElement(MotionPreferenceFixture));
    assert.match(markup, />0<\/span>/);
    assert.deepEqual(renders, [false]);
    renders.length = 0;

    const dom = new JSDOM(`<div id="root">${markup}</div>`);
    const listeners = new Set();
    const preference = {
      matches: initialPreference,
      addEventListener: (event, listener) => {
        assert.equal(event, "change");
        listeners.add(listener);
      },
      removeEventListener: (event, listener) => {
        assert.equal(event, "change");
        listeners.delete(listener);
      },
    };
    dom.window.matchMedia = (query) => {
      assert.equal(query, "(prefers-reduced-motion: reduce)");
      return preference;
    };
    const globals = {
      window: dom.window,
      document: dom.window.document,
      IS_REACT_ACT_ENVIRONMENT: true,
    };
    const previousGlobals = new Map();
    for (const [key, value] of Object.entries(globals)) {
      previousGlobals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
      Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    }

    const hydrationErrors = [];
    const consoleErrors = [];
    const originalConsoleError = console.error;
    console.error = (...args) => consoleErrors.push(args);
    const container = dom.window.document.getElementById("root");
    let root;
    try {
      await act(async () => {
        root = hydrateRoot(container, createElement(MotionPreferenceFixture), {
          onRecoverableError: (error) => hydrationErrors.push(error),
        });
      });
      assert.equal(renders[0], false, "The first browser render must match the server");
      assert.equal(container.textContent, initialPreference ? "4" : "0");
      assert.equal(container.firstChild.style.transform, initialPreference ? "none" : "translateY(30px)");
      assert.deepEqual(hydrationErrors, []);
      assert.deepEqual(consoleErrors, []);
      assert.equal(listeners.size, 1);

      // Changes in OS/browser settings must still update an already hydrated page.
      for (const nextPreference of [!initialPreference, initialPreference]) {
        await act(async () => {
          preference.matches = nextPreference;
          for (const listener of listeners) listener();
        });
        assert.equal(container.textContent, nextPreference ? "4" : "0");
      }
    } finally {
      if (root) await act(async () => root.unmount());
      console.error = originalConsoleError;
      for (const [key, descriptor] of previousGlobals) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else delete globalThis[key];
      }
      dom.window.close();
    }
    assert.equal(listeners.size, 0, "Unmounting must remove the preference listener");
  });
}
