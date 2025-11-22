import { PivotPoint, TransformPivotData } from "../../core/types/type";
import { Vector2 } from "../base/vector2";
import { TextShape } from "../text/text-shape";

export class Circle extends TextShape {
  transformPivotMap: Map<PivotPoint, TransformPivotData>;
  constructor(x: number, y: number, radius: number, sides?: number) {
    const vertices = [];
    const s = sides || 25;
    const angleIncrement = (2 * Math.PI) / s;

    for (let i = 0; i < s; i++) {
      const angle = i * angleIncrement;
      const vx = x + radius * Math.cos(angle);
      const vy = y + radius * Math.sin(angle);
      vertices.push(new Vector2(vx, vy));
    }

    super(x, y, vertices);
  }
}
