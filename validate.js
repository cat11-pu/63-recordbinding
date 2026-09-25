// validate.js：校验并定位——必填缺失报 E_REQUIRED_MISSING，类型不符报 E_BAD_TYPE。
// 错误形如 [行号, 字段名, 错误码]，行号从 0 起。
export const E_REQUIRED_MISSING = "E_REQUIRED_MISSING";
export const E_BAD_TYPE = "E_BAD_TYPE";

const TYPE_CHECKS = {
  number: (value) => typeof value === "number" && Number.isFinite(value),
  string: (value) => typeof value === "string",
  boolean: (value) => typeof value === "boolean",
};

export function check(schema, bound) {
  const fields = schema.map((field) => ({
    name: field.name,
    required: field.required === true,
    isType: TYPE_CHECKS[field.type] || (() => true),
  }));
  const errors = [];
  let invalid = 0;
  bound.forEach((row, rowIndex) => {
    let rowBad = false;
    for (const field of fields) {
      const value = row[field.name];
      if (value === undefined || value === null) {
        if (field.required) {
          errors.push([rowIndex, field.name, E_REQUIRED_MISSING]);
          rowBad = true;
        }
        continue;
      }
      if (!field.isType(value)) {
        errors.push([rowIndex, field.name, E_BAD_TYPE]);
        rowBad = true;
      }
    }
    if (rowBad) invalid += 1;
  });
  return { errors, invalid };
}
