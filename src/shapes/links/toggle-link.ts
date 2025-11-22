import { PivotPoint, TransformPivotData } from "../../core/types/type";
import { vecToRgb } from "../../core/utils/utils";
import { Shape } from "../base/shape";
import { Vector2 } from "../base/vector2";

export class ToggleLink extends Shape {
  static readonly LinkColor = [0, 124, 252, 0.25];
  static readonly width = 15;
  transformPivotMap = new Map<PivotPoint, TransformPivotData>();
  constructor(shape: Shape) {
    const [tl, tr, br, bl] = shape.getCurrentBoundingBox();
    const [_x, _y] = [
      tr.x + ToggleLink.width / 2,
      tl.y + (br.y - tr.y) / 2 - ToggleLink.width / 2,
    ];
    super(_x, _y, []);
  }
  draw(
    ctx: CanvasRenderingContext2D,
    options?: Partial<{
      fillStyle: string | CanvasGradient | CanvasPattern;
      strokeStyle: string | CanvasGradient | CanvasPattern;
      highlightVertices: boolean;
      boundingBox: boolean;
    }>
  ): void {
    super.draw(ctx, {
      fillStyle: vecToRgb(ToggleLink.LinkColor),
      lineWidth: 0.2,
    });
  }

  static right(shape: Shape): ToggleLink {
    const [tl, tr, br, bl] = shape.getCurrentBoundingBox()!;
    const [_x, _y] = [
      tr.x + ToggleLink.width / 2,
      tl.y + (br.y - tr.y) / 2 - ToggleLink.width / 2,
    ];
    const s = new this(shape);
    s.x = _x;
    s.y = _y;
    s.vertices = [
      new Vector2(_x, _y),
      new Vector2(_x, _y + ToggleLink.width),
      new Vector2(_x + ToggleLink.width / 2, _y + ToggleLink.width / 2),
    ];
    return s;
  }

  static top(shape: Shape): ToggleLink {
    const [tl, tr, br, bl] = shape.getCurrentBoundingBox()!;
    const _x = tl.x + (tr.x - tl.x) / 2 - ToggleLink.width / 2;
    const _y = tl.y - ToggleLink.width;
    const s = new this(shape);
    s.x = _x;
    s.y = _y;
    s.vertices = [
      new Vector2(_x, _y + ToggleLink.width / 2),
      new Vector2(_x + ToggleLink.width, _y + ToggleLink.width / 2),
      new Vector2(_x + ToggleLink.width / 2, _y),
    ];
    return s;
  }

  static bottom(shape: Shape): ToggleLink {
    const [tl, tr, br, bl] = shape.getCurrentBoundingBox()!;
    const _x = bl.x + (br.x - bl.x) / 2 - ToggleLink.width / 2;
    const _y = bl.y;
    const s = new this(shape);
    s.x = _x;
    s.y = _y;
    s.vertices = [
      new Vector2(_x, _y + ToggleLink.width / 2),
      new Vector2(_x + ToggleLink.width, _y + ToggleLink.width / 2),
      new Vector2(_x + ToggleLink.width / 2, _y + ToggleLink.width),
    ];
    return s;
  }

  static left(shape: Shape): ToggleLink {
    const [tl, tr, br, bl] = shape.getCurrentBoundingBox()!;
    const _x = tl.x - ToggleLink.width;
    const _y = tl.y + (bl.y - tl.y) / 2 - ToggleLink.width / 2;
    const s = new this(shape);
    s.x = _x;
    s.y = _y;
    s.vertices = [
      new Vector2(_x + ToggleLink.width / 2, _y),
      new Vector2(_x + ToggleLink.width / 2, _y + ToggleLink.width),
      new Vector2(_x, _y + ToggleLink.width / 2),
    ];
    return s;
  }

  static all(shape: Shape): ToggleLink[] {
    return [
      ToggleLink.bottom(shape),
      ToggleLink.top(shape),
      ToggleLink.right(shape),
      ToggleLink.left(shape),
    ];
  }

  static draw(shape: Shape, ctx: CanvasRenderingContext2D): void {
    ToggleLink.all(shape).forEach((tl) => tl.draw(ctx));
  }

  static areIntersecting(shape: Shape, vec2: Vector2): boolean {
    const toggleLinks = ToggleLink.all(shape);
    for (const tl of toggleLinks) {
      if (tl.isPointIntersecting(vec2)) return true;
    }
    return false;
  }
}
