import assert from "node:assert";
import { bind } from "../bind.js";
import { check } from "../validate.js";
import { render } from "../app.js";

let failed = 0;
function check2(name, fn) {
  try { fn(); console.log("ok " + name); } catch (e) { failed += 1; console.log("FAIL " + name + " :: " + e.message); }
}

const schema = [{ name: "age", type: "number", required: true }];

check2("bind returns rows", () => {
  assert.ok(Array.isArray(bind(schema, [{ age: 1 }]).bound));
});

check2("bind reports defaults", () => {
  assert.strictEqual(typeof bind(schema, [{ age: 1 }]).defaults, "number");
});

check2("check returns errors", () => {
  assert.ok(Array.isArray(check(schema, [{ age: 1 }]).errors));
});

check2("check reports invalid count", () => {
  assert.strictEqual(typeof check(schema, [{ age: 1 }]).invalid, "number");
});

check2("render exposes valid flag", () => {
  assert.strictEqual(typeof render({ schema: schema, rows: [{ age: 1 }] }).valid, "boolean");
});

console.log("5 cases, " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);
