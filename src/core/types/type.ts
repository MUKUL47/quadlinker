import { Vector2 } from "../../shapes/base/vector2";
import { Pivot } from "../../shapes/basic/Pivot";
import { EventDataListener } from "../event-listener";

export type _undefined<T> = T | undefined;
export type _null<T> = T | null;
export type EntityUpdate = {
  delta: number;
  mousestrokes: Set<string>;
  keystrokes: Set<string>;
};
export interface Entity {
  ctx: CanvasRenderingContext2D;
  eventListener: EventDataListener;
  init: () => void;
  update: ({ delta, mousestrokes, keystrokes }: EntityUpdate) => void;
  destroy: () => void;
}
export type CursorStyle =
  | "auto"
  | "default"
  | "none"
  | "context-menu"
  | "help"
  | "pointer"
  | "progress"
  | "wait"
  | "cell"
  | "crosshair"
  | "text"
  | "vertical-text"
  | "alias"
  | "copy"
  | "move"
  | "no-drop"
  | "not-allowed"
  | "grab"
  | "grabbing"
  | "all-scroll"
  | "col-resize"
  | "row-resize"
  | "n-resize"
  | "e-resize"
  | "s-resize"
  | "w-resize"
  | "ne-resize"
  | "nw-resize"
  | "se-resize"
  | "sw-resize"
  | "ew-resize"
  | "ns-resize"
  | "nesw-resize"
  | "nwse-resize"
  | "zoom-in"
  | "zoom-out"
  | `url(${string}), auto`;

export type PivotPoint = "tl" | "tr" | "br" | "bl";
export type TransformPivotData = {
  x: Array<Vector2>;
  y: Array<Vector2>;
  customX?: { vec2: Array<Vector2>; transform: (v: number) => number };
  customY?: { vec2: Array<Vector2>; transform: (v: number) => number };
  exceptions?: Array<{
    if: (vec2: Vector2) => boolean;
    return: Pivot;
  }>;
};
export type ShapeDrawOptions = Partial<{
  fillStyle: string | CanvasGradient | CanvasPattern;
  strokeStyle: string | CanvasGradient | CanvasPattern;
  highlightVertices: boolean;
  boundingBox: boolean;
  lineWidth: number;
}>;
export type highlightVerticesType = {
  fillStyle: string;
  strokeStyle: string;
  radius: number;
  lineWidth: number;
};

const TextKeyboardEvent = {
  ENTER: "ENTER",
  BACKSPACE: "BACKSPACE",
  KEYSTROKE: "KEYSTROKE",
} as const;

export type TextKeyboardEventType = keyof typeof TextKeyboardEvent;
