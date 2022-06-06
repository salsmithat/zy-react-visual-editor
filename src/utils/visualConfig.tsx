import { createVisualConfig } from "./ReactVisualEditor.utils";
import { Button, Input } from "antd";
import {
  createColorProp,
  createSelectProp,
  createTextProp,
} from "../components/ReactVisualBlockProps";

export const visualConfig = createVisualConfig();
visualConfig.registryComponent("text", {
  name: "文本",
  preview: () => <span>预览文本</span>,
  render: (props) => (
    <span style={{ color: props.props.color, fontSize: props.props.size }}>
      {props.props.text || "渲染文本"}
    </span>
  ),
  props: {
    text: createTextProp("显示文本"),
    color: createColorProp("字体颜色"),
    size: createSelectProp("字体大小", [
      { label: "14px", value: "14px" },
      { label: "18px", value: "18px" },
      { label: "24px", value: "24px" },
    ]),
  },
});
visualConfig.registryComponent("button", {
  name: "按钮",
  preview: () => <Button type="primary">预览按钮</Button>,
  render: ({ size, props }) => (
    <Button type={props.type || "primary"} size={props.size} style={size}>
      {props.label || "渲染按钮"}
    </Button>
  ),
  resize: {
    width: true,
    height: true,
  },
  props: {
    label: createTextProp("按钮文本"),
    type: createSelectProp("按钮类型", [
      { label: "默认", value: "default" },
      { label: "基础", value: "primary" },
      { label: "线框", value: "ghost" },
      { label: "虚线", value: "dashed" },
      { label: "链接", value: "link" },
      { label: "文本", value: "text" },
    ]),
    size: createSelectProp("按钮大小", [
      { label: "大", value: "large" },
      { label: "中", value: "middle" },
      { label: "小", value: "small" },
    ]),
  },
});
visualConfig.registryComponent("input", {
  name: "输入框",
  preview: () => <Input />,
  render: ({ size }) => <Input style={size} />,
  resize: {
    width: true,
  },
  props: {},
});
