import { Vector2 } from "./vector2";
import { _null, PivotPoint, TransformPivotData } from "../type";
import { Pivot } from "./Pivot";
import { Shape } from "./shape";
import { TextShape } from "./text-shape";

export class Triangle extends TextShape {
  transformPivotMap = new Map<PivotPoint, TransformPivotData>();
  constructor(x: number, y: number, width: number) {
    super(x, y, [
      new Vector2(x, y),
      new Vector2(x - width, y + width),
      new Vector2(x + width, y + width),
    ]);
    const [top, bl, br] = this.vertices;
    this.transformPivotMap = new Map([
      [
        "br",
        {
          x: [br],
          y: [bl, br],
          customX: { vec2: [top], transform: (v) => v / 2 },
          exceptions: [
            {
              if: ({ x }) => x > 0 && bl.x >= br.x,
              return: Pivot.BottomLeft(),
            },
            {
              if: ({ y }) => y > 0 && top.y >= bl.y,
              return: Pivot.TopRight(),
            },
          ],
        },
      ],
      [
        "bl",
        {
          x: [bl],
          y: [bl, br],
          customX: { vec2: [top], transform: (v) => v / 2 },
          exceptions: [
            {
              if: ({ x }) => x < 0 && bl.x >= br.x,
              return: Pivot.BottomRight(),
            },
            {
              if: ({ y }) => y > 0 && top.y >= bl.y,
              return: Pivot.TopLeft(),
            },
          ],
        },
      ],
      [
        "tl",
        {
          x: [bl],
          y: [top],
          customX: { vec2: [top], transform: (v) => v / 2 },
          exceptions: [
            {
              if: ({ x }) => x < 0 && bl.x >= br.x,
              return: Pivot.TopRight(),
            },
            {
              if: ({ y }) => y < 0 && top.y >= bl.y,
              return: Pivot.BottomLeft(),
            },
          ],
        },
      ],
      [
        "tr",
        {
          x: [br],
          y: [top],
          customX: { vec2: [top], transform: (v) => v / 2 },
          exceptions: [
            {
              if: ({ x }) => x > 0 && bl.x >= br.x,
              return: Pivot.TopLeft(),
            },
            {
              if: ({ y }) => y < 0 && top.y >= bl.y,
              return: Pivot.BottomRight(),
            },
          ],
        },
      ],
    ]);
  }
}
