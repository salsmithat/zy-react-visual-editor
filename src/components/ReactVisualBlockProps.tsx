export enum VisualEditorPropsType {
  text = "text",
  select = "select",
  color = "color",
}

export type ReactVisualEditorProps =
  | ReactVisualEditorTextProps
  | ReactVisualEditorSelectProps
  | ReactVisualEditorColorProps;

// ========== text ==========

interface ReactVisualEditorTextProps {
  name: string;
  type: VisualEditorPropsType.text;
}

export function createTextProp(name: string): ReactVisualEditorTextProps {
  return {
    name,
    type: VisualEditorPropsType.text,
  };
}

// ========== select ==========

interface ReactVisualEditorSelectProps {
  name: string;
  type: VisualEditorPropsType.select;
  options: {
    label: string;
    value: string;
  }[];
}
export function createSelectProp(
  name: string,
  options: { label: string; value: string }[]
): ReactVisualEditorSelectProps {
  return {
    name,
    type: VisualEditorPropsType.select,
    options,
  };
}

// ========== color ==========

interface ReactVisualEditorColorProps {
  name: string;
  type: VisualEditorPropsType.color;
}

export function createColorProp(name: string): ReactVisualEditorColorProps {
  return {
    name,
    type: VisualEditorPropsType.color,
  };
}
