import { GlobalSelect } from "../entities/global-select";
import { Layer } from "../entities/layer";
import { PriorityLinker } from "../entities/priority-linker";
import { LinkQuad } from "../entities/quad-link";
import { quadrants } from "../entities/quadrants";
import { Vector2 } from "../shapes/base/vector2";
import { EventDataListener, Events, FinalEvents } from "./event-listener";
import { Entity } from "../core/types/type";

class QuadLinker {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private eventListener: EventDataListener;
  private keystrokes: Set<string>;
  private mousestrokes: Set<string>;
  private mousePosition: Vector2;
  private deltaTime: number;
  private entities: Entity[] = [];

  constructor(canvasElement: HTMLCanvasElement) {
    this.eventListener = new EventDataListener();
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext("2d", {
      willReadFrequently: true,
    }) as CanvasRenderingContext2D;
    this.keystrokes = new Set();
    this.mousestrokes = new Set();
    this.mousePosition = new Vector2(0, 0);
    this.deltaTime = 0;
    this.entities = [
      new LinkQuad(this.ctx, this.eventListener),
      new Layer(this.ctx, this.eventListener),
      new GlobalSelect(this.ctx, this.eventListener),
      new PriorityLinker(this.ctx, this.eventListener),
      ...quadrants(this.ctx, this.eventListener),
    ];
    this.onKeyboard();
    this.listenActions();
    this.onInit();
    this.loop(0);
  }

  private onInit() {
    FinalEvents.forEach((e) => this.eventListener.create<any>(e));
    this.entities.forEach((e) => e.init());
  }

  private onKeyboard() {
    document.addEventListener("keydown", (e) => {
      this.keystrokes.add(e.key);
      this.eventListener.invoke(Events.KEY_DOWN, e);
    });

    this.canvas.addEventListener("mousedown", () => {
      this.mousestrokes.delete("mouseup");
      this.mousestrokes.add("mousedown");
    });

    this.canvas.addEventListener("mouseup", () => {
      this.mousestrokes.delete("mousedown");
      this.mousestrokes.add("mouseup");
      this.keystrokes.delete("click");
    });

    this.canvas.addEventListener("click", (e) => {
      this.keystrokes.add("click");
      this.eventListener.invoke(Events.CLICK, e);
    });

    this.canvas.addEventListener("dblclick", (e) =>
      this.eventListener.invoke(Events.ON_DBCLICK, e)
    );

    this.canvas.addEventListener("mousemove", (e) => {
      const r = this.canvas.getBoundingClientRect();
      this.mousePosition = new Vector2(e.pageX - r.left, e.clientY - r.top);
      this.eventListener.invoke(Events.ON_MOUSE_POSITION, this.mousePosition);
    });
  }

  private listenActions() {
    document
      .getElementById("chart_options")
      ?.addEventListener("click", (e: Event) => {
        const target = e.target as any;
        if (target.attributes?.["data-action"].value === "square") {
          // this.isQuadSelected = !this.isQuadSelected;
          // this.eventListener.invoke(Events.ACTION_BUTTON_RECT, this.isQuadSelected);
          this.eventListener.invoke(Events.NEW_QUAD, true);
        }
      });
  }

  private loop(e: number) {
    this.eventListener.invoke("UPDATE_CANVAS_POINTER", "auto");
    this.ctx.clearRect(
      0,
      0,
      this.canvas.getBoundingClientRect().width,
      this.canvas.getBoundingClientRect().height
    );
    this.entities.forEach((en) =>
      en.update({
        delta: e,
        keystrokes: this.keystrokes,
        mousestrokes: this.mousestrokes,
      })
    );
    if (this.mousestrokes.has("mouseup")) {
      this.mousestrokes.delete("mouseup");
    }

    if (e - this.deltaTime > 1000) {
      this.keystrokes = new Set();
      this.deltaTime = e;
    }

    requestAnimationFrame((e) => this.loop(e));
  }

  public static init(q: string) {
    const canvas = document.querySelector(q) as HTMLCanvasElement;
    if (canvas) {
      new QuadLinker(canvas);
    }
  }
}

// Set up wheel event listener for zooming
// window.addEventListener('wheel', function (e) {
//   if (e.ctrlKey || e.shiftKey) {
//       onZoom(e);
//       e.preventDefault();
//   }
// }, { passive: false });

// Initialize the QuadLinker
QuadLinker.init("#ctx");
