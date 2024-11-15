import { EventArgsMap, EventDataListener } from "../../event-listener";
import { Circle } from "../../shapes/circle";
import { Rect } from "../../shapes/Rect";
import { TextShape } from "../../shapes/text-shape";
import { Triangle } from "../../shapes/triangle";
import { Entity } from "../../type";
import { PriorityLinker } from "../priority-linker";
import { Quadrant } from "./quadrant";

export class RectShape extends Quadrant {
    protected eventId: string = RectShape.name;
    constructor(
        ctx: CanvasRenderingContext2D,
        eventDataListener: EventDataListener
    ) {
        super(ctx, eventDataListener)
    }
    get fetchShape() {
        return new Rect(Math.random() * 500, Math.random() * 800, 100).setId(PriorityLinker.generateUniqueGlobalId(this.eventListener));
    }
    protected onKeyDown = (args: EventArgsMap["KEY_DOWN"]) => {
        if (!this.doubleClickQuads.size) return;
        const quad = this._quads.get(Array.from(this.doubleClickQuads)[0]) as TextShape;
        if (quad && (quad instanceof TextShape) && (args.keyCode >= 32 && args.keyCode <= 126) || args.key === "Backspace" || args.key === 'Enter') {
            if (!['Backspace', 'Enter'].includes(args.key) && args.key.length > 1) return;
            if (args.key === 'Enter') {
                quad.updateLabel('', 'ENTER');
                return;
            }
            if (args.key === "Backspace") {
                quad.updateLabel('', 'BACKSPACE');
                return;
            }
            quad.updateLabel(args.key, 'KEYSTROKE');
            args.preventDefault()
        }
    }
}
