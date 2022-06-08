export enum VisualEditorPropsType {
  text = "text",
  select = "select",
  color = "color",
  table = "table",
}

export type ReactVisualEditorProps =
  | ReactVisualEditorTextProps
  | ReactVisualEditorSelectProps
  | ReactVisualEditorColorProps
  | ReactVisualEditorTableProps;

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

// ========== table ==========
export interface ReactVisualEditorTableProps {
  name: string;
  showField: string;
  type: VisualEditorPropsType.table;
  columns: { name: string; field: string }[];
}

export function createTableProps(
  name: string,
  showField: string,
  columns: { name: string; field: string }[]
): ReactVisualEditorTableProps {
  return {
    name,
    showField,
    type: VisualEditorPropsType.table,
    columns,
  };
}
