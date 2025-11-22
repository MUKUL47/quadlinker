import { EventArgsMap, EventDataListener } from "../../core/event-listener";
import { Shape } from "../../shapes/base/shape";
import { TextArea } from "../../shapes/text/textarea";
import { PriorityLinker } from "../priority-linker";
import { Quadrant } from "./quadrant";

export class Label extends Quadrant {
  protected onKeyDown = (args: EventArgsMap["KEY_DOWN"]) => {
    if (!this.doubleClickQuads.size) return;
    const quad = this._quads.get(
      Array.from(this.doubleClickQuads)[0]
    ) as TextArea;
    if (
      (quad &&
        quad instanceof TextArea &&
        args.keyCode >= 32 &&
        args.keyCode <= 126) ||
      args.key === "Backspace"
    ) {
      if (args.key === "Backspace") {
        quad.label = quad.label.slice(0, quad.label.length - 1);
        return;
      }
      quad.label += args.key;
      args.preventDefault();
    }
  };
  eventId: string = Label.name;
  constructor(
    ctx: CanvasRenderingContext2D,
    eventDataListener: EventDataListener
  ) {
    super(ctx, eventDataListener);
  }
  get fetchShape() {
    return new TextArea(
      Math.random() * 500,
      Math.random() * 800,
      this.ctx
    ).setId(PriorityLinker.generateUniqueGlobalId(this.eventListener));
  }

  renderQuads(
    quad: Shape,
    shapeDrawOptions?: Partial<{
      fillStyle: string | CanvasGradient | CanvasPattern;
      strokeStyle: string | CanvasGradient | CanvasPattern;
      highlightVertices: boolean;
      boundingBox: boolean;
      lineWidth: number;
    }>
  ): void {
    super.renderQuads(quad, {
      boundingBox: true,
      highlightVertices:
        this._hoveringQuad?.id! == quad.id || this.activeQuads.has(quad.id!),
    });
  }
}
