// app.js：渲染结果（返回结构固定为七个键）
import { bind } from "./bind.js";
import { check } from "./validate.js";

export function render(spec) {
  const first = bind(spec.schema, spec.rows);
  const checked = check(spec.schema, first.bound);

  // 幂等：对同一批数据再绑一次，结果（含计数）必须完全一致
  const again = bind(spec.schema, first.bound);
  const idempotent =
    JSON.stringify(again.bound) === JSON.stringify(first.bound) &&
    again.defaults === 0 &&
    again.coerced === 0;

  return { bound: first.bound, defaults: first.defaults, coerced: first.coerced,
           errors: checked.errors, invalid: checked.invalid,
           idempotent, valid: checked.invalid === 0 };
}
