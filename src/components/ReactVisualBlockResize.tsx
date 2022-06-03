import { ReactVisualEditorComponent } from "../utils/ReactVisualEditor.utils";

export const ReactVisualBlockResize: React.FC<{
  component: ReactVisualEditorComponent;
}> = (props) => {
  const render: JSX.Element[] = [];
  if (props.component.resize?.height) {
    render.push(
      <div
        className="react-visual-block-resize react-visual-block-resize-top"
        key="top"
      ></div>
    );
    render.push(
      <div
        className="react-visual-block-resize react-visual-block-resize-bottom"
        key="bottom"
      ></div>
    );
  }
  if (props.component.resize?.width) {
    render.push(
      <div
        className="react-visual-block-resize react-visual-block-resize-left"
        key="left"
      ></div>
    );
    render.push(
      <div
        className="react-visual-block-resize react-visual-block-resize-right"
        key="right"
      ></div>
    );
  }
  if (props.component.resize?.width && props.component.resize?.height) {
    render.push(
      <div
        className="react-visual-block-resize react-visual-block-resize-top-left"
        key="top-left"
      ></div>
    );
    render.push(
      <div
        className="react-visual-block-resize react-visual-block-resize-top-right"
        key="top-right"
      ></div>
    );
    render.push(
      <div
        className="react-visual-block-resize react-visual-block-resize-bottom-left"
        key="bottom-left"
      ></div>
    );
    render.push(
      <div
        className="react-visual-block-resize react-visual-block-resize-bottom-right"
        key="bottom-right"
      ></div>
    );
  }
  return <>{render}</>;
};
