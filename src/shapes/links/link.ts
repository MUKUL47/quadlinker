import { EventDataListener } from "../../core/event-listener";
import { PivotPoint, TransformPivotData, _null } from "../../core/types/type";
import { getNearestDistance } from "../../core/utils/utils";
import { Quadrant } from "../../entities/quadrants/quadrant";
import { Shape } from "../base/shape";
import { Vector2 } from "../base/vector2";

export class Link extends Shape {
  transformPivotMap: Map<PivotPoint, TransformPivotData>;
  sourceId: _null<number> = null;
  destinationId: _null<number> = null;
  activeVertexPointIndex: _null<number> = null;
  private eventListener: EventDataListener;
  hoverVertex: _null<Vector2> = null;
  newPointVertex: _null<Vector2> = null;
  constructor(
    x: number,
    y: number,
    w: number,
    eventListener: EventDataListener,
    sourceId: _null<number>
  ) {
    super(x, y, [new Vector2(x, y), new Vector2(x, y + w)]);
    this.sourceId = sourceId;
    this.eventListener = eventListener;
    this.activeVertexPointIndex = this.vertices.length - 1;
    this.transformPivotMap = new Map();
  }

  getDestinationVec(): Vector2 {
    return this.vertices[this.vertices.length - 1];
  }

  getOrigin(): Vector2 {
    return this.vertices[0];
  }

  getSourceDestination(): [_null<Shape>, _null<Shape>] {
    return [
      Quadrant.getQuadById(this.eventListener, this.sourceId),
      Quadrant.getQuadById(this.eventListener, this.destinationId),
    ];
  }

  normalizeAbsPoints() {
    const [src, dest] = this.getSourceDestinationPivot();
    this.vertices[this.vertices.length - 1] = dest;
    this.vertices[0] = src;
  }

  updatePoint(vec2: Vector2): this {
    if (this.activeVertexPointIndex == null) return this;
    this.vertices[this.activeVertexPointIndex] = vec2;
    this.normalizeAbsPoints();
    // this.setCurrentPosition(vec2);
    return this;
  }

  updateActiveVertexPointIndex(n: number, v?: Vector2): this {
    if (n < 0 || this.vertices.length <= n) return this;
    this.activeVertexPointIndex = n;
    if (v) {
      this.newPointVertex = v;
    }
    return this;
  }

  addNewPoint(vec2: Vector2, index: number) {
    this.vertices.splice(index + 1, 0, vec2);
    this.updateActiveVertexPointIndex(index + 1);
  }

  getSourceDestinationPivot(): [Vector2, Vector2] {
    const [src, dest] = this.getSourceDestination();
    let srcVec = src ? src.vertices[0] : this.vertices[0];
    let destVec = dest
      ? dest.vertices[0]
      : this.vertices[this.vertices.length - 1];
    if (this.vertices.length === 2) {
      if (src && dest) {
        [srcVec, destVec] = getNearestDistance(
          src.getPointsBetweenAllVertices(10),
          dest.getPointsBetweenAllVertices(10)
        );
      } else if (src && !dest) {
        [srcVec, destVec] = getNearestDistance(
          src.getPointsBetweenAllVertices(10),
          [destVec]
        );
      } else if (!src && dest) {
        [srcVec, destVec] = getNearestDistance(
          [srcVec],
          dest.getPointsBetweenAllVertices(10)
        );
      }
    }
    return [srcVec, destVec];
  }

  drawLink(ctx: CanvasRenderingContext2D): void {
    const [src, dest] = this.getSourceDestinationPivot();
    ctx.beginPath();
    ctx.moveTo(src.x, src.y);
    for (let i = 1; i < this.vertices.length - 1; i++) {
      const v = this.vertices[i];
      ctx.lineTo(v.x, v.y);
    }
    ctx.lineTo(dest.x, dest.y);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "gray";
    ctx.stroke();
  }

  resetSourceDestinationId(idx: number) {
    if (idx === 0) {
      this.sourceId = null;
    } else if (idx === this.vertices.length - 1) {
      this.destinationId = null;
    }
  }

  getBoundingBox(
    offset?: number | undefined
  ): [Vector2, Vector2, Vector2, Vector2] {
    offset = offset ?? 0;
    const [src, dest] = this.getSourceDestinationPivot();
    const v1 = src;
    let [minX, minY, maxX, maxY] = [v1.x, v1.y, v1.x, v1.y];
    for (let i = 1; i < this.vertices.length - 1; i++) {
      const v = this.vertices[i];
      [minX, minY, maxX, maxY] = [
        Math.min(minX, v.x),
        Math.min(minY, v.y),
        Math.max(maxX, v.x),
        Math.max(maxY, v.y),
      ];
    }
    [minX, minY, maxX, maxY] = [
      Math.min(minX, dest.x),
      Math.min(minY, dest.y),
      Math.max(maxX, dest.x),
      Math.max(maxY, dest.y),
    ];
    return [
      new Vector2(minX - offset, minY - offset),
      new Vector2(maxX + offset, minY - offset),
      new Vector2(maxX + offset, maxY + offset),
      new Vector2(minX - offset, maxY + offset),
    ];
  }

  getPointsBtwAllVerticies(
    intersectionPoints: number
  ): Array<[Vector2, number]> {
    const srcDests = new Array();
    const index = new Array();
    const [s, q] = this.getSourceDestinationPivot();
    if (this.vertices.length === 2) {
      index.push(0);
      srcDests.push(s.getPointsBetweenVertices(q, intersectionPoints));
    } else {
      for (let i = 0; i < this.vertices.length - 1; i++) {
        const [s, d] = [this.vertices[i], this.vertices[i + 1]];
        index.push(i);
        srcDests.push(s.getPointsBetweenVertices(d, intersectionPoints));
      }
    }
    const pivotIndexes: Array<[Vector2, number]> = new Array();
    for (let i = 0; i < srcDests.length; i++) {
      const points = srcDests[i];
      for (let j = 0; j < points.length; j++) {
        pivotIndexes.push([points[j], index[i]]);
      }
    }
    return pivotIndexes;
  }
}
