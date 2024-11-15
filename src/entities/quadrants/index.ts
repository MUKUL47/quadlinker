import { EventDataListener } from "../../event-listener";
import { Label } from "./label.quadrant";
import { RectShape } from "./rect.quadrant";

export const quadrants = (
    ctx: CanvasRenderingContext2D,
    eventDataListener: EventDataListener) => [
        // new Label(ctx, eventDataListener),
        new RectShape(ctx, eventDataListener),
    ]