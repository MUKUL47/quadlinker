import { PivotPoint, TransformPivotData } from "../type";
import { Shape } from "./shape";
import { Vector2 } from "./vector2";

export class GenericShape extends Shape {
  transformPivotMap: Map<PivotPoint, TransformPivotData>;
  constructor(x: number, y: number) {
    super(x, y, []);
    this.transformPivotMap = new Map();
  }
  static boundingBox(vec2: Array<Vector2>): Shape {
    const s = new this(vec2[0].x, vec2[0].y);
    s.vertices = s.getCurrentBoundingBox();
    return s;
  }
}
