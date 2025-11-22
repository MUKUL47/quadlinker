import {
  CursorStyle,
  PivotPoint,
  ShapeDrawOptions,
  TransformPivotData,
  _null,
  highlightVerticesType,
} from "../../core/types/type";
import { Pivot } from "../basic/Pivot";
import { Polygon } from "../basic/polygon";
import { Vector2 } from "./vector2";
export abstract class Shape extends Polygon {
  static readonly ResizeMouseStyle: Record<PivotPoint, CursorStyle> = {
    bl: "sw-resize",
    br: "se-resize",
    tr: "ne-resize",
    tl: "nw-resize",
  };
  abstract transformPivotMap: Map<PivotPoint, TransformPivotData>;
  id: _null<number> = null;
  private _layerId: number = 0;
  currentPosition: _null<Vector2> = null;
  constructor(x: number, y: number, verticies: Array<Vector2>) {
    super(x, y, verticies);
    this.updateAllVertexPoints();
  }

  setId(id: number): this {
    this.id = id;
    return this;
  }

  setCurrentPosition(currentPosition: Vector2): this {
    this.currentPosition = currentPosition;
    return this;
  }

  updateCoordinate(offset: Vector2) {
    this.x -= offset.x;
    this.y -= offset.y;
    this.vertices.forEach((c) => {
      c.x -= offset.x;
      c.y -= offset.y;
    });
    this.updateAllVertexPoints();
  }
  highlightVertices(
    ctx: CanvasRenderingContext2D,
    vec?: Vector2[],
    options: Partial<highlightVerticesType> = {}
  ) {
    const {
      fillStyle = "gray",
      strokeStyle = "black",
      radius = 4,
      lineWidth = 1,
    } = options;
    ctx.fillStyle = fillStyle;
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;

    (vec ?? this.vertices).forEach((v) => {
      ctx.beginPath();
      ctx.arc(v.x + 1, v.y + 1, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    });
  }

  setLayer(id: number): this {
    this._layerId = id;
    return this;
  }

  get layerId(): number {
    return this._layerId;
  }

  getAbsBox(vec2?: Vector2[]): [number, number, number, number] {
    let rsp: [number, number, number, number] = [
      Number.MAX_SAFE_INTEGER,
      Number.MAX_SAFE_INTEGER,
      Number.MIN_SAFE_INTEGER,
      Number.MIN_SAFE_INTEGER,
    ];
    (vec2 ?? this.vertices).forEach((v) => {
      rsp = [
        Math.min(rsp[0], v.x),
        Math.min(rsp[1], v.y),
        Math.max(rsp[2], v.x),
        Math.max(rsp[3], v.y),
      ];
    });
    return rsp;
  }

  boundingBox(
    ctx: CanvasRenderingContext2D,
    absCoords: [number, number, number, number],
    options?: Partial<{
      disableArc: boolean;
      strokeStyle: string;
      lineWidth: number;
      fillStyle;
    }>
  ) {
    let [minX, minY, maxX, maxY] = absCoords;
    ctx.beginPath();
    ctx.strokeStyle = options?.strokeStyle ?? "#000";
    ctx.lineWidth = options?.lineWidth ?? 0.5;
    ctx.setLineDash([1]);
    const boundCoords = [
      new Vector2(minX, minY),
      new Vector2(minX, maxY),
      new Vector2(maxX, maxY),
      new Vector2(maxX, minY),
    ];
    const bc = boundCoords[0];
    ctx.moveTo(bc.x, bc.y);
    boundCoords.slice(1).forEach((v) => ctx.lineTo(v.x, v.y));
    ctx.lineTo(bc.x, bc.y);
    ctx.stroke();

    ctx.fillStyle = options?.fillStyle ?? "cyan";
    if (options?.disableArc) return;
    boundCoords.forEach((v) => {
      ctx.beginPath();
      ctx.arc(v.x + 1, v.y + 1, 3, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    });
  }

  draw(ctx: CanvasRenderingContext2D, options: ShapeDrawOptions = {}) {
    if (this.vertices.length === 0) return;
    ctx.beginPath();
    ctx.fillStyle = options.fillStyle ?? "lightgray";
    ctx.strokeStyle = options.strokeStyle ?? "gray";
    ctx.lineWidth = options.lineWidth ?? 1;
    const v1 = this.vertices[0];
    let [minX, minY, maxX, maxY] = [v1.x, v1.y, v1.x, v1.y];
    ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
    this.vertices.slice(1).forEach((v) => {
      [minX, minY, maxX, maxY] = [
        Math.min(minX, v.x),
        Math.min(minY, v.y),
        Math.max(maxX, v.x),
        Math.max(maxY, v.y),
      ];
      ctx.lineTo(v.x, v.y);
    });
    ctx.lineTo(this.vertices[0].x, this.vertices[0].y);
    ctx.fill();
    ctx.stroke();
    if (options.highlightVertices) {
      this.highlightVertices(ctx);
    }
    if (options.boundingBox) {
      this.boundingBox(ctx, [minX, minY, maxX, maxY]);
    }
  }

  updatePositionByPivot(pivot: Pivot, offsetVec2: Vector2): _null<Pivot> {
    if (offsetVec2.isZero() || !this.transformPivotMap) return null;
    const { x, y } = offsetVec2;
    const v = this.transformPivotMap.get(pivot.value);
    v?.x.forEach((o) => (o.x -= x));
    v?.y.forEach((o) => (o.y -= y));
    v?.customX?.vec2.forEach((o) => (o.x -= v.customX?.transform?.(x) ?? x));
    v?.customY?.vec2.forEach((o) => (o.y -= v.customY?.transform?.(y) ?? y));
    this.updateAllVertexPoints();
    const exps = v?.exceptions || [];
    for (const e of exps) {
      if (e.if(offsetVec2)) {
        this.updatePositionByPivot(e.return, offsetVec2);
        return e.return;
      }
    }
    return null;
  }
}
