// bind.js：绑定与默认值（基线：原样拷贝、不填默认）
export function bind(schema, rows) {
  return { bound: rows.map((row) => Object.assign({}, row)), defaults: 0, coerced: 0 };
}
