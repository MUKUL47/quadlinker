import { _null, highlightVerticesType, PivotPoint, TransformPivotData } from "../type";
import { Pivot } from "./Pivot";
import { Rect } from "./Rect";
import { Shape } from "./shape";
import { Vector2 } from "./vector2";

export class TextArea extends Shape {
    transformPivotMap: Map<PivotPoint, TransformPivotData>;
    label: string = 'Text Label';
    offset = 10;
    ctx: CanvasRenderingContext2D;
    constructor(x: number, y: number, ctx: CanvasRenderingContext2D, label?: string) {
        super(x, y, [])
        this.ctx = ctx;
        ctx.font = "18px Arial";
        this.label = label ?? this.label
        this.ctx.font = "18px Arial";
        const textDimens = this.ctx.measureText(this.label);
        this.vertices = [
            new Vector2(x - this.offset, y - this.offset),
            new Vector2(x + textDimens.width + this.offset, y - this.offset),
            new Vector2(x + textDimens.width + this.offset, y + textDimens.actualBoundingBoxAscent + textDimens.actualBoundingBoxDescent + this.offset),
            new Vector2(x - this.offset, y + textDimens.actualBoundingBoxAscent + textDimens.actualBoundingBoxDescent + this.offset),
        ]
        this.transformPivotMap = Rect.getTransformPivot(this.vertices)
    }

    draw(ctx: CanvasRenderingContext2D, options?: Partial<{ fillStyle: string | CanvasGradient | CanvasPattern; strokeStyle: string | CanvasGradient | CanvasPattern; highlightVertices: boolean; boundingBox: boolean; lineWidth: number; }>): void {
        !!options?.boundingBox && this.boundingBox(ctx, this.getAbsBox(), { disableArc: !options?.highlightVertices, fillStyle: options?.fillStyle })
        ctx.fillStyle = '#000'
        ctx.font = "18px Arial";
        const textDimens = ctx.measureText(this.label);
        const [minX, minY, maxX, maxY] = super.getAbsBox(this.vertices);
        ctx.fillText(this.label, minX + (maxX - minX) / 2 - textDimens.width / 2, minY + (maxY - minY) / 2 + textDimens.actualBoundingBoxAscent / 2);
    }

    static getDimensions(ctx: CanvasRenderingContext2D, label: string): [number, number] {
        const textDimens = ctx.measureText(label);
        return [textDimens.width, textDimens.actualBoundingBoxAscent - textDimens.actualBoundingBoxDescent]
    }
}