import { _null, _undefined } from "../type";
import { Pivot } from "./Pivot";
import { Vector2 } from "./vector2";

export class Polygon extends Vector2 {
  vertices: Array<Vector2>;
  verticesPoints: Array<Vector2> = [];

  constructor(x: number, y: number, vertices: Array<Vector2>) {
    super(x, y);
    this.vertices = vertices;
  }

  setVerticies(verticies: Vector2[]): this {
    this.vertices = verticies;
    return this;
  }

  getCurrentBoundingBox(offset?: number): [Vector2, Vector2, Vector2, Vector2] {
    offset = offset ?? 0;
    const v1 = this.vertices[0];
    let [minX, minY, maxX, maxY] = [v1.x, v1.y, v1.x, v1.y];
    this.vertices.forEach((v) => {
      [minX, minY, maxX, maxY] = [
        Math.min(minX, v.x),
        Math.min(minY, v.y),
        Math.max(maxX, v.x),
        Math.max(maxY, v.y),
      ];
    });
    return [
      new Vector2(minX - offset, minY - offset),
      new Vector2(maxX + offset, minY - offset),
      new Vector2(maxX + offset, maxY + offset),
      new Vector2(minX - offset, maxY + offset),
    ];
  }
  //https://wrfranklin.org/Research/Short_Notes/pnpoly.html
  isPointIntersecting(p: Vector2): boolean {
    let minX = this.vertices[0].x;
    let maxX = this.vertices[0].x;
    let minY = this.vertices[0].y;
    let maxY = this.vertices[0].y;

    for (let i = 1; i < this.vertices.length; i++) {
      const q = this.vertices[i];
      minX = Math.min(q.x, minX);
      maxX = Math.max(q.x, maxX);
      minY = Math.min(q.y, minY);
      maxY = Math.max(q.y, maxY);
    }

    if (p.x < minX || p.x > maxX || p.y < minY || p.y > maxY) {
      return false;
    }

    let inside = false;
    for (
      let i = 0, j = this.vertices.length - 1;
      i < this.vertices.length;
      j = i++
    ) {
      if (
        this.vertices[i].y > p.y !== this.vertices[j].y > p.y &&
        p.x <
          ((this.vertices[j].x - this.vertices[i].x) *
            (p.y - this.vertices[i].y)) /
            (this.vertices[j].y - this.vertices[i].y) +
            this.vertices[i].x
      ) {
        inside = !inside;
      }
    }

    return inside;
  }

  updateAllVertexPoints(n?: number) {
    this.verticesPoints = this.getPointsBetweenAllVertices(n ?? 20);
  }

  getPointsBetweenAllVertices(margin: number): Vector2[] {
    if (this.vertices.length < 2) return [];
    const points = new Array<Vector2>();
    for (let i = 1; i < this.vertices.length; i++) {
      const v = this.vertices[i - 1];
      const v1 = this.vertices[i];
      points.push(...v1.getPointsBetweenVertices(v, margin));
    }
    if (this.vertices.length > 2) {
      points.push(
        ...this.vertices[0].getPointsBetweenVertices(
          this.vertices[this.vertices.length - 1],
          margin
        )
      );
    }
    return points;
  }
  areBoundsIntersecting(
    bounds: Vector2[],
    vec2: Vector2,
    offset?: number
  ): boolean {
    return new Polygon(bounds[0].x, bounds[0].y, bounds).isPointIntersecting(
      vec2
    );
  }

  isPivotClick(vec2: Vector2, offset?: number): _null<Pivot> {
    const [tl, tr, br, bl] = this.getCurrentBoundingBox(offset);
    if (tl.inVicinity(vec2, 15)) {
      return Pivot.TopLeft();
    }
    if (tr.inVicinity(vec2, 15)) {
      return Pivot.TopRight();
    }
    if (br.inVicinity(vec2, 15)) {
      return Pivot.BottomRight();
    }
    if (bl.inVicinity(vec2, 15)) {
      return Pivot.BottomLeft();
    }
    return null;
  }
}
