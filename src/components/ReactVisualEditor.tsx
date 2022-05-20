import {
  ReactVisualEditorConfig,
  ReactVisualEditorValue,
} from "../utils/ReactVisualEditor.utils";
import "./ReactVisualEditor.css";
import React, { useMemo } from "react";

export const ReactVisualEditor: React.FC<{
  value: ReactVisualEditorValue;
  onChange: (val: ReactVisualEditorValue) => void;
  config: ReactVisualEditorConfig;
}> = (props) => {
  console.log(props);
  const containerStyles = useMemo(() => {
    return {
      height: `${props.value.container.height}px`,
      width: `${props.value.container.width}px`,
    };
  }, [props.value.container.height, props.value.container.width]);
  return (
    <div className="react-visual-editor">
      <div className="react-visual-editor-menu">
        {props.config.componentArray.map((component) => {
          return (
            <div className="react-visual-editor-menu-item" key={component.key}>
              {component.preview()}
              <div className="react-visual-editor-menu-item-name">
                {component.name}
              </div>
            </div>
          );
        })}
      </div>
      <div className="react-visual-editor-head">head</div>
      <div className="react-visual-editor-operator">operator</div>
      <div className="react-visual-editor-body">
        <div
          className="react-visual-editor-container"
          style={containerStyles}
        ></div>
      </div>
    </div>
  );
};
