import { PivotPoint, TransformPivotData } from "../../core/types/type";
import { Circle } from "./circle";
export class Pentagon extends Circle {
  transformPivotMap = new Map<PivotPoint, TransformPivotData>();
  constructor(x: number, y: number, radius: number) {
    super(x, y, radius, 6);
    const [a, b, c, d, e, f] = this.vertices;
    this.transformPivotMap = new Map([
      [
        "br",
        {
          x: [a, b, f],
          y: [b, c],
          customY: { vec2: [a, d], transform: (v) => v / 2 },
        },
      ],
      [
        "bl",
        {
          x: [c, d, e],
          y: [b, c],
          customY: { vec2: [a, d], transform: (v) => v / 2 },
        },
      ],
      [
        "tl",
        {
          x: [c, d, e],
          y: [e, f],
          customY: { vec2: [a, d], transform: (v) => v / 2 },
        },
      ],
      [
        "tr",
        {
          x: [a, b, f],
          y: [e, f],
          customY: { vec2: [a, d], transform: (v) => v / 2 },
        },
      ],
    ]);
  }
}
