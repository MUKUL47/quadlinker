import { PivotPoint, TransformPivotData } from "../../core/types/type";

import { Shape } from "../base/shape";
import { Vector2 } from "../base/vector2";
import { Pivot } from "./Pivot";

export class Trapezium extends Shape {
  transformPivotMap = new Map<PivotPoint, TransformPivotData>();

  constructor(
    x: number,
    y: number,
    topWidth: number,
    bottomWidth: number,
    height: number
  ) {
    super(x, y, [
      new Vector2(x - topWidth / 2, y),
      new Vector2(x + topWidth / 2, y),
      new Vector2(x + bottomWidth / 2, y + height),
      new Vector2(x - bottomWidth / 2, y + height),
    ]);
    const [tl, tr, br, bl] = this.vertices;
    this.transformPivotMap = new Map([
      [
        "br",
        {
          x: [br, tr],
          y: [bl, br],
          exceptions: [
            {
              if: ({ x }) => bl.x >= br.x && x > 0,
              return: Pivot.BottomLeft(),
            },
            {
              if: ({ y }) => tl.y >= br.y && y > 0,
              return: Pivot.TopRight(),
            },
          ],
        },
      ],
      [
        "bl",
        {
          x: [tl, bl],
          y: [bl, br],
          exceptions: [
            {
              if: ({ x }) => bl.x >= br.x && x < 0,
              return: Pivot.BottomRight(),
            },
            {
              if: ({ y }) => tl.y >= br.y && y > 0,
              return: Pivot.TopLeft(),
            },
          ],
        },
      ],
      [
        "tl",
        {
          x: [tl, bl],
          y: [tl, tr],
          exceptions: [
            {
              if: ({ x }) => bl.x >= br.x && x < 0,
              return: Pivot.TopRight(),
            },
            {
              if: ({ y }) => tl.y >= br.y && y < 0,
              return: Pivot.BottomLeft(),
            },
          ],
        },
      ],
      [
        "tr",
        {
          x: [tr, br],
          y: [tl, tr],
          exceptions: [
            {
              if: ({ x }) => bl.x >= br.x && x > 0,
              return: Pivot.TopLeft(),
            },
            {
              if: ({ y }) => tl.y >= br.y && y < 0,
              return: Pivot.BottomRight(),
            },
          ],
        },
      ],
    ]);
  }
}
