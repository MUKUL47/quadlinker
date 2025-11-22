import {
  EventArgsMap,
  Events,
  EventDataListener,
} from "../core/event-listener";
import { Shape } from "../shapes/base/shape";
import { Link } from "../shapes/links/link";
import { Entity } from "../core/types/type";
export class PriorityLinker implements Entity {
  ctx: CanvasRenderingContext2D;
  eventListener: EventDataListener;
  private globalEntityId = 1;
  constructor(
    ctx: CanvasRenderingContext2D,
    eventDataListener: EventDataListener
  ) {
    this.ctx = ctx;
    this.eventListener = eventDataListener;
  }
  destroy() {}
  init() {
    this.eventListener.register(
      Events.PriorityLinker_DECIDE_POLY,
      (arg: EventArgsMap["PriorityLinker_DECIDE_POLY"]) => {
        const [p, cb] = arg;
        cb(p.find((v) => !!(v instanceof Link)) as Shape);
      }
    );
    this.eventListener.register(Events.GENERATE_NEW_ID, (cb) =>
      cb(this.globalEntityId++)
    );
    this.eventListener.register(
      Events.UPDATE_CANVAS_POINTER,
      (cb) => (this.ctx.canvas.style.cursor = cb)
    );
  }
  update() {}

  static generateUniqueGlobalId(el: EventDataListener): number {
    let id = -1;
    el.invoke(Events.GENERATE_NEW_ID, (idx) => (id = idx));
    return id;
  }
}
