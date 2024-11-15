import { EventDataListener, Events } from "../event-listener";
import { Entity, EntityUpdate, _null } from "../type";
import { Polygon } from "../shapes/polygon";
import { Vector2 } from "../shapes/vector2";

export class GlobalSelect implements Entity {
  ctx: CanvasRenderingContext2D;
  eventListener: EventDataListener;
  private initMouse: _null<Vector2> = null;
  private currentVector: _null<Vector2> = null;
  private mousePosition: _null<Vector2> = new Vector2(0, 0);
  private isMoving: boolean = false;
  private isPolyActive: boolean = false;
  private activePolygons: Set<number> = new Set();
  private mouseDownPosition: Vector2 = Vector2.new();
  init() {
    this.eventListener.register(Events.ON_MOUSE_POSITION, this.onMousePosition);
  }
  destroy() {
    this.eventListener.deregister(
      Events.ON_MOUSE_POSITION,
      this.onMousePosition
    );
  }
  constructor(
    ctx: CanvasRenderingContext2D,
    eventDataListener: EventDataListener
  ) {
    this.ctx = ctx;
    this.eventListener = eventDataListener;
  }
  private get hasPoly(): boolean {
    return !!this.activePolygons.size;
  }
  update({ keystrokes, mousestrokes }: EntityUpdate) {
    const isMouseDown = mousestrokes.has("mousedown");
    const isMouseUp = mousestrokes.has("mouseup");
    const currentVec = new Vector2(
      this.mousePosition!.x,
      this.mousePosition!.y
    );
    if (isMouseUp) {
      this.eventListener.invoke(Events.ON_MOUSE_UP, currentVec);
      const [x, y, w, h] = this.getActiveSelect();
      !this.hasPoly &&
        this.eventListener.invoke(Events.MULTI_SELECT, [
          new Vector2(x, y),
          new Vector2(w, h),
        ]);
      this.initMouse = null;
    }
    if (!isMouseDown) {
      this.eventListener.invoke(Events.ON_HOVER, currentVec);
      this.isMoving = false;
      this.initMouse = currentVec;
      return;
    }
    if (isMouseDown) {
      const wasIdle = !this.isMoving;
      this.isMoving = true;
      this.currentVector = currentVec;
      if (wasIdle) {
        this.mouseDownPosition = currentVec;
        this.activePolygons = new Set();
        const currentPolys = new Array();
        this.eventListener.invoke(Events.SELECT_QUAD, [
          this.currentVector,
          (q) => {
            if (q) {
              this.activePolygons = new Set([q?.id!]);
              currentPolys.push(q);
            }
          },
        ]);
        this.eventListener.invoke(Events.PriorityLinker_DECIDE_POLY, [
          currentPolys,
          (finalPoly) => {
            if (!finalPoly) return;
            this.activePolygons = new Set([finalPoly.id!]);
          },
        ]);
      }
      if (this.hasPoly) {
        this.eventListener.invoke(Events.UPDATE_QUAD_VEC2, [
          this.currentVector,
          this.activePolygons,
          this.mouseDownPosition,
        ]);
        return;
      }
      this.drawSelectRect();
    }
  }

  private drawSelectRect() {
    this.ctx.strokeStyle = "gray";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(...this.getActiveSelect());
  }

  getActiveSelect(): [number, number, number, number] {
    let x = this.initMouse!.x;
    let y = this.initMouse!.y;
    let dX = this.currentVector!.x;
    let dY = this.currentVector!.y;
    const w = dX - x;
    const h = dY - y;
    return [x, y, w, h];
  }

  static normalizeSelectVector(
    position: Vector2,
    dimension: Vector2
  ): [number, number, number, number] {
    return [
      dimension.x > -1 ? position.x : position.x + dimension.x,
      dimension.y > -1 ? position.y : position.y + dimension.y,
      dimension.x > -1 ? dimension.x : Math.abs(dimension.x),
      dimension.y > -1 ? dimension.y : Math.abs(dimension.y),
    ];
  }

  static getColorFromCanvasAtPosition(
    ctx: CanvasRenderingContext2D,
    vector: Vector2
  ): [number, number, number, number] | null {
    const x = Math.floor(vector.x);
    const y = Math.floor(vector.y);
    const canvas = ctx.canvas;
    if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
      const imageData = ctx.getImageData(x, y, 1, 1).data;
      return [imageData[0], imageData[1], imageData[2], imageData[3] / 255];
    } else {
      return null;
    }
  }

  private onMousePosition = (e: Vector2) => (this.mousePosition = e);
}
