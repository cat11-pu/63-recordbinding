// bind.js：按字段定义绑定（预编译一次字段计划，行数据只做单趟线性绑定）
const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

// 字段定义表只扫描一次，绑定每行时按计划顺序直取，不再回表查找
function compile(schema) {
  const plan = [];
  for (const field of schema || []) {
    plan.push({
      name: field.name,
      type: field.type,
      required: field.required === true,
      hasDefault: hasOwn(field, "default"),
      default: field.default,
    });
  }
  return plan;
}

// 字符串形式的数字 -> 数字；转不了时原样返回，交给 validate 报 E_BAD_TYPE
function coerceValue(type, value) {
  if (type === "number") {
    if (typeof value === "number") return { value, changed: false };
    if (typeof value === "string") {
      const text = value.trim();
      if (text !== "" && Number.isFinite(Number(text))) {
        return { value: Number(text), changed: true };
      }
    }
  }
  return { value, changed: false };
}

export function bind(schema, rows) {
  const plan = compile(schema);
  const list = rows || [];
  const bound = new Array(list.length);
  let defaults = 0;
  let coerced = 0;

  for (let r = 0; r < list.length; r++) {
    const row = list[r];
    const next = {};
    for (let f = 0; f < plan.length; f++) {
      const field = plan[f];
      const name = field.name;
      const missing = !hasOwn(row, name) || row[name] === null || row[name] === undefined;

      if (missing) {
        // 必填缺失：不造值、不留键，由 validate 定位 E_REQUIRED_MISSING
        if (field.hasDefault) {
          next[name] = field.default;
          defaults += 1;
        }
        continue;
      }

      const result = coerceValue(field.type, row[name]);
      if (result.changed) coerced += 1;
      next[name] = result.value;
    }
    bound[r] = next;
  }

  return { bound, defaults, coerced };
}
