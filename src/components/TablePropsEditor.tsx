import { Button, Input, Modal, Table, Tag } from "antd";
import { ReactVisualEditorTableProps } from "./ReactVisualBlockProps";
import "./TablePropsEditor.css";
import ReactDOM from "react-dom";
import { defer } from "../utils/defer";
import React, { useState } from "react";
import deepcopy from "deepcopy";

const nextKey = (() => {
  let start = Date.now();
  return () => start++;
})();
export const TablePropsEditor: React.FC<{
  value?: any[];
  config: ReactVisualEditorTableProps;
  onChange?: (val?: any[]) => void;
}> = (props) => {
  const methods = {
    openEditor: async () => {
      const newVal = await TablePropsEditorService({
        config: props.config,
        value: props.value,
      });
      props.onChange?.(newVal);
    },
  };
  let render: any;
  if (!props.value || props.value.length === 0) {
    render = <Button onClick={methods.openEditor}>编辑</Button>;
  } else {
    render = props.value.map((item, index) => {
      return (
        <Tag onClick={methods.openEditor} key={index}>
          {item[props.config.showField]}
        </Tag>
      );
    });
  }
  return <div className="table-prop-editor">{render}</div>;
};
const TablePropsEditorModal: React.FC<{
  option: TablePropsEditorServiceOption;
  onRef: (tableIns: {
    show: (opt: TablePropsEditorServiceOption) => void;
  }) => void;
}> = (props) => {
  const [option, setOption] = useState(props.option);
  const [showFlag, setShowFlag] = useState(false);
  const [editData, $setEditData] = useState([] as any[]);
  const setEditData = (val: any[]) => {
    $setEditData(
      val.map((d) => {
        !d.key && (d.key = nextKey());
        return d;
      })
    );
  };
  const methods = {
    show: (opt: TablePropsEditorServiceOption) => {
      setOption(opt);
      setEditData(deepcopy(opt.value || []));
      setShowFlag(true);
    },
    close: () => {
      setShowFlag(false);
    },
    save: () => {
      option.onConfirm && option.onConfirm(editData);
      methods.close();
    },
    add: () => {
      setEditData([{}, ...editData]);
    },
    reset: () => {
      setEditData(option.value || []);
    },
  };
  props.onRef(methods);
  return (
    <Modal
      footer={
        <>
          <Button onClick={methods.close}>取消</Button>
          <Button onClick={methods.save} type="primary">
            确定
          </Button>
        </>
      }
      visible={showFlag}
      width={800}
    >
      <div className="table-prop-editor-dialog-buttons">
        <Button type="primary" style={{ marginRight: 8 }} onClick={methods.add}>
          添加
        </Button>
        <Button onClick={methods.reset}>重置</Button>
      </div>
      <div className="table-prop-editor-dialog-table">
        <Table dataSource={editData}>
          <Table.Column
            dataIndex={""}
            title="#"
            key="index"
            render={(_1, _2, index) => {
              return index + 1;
            }}
          />
          {(option.config.columns || []).map((col, index) => {
            return (
              <Table.Column
                title={col.name}
                dataIndex={col.field}
                key={index}
                render={(_1, row: any, index) => {
                  return (
                    <Input
                      value={row[col.field]}
                      key={"input"}
                      onChange={(e) => {
                        row = { ...row, [col.field]: e.target.value };
                        editData[index] = row;
                        setEditData([...editData]);
                      }}
                    />
                  );
                }}
              />
            );
          })}
          <Table.Column
            title="操作栏"
            key="operation"
            render={(_1, _2, index) => {
              return (
                <Button
                  onClick={() => {
                    editData.splice(index, 1);
                    setEditData(editData);
                  }}
                  type="text"
                >
                  删除
                </Button>
              );
            }}
          />
        </Table>
      </div>
    </Modal>
  );
};
interface TablePropsEditorServiceOption {
  config: ReactVisualEditorTableProps;
  value?: any[];
  onConfirm?: (val?: any[]) => void;
}

let tableIns: any;
export const TablePropsEditorService = (
  option: Omit<TablePropsEditorServiceOption, "onConfirm">
): Promise<undefined | any[]> => {
  const dfd = defer<undefined | any[]>();
  option = {
    ...option,
    onConfirm: dfd.resolve,
  } as TablePropsEditorServiceOption;
  if (!tableIns) {
    const el = document.createElement("div");
    document.body.appendChild(el);
    ReactDOM.render(
      <TablePropsEditorModal option={option} onRef={(i) => (tableIns = i)} />,
      el
    );
  }
  tableIns.show(option);
  return dfd.promise;
};
