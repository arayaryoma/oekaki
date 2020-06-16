import { v4 as uuid } from "uuid";
import "./styles/main.css";
const socket = new WebSocket("ws://localhost:3000");
const $$ = document.querySelectorAll.bind(document);
const $ = document.querySelector.bind(document);
const userId = uuid();
socket.onopen = (event) => {
  console.log("connected to the websocket server");
  socket.send("hello!!!");
};
type MessageData = {
  event: string;
};

interface DrawedMessageData extends MessageData {
  event: "drawed";
  data: {
    x: number;
    y: number;
  };
}

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
  private canvasRect: DOMRect;
  private mousePoint = { x: 0, y: 0 };
  //   private buttonEl: HTMLButtonElement;

  constructor(canvasEl: HTMLCanvasElement) {
    this.canvas = canvasEl;
    this.ctx = this.canvas.getContext("2d")!;
    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = 4;
    this.canvasRect = this.canvas.getBoundingClientRect();
  }

  activate() {
    this.canvas.addEventListener("mousedown", (ev) => {
      this.setMousePoint(ev);
      this.isDrawing = true;
      this.ctx.beginPath();
      this.ctx.moveTo(this.mousePoint.x, this.mousePoint.y);
    });
    this.canvas.addEventListener("mousemove", (ev) => {
      if (this.isDrawing) {
        this.setMousePoint(ev);
        this.ctx.lineTo(this.mousePoint.x, this.mousePoint.y);
        this.ctx.stroke();
        const data = {
          event: "drawed",
          point: {
            x: this.mousePoint.x,
            y: this.mousePoint.y,
          },
          userId,
        };
        socket.send(JSON.stringify(data));
      }
    });
    this.canvas.addEventListener("mouseup", (ev) => {
      this.setMousePoint(ev);
      this.isDrawing = false;
    });
    this.canvas.addEventListener("mouseleave", (ev) => {
      this.isDrawing = false;
    });

    socket.onmessage = (ev) => {
      try {
          const json = JSON.parse(ev.data);
          if(json.event==='drawed' && json.userId !== userId) {
              const {x, y} = json.point;
               const ctx = this.canvas.getContext('2d');
               ctx?.beginPath();
               ctx?.moveTo(0, 0);
               ctx?.lineTo(x, y);
               ctx?.stroke();
               ctx?.closePath();
          }
      } catch (e) {
        console.error(e);
      }
    };
    // this.buttonEl.addEventListener("click", (ev) => {
    //   this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // });
  }
  private setMousePoint(ev: MouseEvent) {
    this.mousePoint = {
      x: ev.clientX - this.canvasRect.left,
      y: ev.clientY - this.canvasRect.top,
    };
  }
}
