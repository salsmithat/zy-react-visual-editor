import { createVisualConfig } from "./ReactVisualEditor.utils";
import { Button, Input, Select } from "antd";
import {
  createColorProp,
  createSelectProp,
  createTableProps,
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
visualConfig.registryComponent("select", {
  name: "下拉框",
  preview: () => (
    <Select value={"1"} options={[{ label: "请选择", value: "1" }]} />
  ),
  resize: { width: true },
  render: ({ props, size }) => (
    <Select style={{ width: size.width || "187px" }}>
      {(props.options || []).map((item: any, index: number) => {
        return (
          <Select.Option value={item.field} key={index}>
            {item.name}
          </Select.Option>
        );
      })}
      <Select.Option value="jack">Jack</Select.Option>
      <Select.Option value="lucy">Lucy</Select.Option>
      <Select.Option value="disabled" disabled>
        Disabled
      </Select.Option>
    </Select>
  ),
  props: {
    options: createTableProps("下拉选项", "label", [
      { name: "选项显示值", field: "label" },
      { name: "选项值", field: "val" },
      { name: "备注", field: "comments" },
    ]),
  },
});
