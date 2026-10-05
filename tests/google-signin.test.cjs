const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const worker = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");

function load(source, names, context) {
  for (const name of names) {
    const match = source.match(
      new RegExp("^(?:async )?function " + name + "\\b[\\s\\S]*?^}\\r?$", "m")
    );
    assert.ok(match, name);
    vm.runInContext(match[0], context);
  }
}

function fixture({ authResult, authError, openError } = {}) {
  const calls = { auth: [], tabs: [] };
  const context = vm.createContext({
    console: { error() {} },
    CHROME_SIGNIN_SETTINGS_URL: "chrome://settings/people",
    GOOGLE_BROWSER_SIGNIN_REQUIRED_CODE: "GOOGLE_BROWSER_SIGNIN_REQUIRED",
    chrome: {
      identity: {
        async getAuthToken(options) {
          calls.auth.push(options);
          if (authError) throw authError;
          return authResult;
        }
      },
      tabs: {
        async create(options) {
          calls.tabs.push(options);
          if (openError) throw openError;
          return { id: 42, ...options };
        }
      }
    }
  });

  load(
    worker,
    [
      "isGoogleBrowserSigninDisabledError",
      "directUserToChromeSignin",
      "getGoogleAccessToken"
    ],
    context
  );

  return { calls, context };
}

test("browser-signin-disabled auth failures open Chrome sign-in settings", async () => {
  const { calls, context } = fixture({
    authError: new Error("The user turned off browser signin")
  });

  await assert.rejects(
    context.getGoogleAccessToken(),
    (error) => {
      assert.equal(error.code, "GOOGLE_BROWSER_SIGNIN_REQUIRED");
      assert.match(error.message, /Sign-in settings opened/);
      return true;
    }
  );
  assert.equal(calls.auth.length, 1);
  assert.equal(calls.auth[0].interactive, true);
  assert.equal(calls.tabs.length, 1);
  assert.equal(calls.tabs[0].url, "chrome://settings/people");
  assert.equal(calls.tabs[0].active, true);
});

test("other Google auth failures do not open Chrome settings", async () => {
  const authError = new Error("The user did not approve access.");
  const { calls, context } = fixture({ authError });

  await assert.rejects(context.getGoogleAccessToken(), authError);
  assert.deepEqual(calls.tabs, []);
});

test("a failed settings redirect still tells the user where to sign in", async () => {
  const { context } = fixture({
    authError: new Error("The user turned off browser signin"),
    openError: new Error("Tabs are unavailable")
  });

  await assert.rejects(
    context.getGoogleAccessToken({ interactive: false }),
    (error) => {
      assert.equal(error.code, "GOOGLE_BROWSER_SIGNIN_REQUIRED");
      assert.match(error.message, /chrome:\/\/settings\/people/);
      return true;
    }
  );
});

test("successful Google authorization returns the token without redirecting", async () => {
  const { calls, context } = fixture({ authResult: { token: "test-token" } });

  assert.equal(await context.getGoogleAccessToken(), "test-token");
  assert.deepEqual(calls.tabs, []);
});
