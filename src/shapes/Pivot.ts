import { PivotPoint } from "../type";

export class Pivot {
  private point: PivotPoint;
  constructor(point: PivotPoint) {
    this.point = point;
  }

  get value(): PivotPoint {
    return this.point;
  }

  static TopLeft(): Pivot {
    return new this("tl");
  }

  static TopRight(): Pivot {
    return new this("tr");
  }

  static BottomLeft(): Pivot {
    return new this("bl");
  }

  static BottomRight(): Pivot {
    return new this("br");
  }

  isTopLeft(): boolean {
    return this.point === "tl";
  }

  isBottomLeft(): boolean {
    return this.point === "bl";
  }

  isTopRight(): boolean {
    return this.point === "tr";
  }

  isBottomRight(): boolean {
    return this.point === "br";
  }
}
