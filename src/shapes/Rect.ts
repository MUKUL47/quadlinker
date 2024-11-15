import { Vector2 } from "./vector2";
import { Shape } from "./shape";
import { Pivot } from "./Pivot";
import { PivotPoint, TransformPivotData, _null } from "../type";
import { TextShape } from "./text-shape";

export class Rect extends TextShape {
  transformPivotMap = new Map<PivotPoint, TransformPivotData>();
  constructor(x: number, y: number, width: number) {
    super(x, y, [
      new Vector2(x, y),
      new Vector2(x + width * 2, y),
      new Vector2(x + width * 2, y + width),
      new Vector2(x, y + width),
    ]);
    this.transformPivotMap = Rect.getTransformPivot(this.vertices);
  }

  static getTransformPivot(vertices: Vector2[]): Map<PivotPoint, TransformPivotData> {
    const [tl, tr, br, bl] = vertices;
    return new Map([
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
