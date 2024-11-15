import { EventDataListener } from "../event-listener";
import { Entity } from "../type";

export class Layer implements Entity {
    ctx: CanvasRenderingContext2D;
    shapes: Map<number, number> = new Map();
    eventListener: EventDataListener;
    constructor(
        ctx: CanvasRenderingContext2D,
        eventDataListener: EventDataListener
    ) {
        this.ctx = ctx;
        this.eventListener = eventDataListener;
    }
    init() {
        this.eventListener.register('PUSH_TO_LAYER', ([id, layerId]) => this.shapes.set(id, layerId))
    }
    update({ }) {
        Array.from(this.shapes).
            sort(([, a], [, b]) => a - b).
            forEach(([s]) => this.eventListener.invoke('ON_LAYER_RENDER', s))
    }
    destroy() {
    }
}
