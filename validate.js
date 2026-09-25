// validate.js：校验已绑定数据并定位到 [行号, 字段名, 错误码]
const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const E_REQUIRED_MISSING = "E_REQUIRED_MISSING";
const E_BAD_TYPE = "E_BAD_TYPE";

function typeMatches(type, value) {
  if (type === "number") return typeof value === "number" && Number.isFinite(value);
  if (type === "string") return typeof value === "string";
  if (type === "boolean") return typeof value === "boolean";
  return true; // 未声明/未知类型不拦截
}

export function check(schema, bound) {
  const errors = [];
  const badRows = new Set();
  const list = bound || [];

  for (let r = 0; r < list.length; r++) {
    const row = list[r] || {};
    for (const field of schema || []) {
      const name = field.name;
      const missing = !hasOwn(row, name) || row[name] === null || row[name] === undefined;

      if (missing) {
        if (field.required === true) {
          errors.push([r, name, E_REQUIRED_MISSING]);
          badRows.add(r);
        }
        continue;
      }

      if (!typeMatches(field.type, row[name])) {
        errors.push([r, name, E_BAD_TYPE]);
        badRows.add(r);
      }
    }
  }

  return { errors, invalid: badRows.size };
}
