import { EventArgsMap, EventDataListener, Events } from "../event-listener";
import { Link } from "../shapes/link";
import { Shape } from "../shapes/shape";
import { Vector2 } from "../shapes/vector2";
import { Entity, _null } from "../type";
import { calculateDistance, vecToRgb } from "../utils";
import { PriorityLinker } from "./priority-linker";
/**
 * Source and Target
Connection Points
Link Style (Line Type)
Direction/Arrowheads
Link Color and Thickness
Link Labeling
Routing and Pathfinding
Link State (Selected/Active)
Drag and Drop Adjustments
Dashed or Solid Lines
Link Creation
Link Removal
Z-Index
Link Animation (Optional)

 */
export class LinkQuad implements Entity {
  static readonly LinkHandleRGB = [123, 33, 203, 1];
  ctx: CanvasRenderingContext2D;
  eventListener: EventDataListener;
  private _links: Map<number, Link> = new Map();
  private linksMap: Map<number, Link> = new Map();
  private activelink: _null<Link> = null;
  private _hoveringlink: _null<Link> = null;
  private eventId: string = "";

  constructor(
    ctx: CanvasRenderingContext2D,
    eventDataListener: EventDataListener
  ) {
    this.ctx = ctx;
    this.eventListener = eventDataListener;
  }
  update({ }) {
    // this.renderLinks();
  }
  destroy() {
    this.eventListener.deregister(Events.GENERATE_NEW_LINK, this.newLink);
    this.eventListener.deregister(Events.SELECT_QUAD, this.quadSelect);
    this.eventListener.deregister(Events.ON_HOVER, this.onHover);
    this.eventListener.deregister(
      Events.UPDATE_QUAD_VEC2,
      this.updateActiveQuadVec2
    );
    this.eventListener.deregister(Events.ON_MOUSE_UP, this.onMouseUp);
  }
  init() {
    this.eventListener.register(Events.GENERATE_NEW_LINK, this.newLink);
    this.eventListener.register(Events.SELECT_QUAD, this.quadSelect);
    this.eventListener.register(
      Events.UPDATE_QUAD_VEC2,
      this.updateActiveQuadVec2
    );
    this.eventListener.register(Events.ON_MOUSE_UP, this.onMouseUp);
    this.eventListener.register(Events.ON_HOVER, this.onHover);
    this.eventListener.register(Events.ON_LAYER_RENDER, (s) => {
      if (this._links.has(s)) {
        this.renderLinks(this._links.get(s));
      }
    })
  }
  renderLinks(quad: Link) {
    quad.normalizeAbsPoints();
    quad.drawLink(this.ctx);
    if (this._hoveringlink?.id == quad.id || this.activelink?.id == quad.id) {
      quad.highlightVertices(this.ctx, quad.vertices, {
        radius: 4,
        fillStyle: vecToRgb(LinkQuad.LinkHandleRGB),
      });
      quad.hoverVertex &&
        quad.highlightVertices(this.ctx, [quad.hoverVertex], {
          radius: 4,
          fillStyle: "green",
        });
    }
  }

  private getQuadById(id: number): _null<Shape> {
    let q = null;
    this.eventListener.invoke("GET_QUAD_BY_ID", [id, (r) => (q = r)]);
    return q;
  }

  private updateActiveQuadVec2 = (arg: EventArgsMap["UPDATE_QUAD_VEC2"]) => {
    const [vec2, activeSet, mouseDownVec] = arg;
    if (!this.activelink) {
      activeSet.forEach((v) => {
        if (this._links.has(+v)) {
          this.activelink = this._links.get(+v)!;
          return;
        }
      });
    }
    if (!this.activelink || !activeSet.has(this.activelink.id!)) {
      this.activelink = null;
      return;
    }
    this.eventListener.invoke(Events.ON_HOVER, vec2);
    if (calculateDistance(vec2, mouseDownVec)) {
      if (this.activelink.newPointVertex) {
        this.activelink.addNewPoint(
          this.activelink.newPointVertex,
          this.activelink.activeVertexPointIndex!
        );
        this.activelink.newPointVertex = null;
      }
      this.activelink.updatePoint(vec2);
    }
  };

  private getNearbyLink(
    vec2: Vector2,
    intersectionPoints?: number
  ): _null<[Link, number, Vector2, Boolean]> {
    for (let [, quad] of this._links) {
      if (!quad.areBoundsIntersecting(quad.getBoundingBox(4), vec2)) {
        continue;
      }
      for (let i = 0; i < quad.vertices.length; i++) {
        const linkPoint = quad.vertices[i];
        if (linkPoint.inVicinity(vec2, 8)) {
          return [quad, i, linkPoint, false];
        }
      }
      if (intersectionPoints) {
        const pivotIndexes = quad.getPointsBtwAllVerticies(intersectionPoints);
        for (const [point, index] of pivotIndexes) {
          if (point.inVicinity(vec2, 5)) {
            return [quad, index, point, true];
          }
        }
      }
    }
    return null;
  }

  private onMouseUp = (vec2: EventArgsMap["ON_MOUSE_UP"]) => {
    try {
      if (!this.activelink) return;
      const point = this.activelink!.activeVertexPointIndex;
      let q: _null<Shape> = null;
      this.eventListener.invoke(Events.GET_QUAD_BY_VEC2, [
        vec2,
        0,
        (quad) => {
          if (q || !quad) return;
          q = quad;
        },
      ]);
      if (!q) return;
      if (point === 0) {
        this.activelink!.sourceId = q.id;
      } else if (point === this.activelink!.vertices.length - 1) {
        this.activelink!.destinationId = q.id;
      }
      this.activelink?.updatePoint(vec2);
      if (this.activelink!.sourceId == this.activelink!.destinationId) {
        return this.removeLink(this.activelink!.id!);
      }
    } catch (e) { }
  };

  private quadSelect = (args: EventArgsMap["SELECT_QUAD"]) => {
    const [vec2, acknowledge] = args;
    const link = this.getNearbyLink(vec2, 50);

    if (!link) {
      this.activelink = null;
      return;
    }
    const [l, idx, linkPoint, isAbsPivot] = link;
    this.activelink = l;
    if (isAbsPivot) {
      // this.activelink.addNewPoint(linkPoint, idx);
      l.updateActiveVertexPointIndex(idx, linkPoint);
      acknowledge?.(l, () => { });
      return;
    }
    l.newPointVertex = null;
    l.resetSourceDestinationId(idx);
    l.setCurrentPosition(vec2);
    l.updateActiveVertexPointIndex(idx);
    acknowledge?.(l, () => { });
  };

  private removeLink(id: number) {
    this._links.delete(id);
  }

  private newLink = (arg: EventArgsMap["GENERATE_NEW_LINK"]) => {
    const [v, q, cb, eventId] = arg;
    const l = new Link(v.x, v.y, 10, this.eventListener, q.id);
    l.setId(PriorityLinker.generateUniqueGlobalId(this.eventListener));
    l.setCurrentPosition(v);
    this.activelink = l;
    this._links.set(l.id!, l);
    this.eventListener.invoke('PUSH_TO_LAYER', [l.id, l.layerId]);
    cb?.(l, eventId);
  };
  private onHover = (vec2: Vector2) => {
    if (this._hoveringlink) {
      this._hoveringlink.hoverVertex = null;
    }
    const [link, idx, coord] = this.getNearbyLink(vec2, 200) || [];
    if (link) {
      this.eventListener.invoke("UPDATE_CANVAS_POINTER", "crosshair");
      this._hoveringlink = link;
      this._hoveringlink.hoverVertex = coord!;
      return;
    }
    this._hoveringlink = null;
  };
}
