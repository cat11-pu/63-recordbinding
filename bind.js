// bind.js：按字段定义绑定——缺失非必填填默认值，字符串数字按定义转数字。
// 字段描述表只构建一次，绑定全程线性，不逐行重扫定义。
function compile(schema) {
  return schema.map((field) => ({
    name: field.name,
    type: field.type,
    required: field.required === true,
    hasDefault: Object.prototype.hasOwnProperty.call(field, "default"),
    defaultValue: field.default,
  }));
}

function cloneDefault(value) {
  if (value === null || typeof value !== "object") return value;
  return JSON.parse(JSON.stringify(value));
}

export function bind(schema, rows) {
  const fields = compile(schema);
  let defaults = 0;
  let coerced = 0;
  const bound = rows.map((row) => {
    const out = {};
    for (const field of fields) {
      const value = row[field.name];
      if (value === undefined || value === null) {
        if (field.required) continue; // 必填缺失：留给 validate 报 E_REQUIRED_MISSING
        if (field.hasDefault) {
          out[field.name] = cloneDefault(field.defaultValue);
          defaults += 1;
        }
        continue;
      }
      if (field.type === "number" && typeof value === "string") {
        const text = value.trim();
        const num = text === "" ? NaN : Number(text);
        if (Number.isFinite(num)) {
          out[field.name] = num;
          coerced += 1;
          continue;
        }
        // 转不了：保留原值，留给 validate 报 E_BAD_TYPE
      }
      out[field.name] = value;
    }
    return out;
  });
  return { bound, defaults, coerced };
}
