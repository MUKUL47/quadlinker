import { Shape } from "../shapes/base/shape";
import { Vector2 } from "../shapes/base/vector2";
import { Polygon } from "../shapes/basic/polygon";
import { CursorStyle, _null } from "../core/types/type";

export const Events = {
  ON_DBCLICK: "ON_DBCLICK",
  CLICK: "CLICK",
  KEY_DOWN: "KEY_DOWN",
  ACTION_BUTTON_RECT: "ACTION_BUTTON_RECT",
  ON_MOUSE_POSITION: "ON_MOUSE_POSITION",
  UPDATE_QUAD_VEC2: "UPDATE_QUAD_VEC2",
  UPDATE_ACTIVE_QUAD_VEC2: "UPDATE_ACTIVE_QUAD_VEC2",
  SELECT_QUAD: "SELECT_QUAD",
  ON_HOVER: "ON_HOVER",
  NEW_QUAD: "NEW_QUAD",
  DESELECT_QUAD: "DESELECT_QUAD",
  ACTIVE_QUAD: "ACTIVE_QUAD",
  GENERATE_NEW_LINK: "GENERATE_NEW_LINK",
  MULTI_SELECT: "MULTI_SELECT",
  MOUSE_DOWN_PIXEL_DATA: "MOUSE_DOWN_PIXEL_DATA",
  GET_QUAD_BY_VEC2: "GET_QUAD_BY_VEC2",
  ON_MOUSE_UP: "ON_MOUSE_UP",
  //prio
  PriorityLinker_DECIDE_POLY: "PriorityLinker_DECIDE_POLY",
  //prio
  GENERATE_NEW_ID: "GENERATE_NEW_ID",
  UPDATE_CANVAS_POINTER: "UPDATE_CANVAS_POINTER",
  GET_QUAD_BY_ID: "GET_QUAD_BY_ID",
  SHAPE_ON_HOVER: "SHAPE_ON_HOVER",
  PUSH_TO_LAYER: "PUSH_TO_LAYER",
  ON_LAYER_RENDER: "ON_LAYER_RENDER",
} as const;
export type EventArgsMap = {
  ON_DBCLICK: MouseEvent;
  CLICK: Event;
  DESELECT_QUAD: true;
  KEY_DOWN: KeyboardEvent;
  UPDATE_QUAD_VEC2: [Vector2, Set<Number>, Vector2];
  UPDATE_ACTIVE_QUAD_VEC2: [Vector2, number];
  SELECT_QUAD: [
    Vector2,
    (quad: _null<Shape>, cb: (allow: boolean) => any) => any
  ];
  NEW_QUAD: true;
  ON_HOVER: Vector2;
  ACTIVE_QUAD: _null<Polygon>;
  GENERATE_NEW_LINK: [
    Vector2,
    Shape,
    (p: Shape, eventId: string) => void,
    string
  ];
  ON_MOUSE_POSITION: Vector2;
  ACTION_BUTTON_RECT: boolean;
  MULTI_SELECT: [Vector2, Vector2];
  MOUSE_DOWN_PIXEL_DATA: [
    [number, number, number, number],
    cb: (allow: boolean) => any,
    Vector2
  ];
  GET_QUAD_BY_VEC2: [Vector2, offset: number, (q: _null<Shape>) => void];
  ON_MOUSE_UP: Vector2;
  //
  PriorityLinker_DECIDE_POLY: [Array<Shape>, (cb: _null<Shape>) => void];
  GENERATE_NEW_ID: (id: number) => void;
  UPDATE_CANVAS_POINTER: CursorStyle;
  GET_QUAD_BY_ID: [number, (q: _null<Shape>) => any];
  SHAPE_ON_HOVER: [Array<_null<Shape>>, Array<Shape>];
  PUSH_TO_LAYER: [number, number];
  ON_LAYER_RENDER: number;
  //
};
type InvokeType<T extends keyof EventArgsMap> = EventArgsMap[T];
type EventCb<T extends keyof EventArgsMap> = (t: InvokeType<T>) => any;
type InterceptorCb<T extends keyof EventArgsMap> = (t: InvokeType<T>) => void;
type EventMiddlewareCb<T extends keyof typeof Events> = (
  e: T,
  t: InvokeType<T>
) => boolean;
export const FinalEvents: (keyof EventArgsMap)[] = Object.keys(
  Events
) as (keyof EventArgsMap)[];
export class EventDataListener {
  private events: Map<
    string,
    Array<[Array<EventMiddlewareCb<any>>, EventCb<any>]>
  >;
  private interceptors: Map<keyof EventArgsMap, Array<InterceptorCb<any>>>;

  constructor() {
    this.events = new Map();
    this.interceptors = new Map();
  }

  private checkEventType(eventName: string) {
    if (!Events.hasOwnProperty(eventName)) {
      throw new Error(`Event "${eventName}" is not defined in Events.`);
    }
    if (!this.events.has(eventName)) {
      throw new Error(`Event "${eventName}" has not been created yet.`);
    }
  }

  public create<T extends keyof EventArgsMap>(eventName: T) {
    if (!Events.hasOwnProperty(eventName) || this.events.has(eventName)) return;
    this.events.set(eventName, []);
  }

  public register<T extends keyof EventArgsMap>(eventName: T, cb: EventCb<T>) {
    this.checkEventType(eventName);
    const existingcbs = this.events.get(eventName) || [];
    existingcbs.push([[], cb]);
    this.events.set(eventName, existingcbs);
  }

  public registerWithMiddlewares<T extends keyof EventArgsMap>(
    eventName: T,
    middlewares: EventMiddlewareCb<T>[],
    cb: EventCb<T>
  ) {
    this.checkEventType(eventName);
    const existingcbs = this.events.get(eventName) || [];
    existingcbs.push([middlewares, cb]);
    this.events.set(eventName, existingcbs);
  }

  public deregister<T extends keyof EventArgsMap>(
    eventName: T,
    cb: EventCb<T>
  ) {
    const existingcbs = this.events.get(eventName) || [];
    this.events.set(
      eventName,
      existingcbs.filter(([_, v]) => v != cb)
    );
  }

  invoke<T extends keyof EventArgsMap>(eventName: T, v: InvokeType<T>) {
    this.events.get(eventName)?.forEach(([m, cb]) => {
      for (const c of m) {
        if (!c?.(eventName, v)) {
          return;
        }
      }
      (this.interceptors.get(eventName) ?? []).forEach((cb) => cb?.(v));
      cb?.(v);
    });
  }

  intecept<T extends keyof EventArgsMap>(
    eventName: T,
    v: InterceptorCb<T>
  ): void {
    this.interceptors.set(eventName, [
      ...(this.interceptors.get(eventName) ?? []),
      v,
    ]);
  }
}
