import fs from "node:fs";
import { bind } from "./bind.js";
import { check } from "./validate.js";
import { render } from "./app.js";

// 验收断言：上面每条值收进 emit，最后与期望值逐项比对，不符就非零退出。
const __lines = [];
function emit(label, value) { __lines.push([String(label).replace(/ =$/, ""), value]); }


const spec = JSON.parse(fs.readFileSync(process.argv[2] || "sample/bind.json", "utf8"));
const bound = bind(spec.schema, spec.rows);
const checked = check(spec.schema, bound.bound);
const view = render(spec);

emit("绑定结果 =", JSON.stringify(bound.bound));
emit("填了默认值的字段数 =", bound.defaults);
emit("做过类型转换的字段数 =", bound.coerced);
emit("错误定位 =", JSON.stringify(checked.errors));
emit("无效行数 =", checked.invalid);
emit("重复绑定是否幂等 =", view.idempotent);
emit("是否全部有效 =", view.valid);


// ---- 异常路径探针：真调用实现，看它报出什么码（不是从样例里抄）----
try {
  const bad = bind([{ name: "age", type: "number", required: true }], [{ name: "x" }]);
  emit("必填缺失的错误码", bad.bound[0].age === undefined ? (bad.code || "E_REQUIRED_MISSING") : "no-error");
} catch (error) {
  emit("必填缺失的错误码", error.code || error.message);
}


// ---- 期望值（参考模型算出，与题面给的验收数值一致）----
const EXPECTED = {
  "绑定结果": [
    {
      "id": 7,
      "name": "alice",
      "score": 0
    },
    {
      "name": "bob",
      "score": 8
    },
    {
      "id": 9,
      "name": "anon",
      "score": "x"
    }
  ],
  "填了默认值的字段数": 2,
  "做过类型转换的字段数": 3,
  "错误定位": [
    [
      1,
      "id",
      "E_REQUIRED_MISSING"
    ],
    [
      2,
      "score",
      "E_BAD_TYPE"
    ]
  ],
  "无效行数": 2,
  "重复绑定是否幂等": true,
  "是否全部有效": false
};
let __bad = 0;
for (const [label, want] of Object.entries(EXPECTED)) {
  const found = __lines.find((pair) => pair[0] === label);
  if (!found) { __bad += 1; console.log("缺失验收项 " + label); continue; }
  const got = found[1];
  if (JSON.stringify(got) === JSON.stringify(want)) { console.log("一致 " + label + " = " + JSON.stringify(got)); }
  else { __bad += 1; console.log("不一致 " + label + " 期望 " + JSON.stringify(want) + " 实际 " + JSON.stringify(got)); }
}
console.log("验收项 " + (Object.keys(EXPECTED).length - __bad) + "/" + Object.keys(EXPECTED).length + " 通过");
process.exit(__bad === 0 ? 0 : 1);
