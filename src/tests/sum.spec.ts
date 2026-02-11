import { sum } from "../utils/sum";
describe("sum function", () => {
  it("1 + 2 should return 3", () => {
    expect(sum(1, 2)).toBe(3);
  });
});
