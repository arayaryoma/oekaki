import { v4 as uuid } from "uuid";
import "./styles/main.css";
// const socket = new WebSocket("ws://localhost:3000");
const socket = new WebSocket("wss://playground.araya.dev/oekaki/server");
const $$ = document.querySelectorAll.bind(document);
const $ = document.querySelector.bind(document);
const userId = uuid();
socket.onopen = (event) => {
  console.log("connected to the websocket server");
};
type MessageData = {
  event: string;
};

type DrawEvent = {
  type: "draw";
  event: "started" | "moved" | "finished";
  point: {
    x: number;
    y: number;
  };
  userId: string;
};
type ClearEvent = {
  type: "clear";
};

const sendDrawEvent = (event: DrawEvent) => {
  socket.send(JSON.stringify(event));
};

const sendClearEvent = () => {
  const event: ClearEvent = {
    type: "clear",
  };
  socket.send(JSON.stringify(event));
};

document.addEventListener("DOMContentLoaded", () => {
  const canvas = $("#canvas") as HTMLCanvasElement;
  const canvasManager = new CanvasManager(canvas);
  canvasManager.activate();
  canvasManager;
});

class CanvasManager {
  private isDrawing = false;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private ctxs: { [userId: string]: CanvasRenderingContext2D };
  private canvasRect: DOMRect;
  private mousePoint = { x: 0, y: 0 };
  //   private buttonEl: HTMLButtonElement;

  constructor(canvasEl: HTMLCanvasElement) {
    this.canvas = canvasEl;
    this.ctx = this.canvas.getContext("2d")!;
    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = 4;
    this.ctxs = { [userId]: this.ctx };
    this.canvasRect = this.canvas.getBoundingClientRect();
  }

  activate() {
    this.canvas.addEventListener("mousedown", (ev) => {
      this.setMousePoint(ev);
      this.isDrawing = true;
      this.ctx.beginPath();
      this.ctx.moveTo(this.mousePoint.x, this.mousePoint.y);
      const data = {
        type: "draw",
        event: "started",
        point: {
          x: this.mousePoint.x,
          y: this.mousePoint.y,
        },
        userId,
      } as const;
      sendDrawEvent(data);
    });
    this.canvas.addEventListener("mousemove", (ev) => {
      if (this.isDrawing) {
        this.setMousePoint(ev);
        this.ctx.lineTo(this.mousePoint.x, this.mousePoint.y);
        this.ctx.stroke();
        const data = {
          type: "draw",
          event: "moved",
          point: {
            x: this.mousePoint.x,
            y: this.mousePoint.y,
          },
          userId,
        } as const;
        sendDrawEvent(data);
      }
    });
    this.canvas.addEventListener("mouseup", (ev) => {
      this.setMousePoint(ev);
      this.isDrawing = false;
      const data = {
        type: "draw",
        event: "finished",
        point: {
          x: this.mousePoint.x,
          y: this.mousePoint.y,
        },
        userId,
      } as const;
      sendDrawEvent(data);
    });
    this.canvas.addEventListener("mouseleave", (ev) => {
      this.isDrawing = false;
      const data = {
        type: "draw",
        event: "finished",
        point: {
          x: this.mousePoint.x,
          y: this.mousePoint.y,
        },
        userId,
      } as const;
      sendDrawEvent(data);
    });

    socket.onmessage = (ev) => {
      try {
        const json: DrawEvent | ClearEvent = JSON.parse(ev.data);
        if (json.type === "draw" && json.userId !== userId) {
          const { x, y } = json.point;
          switch (json.event) {
            case "started": {
              const ctx = this.canvas.getContext("2d");
              Object.assign(this.ctxs, { [json.userId]: ctx });
              ctx?.beginPath();
              ctx?.moveTo(x, y);
              return;
            }
            case "moved": {
              const ctx = this.ctxs[json.userId];
              ctx?.lineTo(x, y);
              ctx?.stroke();
              return;
            }
            case "finished": {
              const ctx = this.ctxs[json.userId];
              ctx?.lineTo(x, y);
              ctx?.stroke();
              ctx?.closePath();
              return;
            }
          }
        } else if (json.type === "clear") {
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
      } catch (e) {
        console.error(e);
      }
    };
    const clear = $("button#clear");
    clear?.addEventListener("click", (ev) => {
      sendClearEvent();
    });
  }
  private setMousePoint(ev: MouseEvent) {
    this.mousePoint = {
      x: ev.clientX - this.canvasRect.left,
      y: ev.clientY - this.canvasRect.top,
    };
  }
}
