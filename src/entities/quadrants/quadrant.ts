import { EventArgsMap, EventDataListener, Events } from "../../event-listener";
import { Pivot } from "../../shapes/Pivot";
import { Rect } from "../../shapes/Rect";
import { GenericShape } from "../../shapes/generic-shape";
import { Shape } from "../../shapes/shape";
import { ToggleLink } from "../../shapes/toggle-link";
import { Vector2 } from "../../shapes/vector2";
import { Entity, ShapeDrawOptions, _null } from "../../type";
import { GlobalSelect } from "../global-select";

export abstract class Quadrant implements Entity {
  protected readonly abstract eventId: string;
  static readonly OFFSET = 10;
  static readonly HOVER_OFFSET = 30;
  ctx: CanvasRenderingContext2D;
  eventListener: EventDataListener;
  _quads: Map<number, Shape> = new Map();
  protected doubleClickQuads: Set<number> = new Set();
  protected activeQuads: Set<number> = new Set();
  protected activePivotQuads: Map<number, Pivot> = new Map();
  protected _hoveringQuad: _null<Shape> = null;
  protected activeQuadText: _null<Rect> = null;
  constructor(
    ctx: CanvasRenderingContext2D,
    eventDataListener: EventDataListener
  ) {
    this.ctx = ctx;
    this.eventListener = eventDataListener;
  }
  update({ }) {
  }
  destroy() {
    this.eventListener.deregister(Events.ON_HOVER, this.onHover);
    this.eventListener.deregister(Events.MULTI_SELECT, this.onMultiSelect);
  }
  private get quads(): Map<number, Shape> {
    return this._quads;
  }
  init() {
    this.eventListener.registerWithMiddlewares(
      Events.NEW_QUAD,
      [this.resetTextLink],
      this.newQuad
    );
    this.eventListener.register(Events.ON_HOVER, this.onHover);
    this.eventListener.registerWithMiddlewares(
      Events.MULTI_SELECT,
      [this.resetTextLink],
      this.onMultiSelect
    );
    this.eventListener.registerWithMiddlewares(
      Events.SELECT_QUAD,
      [this.resetTextLink],
      this.quadSelect
    );
    this.eventListener.register(
      Events.UPDATE_QUAD_VEC2,
      this.updateActiveQuadVec2
    );
    this.eventListener.register(Events.GET_QUAD_BY_VEC2, this.getQuadByVec2);
    this.eventListener.register(Events.GET_QUAD_BY_ID, ([id, response]) =>
      response(this.quads.get(id) ?? null)
    );
    this.eventListener.register(Events.ON_DBCLICK, this.onDbClick);

    this.eventListener.register(Events.ON_LAYER_RENDER, (s) => {
      if (this._quads.has(s)) {
        this.renderQuads(this._quads.get(s));
      }
    })
    this.eventListener.register(Events.KEY_DOWN, this.onKeyDown)
  }

  protected abstract onKeyDown(args: EventArgsMap['KEY_DOWN']): void;

  protected onDbClick = (mouseEvent: EventArgsMap['ON_DBCLICK']) => {
    if (!this._hoveringQuad) return;
    this.doubleClickQuads = new Set([this._hoveringQuad.id])
  }

  private getQuadByVec2 = (arg: EventArgsMap["GET_QUAD_BY_VEC2"]) => {
    const [vec2, offset, cb] = arg;
    cb(this._hoveringQuad ? this._hoveringQuad : null);
  };
  protected selectQuad(
    vec2: Vector2,
    quadCheck?: boolean,
    allowOffset?: number
  ): boolean | Shape | null {
    const [cX, cY] = [vec2.x, vec2.y];
    const offset = allowOffset ?? Quadrant.OFFSET;
    let quad: _null<Shape> = null;
    const from = Array.from(this.quads.values());
    // for (let i = from.length - 1; i > -1; i--) {
    for (const [, q] of this.quads) {
      if (q.isPointIntersecting(vec2)) {
        quad = q;
        break;
      }
    }
    if (quadCheck) return quad;
    if (quad) {
      quad.setCurrentPosition(new Vector2(cX, cY));
      this.eventListener.invoke(Events.ACTIVE_QUAD, quad);
    }

    return !!quad;
  }

  renderQuads(quad: Shape, shapeDrawOptions?: ShapeDrawOptions) {
    if (
      this._hoveringQuad?.id! == quad.id ||
      this.activeQuads.has(quad.id!)
    ) {
      ToggleLink.draw(quad, this.ctx);
    }
    quad.draw(this.ctx, shapeDrawOptions ?? {
      highlightVertices:
        this._hoveringQuad?.id! == quad.id || this.activeQuads.has(quad.id!),
      boundingBox: this.activeQuads.has(quad.id!),
      lineWidth: .2
    });
  }

  private resetTextLink = (e: keyof typeof Events) => {
    this.doubleClickQuads = new Set();
    this.activeQuadText = null;
    return true;
  };

  private newQuad = () => {
    const r = this.fetchShape;
    this.eventListener.invoke('PUSH_TO_LAYER', [r.id, r.layerId]);
    this.quads.set(r.id!, r);
  };

  private onHover = (vec2: Vector2) => {
    let q: _null<Shape> = null;
    for (const [, quad] of this.quads) {
      if (
        new GenericShape(0, 0)
          .setVerticies(quad.getCurrentBoundingBox(25))
          .isPointIntersecting(vec2)
      ) {
        q = quad as Shape;
        break;
      }
    }
    if (q instanceof Shape) {
      this.eventListener.invoke("UPDATE_CANVAS_POINTER", "pointer");
      if (this.activeQuads.has(q.id!)) {
        const p = q.isPivotClick(vec2);
        p &&
          this.eventListener.invoke(
            "UPDATE_CANVAS_POINTER",
            Shape.ResizeMouseStyle[p.value]
          );
      }
      this._hoveringQuad = q;
      return;
    }
    this._hoveringQuad = null;
  };

  private onMultiSelect = (v: EventArgsMap["MULTI_SELECT"]) => {
    const [pos, dimen] = v;
    const [cX, cY, cW, cH] = GlobalSelect.normalizeSelectVector(pos, dimen);
    this.activeQuads = new Set();

    this.quads.forEach((quad) => {
      for (const point of quad.vertices) {
        if (
          point.x < cX ||
          point.x > cX + cW ||
          point.y < cY ||
          point.y > cY + cH
        ) {
          return;
        }
      }
      this.activeQuads.add(quad.id!);
    });
  };

  private updateActiveQuadVec2 = (arg: EventArgsMap["UPDATE_QUAD_VEC2"]) => {
    const [vec2, activeSet] = arg;
    for (const qId of Array.from(this.activeQuads)) {
      const activeQuad = this.quads.get(qId);
      if (!activeQuad) continue;
      if (!activeSet.has(activeQuad.id!)) {
        this.activeQuads.delete(activeQuad.id!);
        continue;
      }
      const { currentPosition } = activeQuad;
      const offsetX = currentPosition!.x - vec2.x;
      const offsetY = currentPosition!.y - vec2.y;
      if (!offsetX && !offsetY) return;
      if (this.activePivotQuads.has(activeQuad.id!)) {
        const pivotPoint = this.activePivotQuads.get(activeQuad.id!)!;
        this.eventListener.invoke(
          "UPDATE_CANVAS_POINTER",
          Shape.ResizeMouseStyle[pivotPoint.value]
        );
        const newPivot = activeQuad.updatePositionByPivot(
          pivotPoint,
          new Vector2(offsetX, offsetY)
        );
        if (newPivot) {
          this.activePivotQuads.set(activeQuad.id!, newPivot);
        }
        activeQuad.currentPosition = vec2;
        return;
      }
      this.eventListener.invoke("UPDATE_CANVAS_POINTER", "grab");
      activeQuad.updateCoordinate(new Vector2(offsetX, offsetY));
      activeQuad.currentPosition = vec2;
    }
  };

  quadSelect = (args: EventArgsMap["SELECT_QUAD"]) => {
    const [v, acknowledge] = args;
    const l = this.isLink(v);
    if (l) {
      acknowledge(l, () => { });
      return;
    }
    const r = this.selectQuad(v, true, Quadrant.OFFSET) as Shape;
    this.activePivotQuads = new Map();
    if (!(r instanceof Shape)) {
      let hasPivot = false;
      let quadUnderBounds = null;
      for (const qId of Array.from(this.activeQuads)) {
        const q = this.quads.get(qId);
        if (!q) continue;
        const point = q.isPivotClick(v);
        if (!point) continue;
        quadUnderBounds = q;
        hasPivot = true;
        this.activePivotQuads.set(q.id!, point);
        q.setCurrentPosition(v);
      }
      if (hasPivot) {
        acknowledge?.(quadUnderBounds, () => { });
        return;
      } else if (this._hoveringQuad) {
        const hoverPivot = this._hoveringQuad.isPivotClick(v);
        const hoverQuad = this._hoveringQuad;
        if (hoverPivot) {
          this.activeQuads = new Set([hoverQuad.id!]);
          this.activePivotQuads = new Map([[hoverQuad.id!, hoverPivot]]);
          hoverQuad.setCurrentPosition(v);
          acknowledge?.(hoverQuad, () => { });
          return;
        }
      }
      this.activePivotQuads = new Map();
      this.activeQuads = new Set();
      return;
    }
    this.eventListener.invoke("UPDATE_CANVAS_POINTER", "pointer");
    if (!this.activeQuads.has(r.id!)) {
      r.setCurrentPosition(v);
      this.activeQuads = new Set();
      this.activeQuads.add(r.id!);
    } else {
      for (const c of this.activeQuads) {
        this.quads.get(c)?.setCurrentPosition(v)
      }
    }
    acknowledge?.(r, () => { });
  };
  private isLink = (vec2: Vector2): _null<Shape> => {
    if (
      !!this._hoveringQuad
      && ToggleLink.areIntersecting(this._hoveringQuad, vec2)
    ) {
      this.activeQuads = new Set([this._hoveringQuad.id!]);
      const quad = this.quads.get(this._hoveringQuad.id!);
      let linkShape: _null<Shape> = null;
      this.eventListener.invoke(Events.GENERATE_NEW_LINK, [
        vec2,
        quad,
        (l, eventId) => {
          if (eventId === this.eventId) {
            linkShape = l;
          }
        },
        this.eventId
      ]);
      return linkShape;
    }
    return null;
  };

  protected abstract get fetchShape(): Shape;

  static getQuadById(el: EventDataListener, id: number): _null<Shape> {
    let q: _null<Shape> = null;
    el.invoke("GET_QUAD_BY_ID", [
      id,
      (quad) => {
        if (q) return;
        q = quad;
      },
    ]);
    return q;
  }

  protected isQuadDbClicked(id: number): boolean {
    return this.doubleClickQuads.has(id);
  }

  protected getKeyDown(args: KeyboardEvent): _null<{ key: string, backspace?: boolean }> {
    if ((args.keyCode >= 32 && args.keyCode <= 126) || args.key === "Backspace")
      return {
        key: args.key, backspace: true
      };
    return null;
  }
}
