// app.js：渲染结果
import { bind } from "./bind.js";
import { check } from "./validate.js";

export function render(spec) {
  const bound = bind(spec.schema, spec.rows);
  const checked = check(spec.schema, bound.bound);
  const rebound = bind(spec.schema, bound.bound);
  const idempotent = JSON.stringify(rebound.bound) === JSON.stringify(bound.bound);
  return { bound: bound.bound, defaults: bound.defaults, coerced: bound.coerced,
           errors: checked.errors, invalid: checked.invalid,
           idempotent: idempotent, valid: checked.invalid === 0 };
}
