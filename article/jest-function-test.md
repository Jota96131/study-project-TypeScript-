## はじめに

Vite + React + TypeScript のプロジェクトに Jest を導入したので、まずは一番シンプルな関数テストを書いて「テストがちゃんと動くこと」を確認してみました。

## 問題

テスト環境は整えたけど、実際にテストを書いて動かしたことがない。何から書けばいいのか分からない。

まずは最小限のコードで「テストが通る」体験をしたい。

## 解決方法

### 1. テスト対象の関数を用意する

`src/utils/sum.ts` に足し算するだけの関数を作ります。

```ts
// src/utils/sum.ts
export const sum = (a: number, b: number): number => {
  return a + b;
};
```

### 2. テストを書く

`src/tests/sum.spec.ts` にテストファイルを作成。

```ts
// src/tests/sum.spec.ts
import { sum } from "../utils/sum";

describe("sum function", () => {
  it("1 + 2 should return 3", () => {
    expect(sum(1, 2)).toBe(3);
  });
});
```

やっていることはこれだけです。

- `describe` でテスト対象をグループ化
- `it` で「何をテストするか」を書く
- `expect(...).toBe(...)` で期待する結果と一致するか検証

### 3. 実行

```bash
npm test
```

PASS が出れば OK。

## おわりに

足し算の関数をテストしただけですが、「書いたテストが通る」を一度体験しておくと、次から書くハードルがだいぶ下がります。まずはこういう簡単なところから始めるのが大事。

## 参考

- [Jest 公式ドキュメント](https://jestjs.io/ja/)
- [ts-jest ドキュメント](https://kulshekhar.github.io/ts-jest/)
