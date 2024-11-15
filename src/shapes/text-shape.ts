import { TextKeyboardEventType } from "../type";
import { Shape } from "./shape";
import { TextArea } from "./textarea";
import { Vector2 } from "./vector2";

export abstract class TextShape extends Shape {
    private label: string[] = [''];
    constructor(x: number, y: number, v: Vector2[]) {
        super(x, y, v);
    }
    draw(ctx: CanvasRenderingContext2D, options?: Partial<{ fillStyle: string | CanvasGradient | CanvasPattern; strokeStyle: string | CanvasGradient | CanvasPattern; highlightVertices: boolean; boundingBox: boolean; lineWidth: number; }>): void {
        super.draw(ctx, options);
        const [minX, minY, maxX, maxY] = super.getAbsBox(this.vertices);
        const [, h] = TextArea.getDimensions(ctx, this.label[0]);
        const staticOffset = ((this.label.length - 1) * h * 1.5) / 2
        for (let i = 0; i < this.label.length; i++) {
            const [width, height] = TextArea.getDimensions(ctx, this.label[i]);
            const h = minY + (maxY - minY) / 2 + height / 2 - 10;
            const w = minX + (maxX - minX) / 2 - width / 2;
            const offsetH = (i * height * 1.5)
            new TextArea(w, h + offsetH - staticOffset, ctx, this.label[i]).draw(ctx, { boundingBox: false });
        }
    }

    updateLabel(v: string, type: TextKeyboardEventType): this {
        if (type === 'BACKSPACE' && this.label.length === 1 && this.label[0].length === 0) return this;
        if (type === 'ENTER') {
            this.label.push('');
            return this;
        }
        if (type === 'BACKSPACE' && this.label[this.label.length - 1].length === 0 && this.label.length > 1) {
            this.label.pop();
            return this;
        }
        if (type === 'BACKSPACE') {
            this.label[this.label.length - 1] = this.label[this.label.length - 1].slice(0, this.label[this.label.length - 1].length - 1);
            return this;
        }
        this.label[this.label.length - 1] += v;
        return this;
    }
}