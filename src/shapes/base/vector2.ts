export class Vector2 {
  private _x: number;
  private _y: number;
  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  static new(): Vector2 {
    return new this(0, 0);
  }

  get x(): number {
    return this._x;
  }
  get y(): number {
    return this._y;
  }

  set x(n: number) {
    this._x = n;
  }
  set y(n: number) {
    this._y = n;
  }

  makeAbs(): this {
    this._x = Math.abs(this._x);
    this._y = Math.abs(this._y);
    return this;
  }

  inVicinity(vec2: Vector2, offset: number): boolean {
    return (
      Math.abs(this.x - vec2.x) <= offset && Math.abs(this.y - vec2.y) <= offset
    );
  }

  isZero(): boolean {
    return this.x === 0 && this.y === 0;
  }
  getPointsBetweenVertices(vec2: Vector2, numPoints: number): Vector2[] {
    const points = [];
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const x = this._x + (vec2.x - this._x) * t;
      const y = this._y + (vec2.y - this._y) * t;
      points.push(new Vector2(x, y));
    }
    return points;
  }
}
