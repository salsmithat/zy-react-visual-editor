export interface ReactVisualEditorBlock {
  top: number;
  left: number;
  componentKey: string;
  adjustPosition: boolean;
  focus: boolean;
  zIndex: number;
  height: number;
  width: number;
  hasResize?: boolean;
}

export interface ReactVisualEditorValue {
  container: {
    height: number;
    width: number;
  };
  blocks: ReactVisualEditorBlock[];
}
export interface ReactVisualEditorComponent {
  key: string;
  preview: () => JSX.Element;
  render: (data: { size: { height?: string; width?: string } }) => JSX.Element;
  name: string;
  resize?: {
    height?: boolean;
    width?: boolean;
  };
}

export function createVisualConfig() {
  const componentMap: { [key: string]: ReactVisualEditorComponent } = {};
  const componentArray: ReactVisualEditorComponent[] = [];
  /**
   * 注册一个组件
   * @param key
   */
  function registryComponent(
    key: string,
    option: Omit<ReactVisualEditorComponent, "key">
  ) {
    if (componentMap[key]) {
      const index = componentArray.indexOf(componentMap[key]);
      componentArray.splice(index, 1);
    }
    const newComponent = {
      key,
      ...option,
    };
    componentArray.push(newComponent);
    componentMap[key] = newComponent;
  }
  return {
    componentMap,
    componentArray,
    registryComponent,
  };
}
export type ReactVisualEditorConfig = ReturnType<typeof createVisualConfig>;

export function createVisualBlock({
  top,
  left,
  component,
}: {
  top: number;
  left: number;
  component: ReactVisualEditorComponent;
}): ReactVisualEditorBlock {
  return {
    componentKey: component.key,
    top,
    left,
    adjustPosition: true,
    focus: false,
    zIndex: 0,
    width: 0,
    height: 0,
    hasResize: false,
  };
}
