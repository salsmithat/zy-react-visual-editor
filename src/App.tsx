import React, { useState, useRef } from "react";
import { useCallbackRef } from "./hooks/useCallbackRef";
import { ReactVisualEditor } from "./components/ReactVisualEditor";
import { visualConfig } from "./utils/visualConfig";
import { ReactVisualEditorValue } from "./utils/ReactVisualEditor.utils";

function App() {
  // const [pos, setPos] = useState({
  //   left: 0,
  //   top: 0,
  // });
  // const posRef = useRef(pos);
  // posRef.current = pos;
  // const dragData = useRef({
  //   startTop: 0,
  //   startLeft: 0,
  //   startX: 0,
  //   startY: 0,
  // });
  // const mousedown = useCallbackRef((e: React.MouseEvent<HTMLDivElement>) => {
  //   document.addEventListener("mousemove", mousemove);
  //   document.addEventListener("mouseup", mouseup);
  //   dragData.current = {
  //     startTop: pos.top,
  //     startLeft: pos.left,
  //     startX: e.clientX,
  //     startY: e.clientY,
  //   };
  // });
  // const mousemove = useCallbackRef((e: MouseEvent) => {
  //   const { startX, startY, startLeft, startTop } = dragData.current;
  //   console.log(JSON.stringify(pos), JSON.stringify(posRef.current));
  //   const durX = e.clientX - startX;
  //   const durY = e.clientY - startY;
  //   setPos({
  //     top: startTop + durY,
  //     left: startLeft + durX,
  //   });
  // });
  // const mouseup = useCallbackRef((e: MouseEvent) => {
  //   document.removeEventListener("mousemove", mousemove);
  //   document.removeEventListener("mouseup", mouseup);
  // });
  const [editorValue, setEditorValue] = useState(() => {
    const val: ReactVisualEditorValue = {
      container: {
        height: 700,
        width: 1000,
      },
      blocks: [
        {
          componentKey: "text",
          top: 100,
          left: 100,
          adjustPosition: false,
        },
        {
          componentKey: "button",
          top: 200,
          left: 200,
          adjustPosition: false,
        },
        {
          componentKey: "input",
          top: 300,
          left: 300,
          adjustPosition: false,
        },
      ],
    };
    return val;
  });
  return (
    <div>
      <ReactVisualEditor
        config={visualConfig}
        value={editorValue}
        onChange={setEditorValue}
      />
      {/* <div
        style={{
          height: "50px",
          width: "50px",
          background: "black",
          position: "relative",
          top: `${pos.top}px`,
          left: `${pos.left}px`,
        }}
        onMouseDown={mousedown}
      ></div> */}
    </div>
  );
}

export default App;
