import React, { useState } from "react";
import { ReactVisualEditor } from "./components/ReactVisualEditor";
import { visualConfig } from "./utils/visualConfig";
import { ReactVisualEditorValue } from "./utils/ReactVisualEditor.utils";

function App() {
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
          focus: false,
          zIndex: 0,
          width: 56,
          height: 22,
        },
        {
          componentKey: "button",
          top: 200,
          left: 200,
          adjustPosition: false,
          focus: false,
          zIndex: 0,
          width: 88,
          height: 32,
        },
        {
          componentKey: "input",
          top: 300,
          left: 300,
          adjustPosition: false,
          focus: false,
          zIndex: 0,
          width: 187,
          height: 32,
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
