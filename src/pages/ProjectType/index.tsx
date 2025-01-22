import { PlusOutlined } from '@ant-design/icons';
import { ActionType, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Form, Input, Modal, Select, message } from 'antd';
import React, { useRef, useState } from 'react';

// 定义项目类型的数据结构
type ProjectTypeItem = {
  PtId: number;
  PtName: string;
  PtState: number;
};

// 模拟数据
const initialData: ProjectTypeItem[] = [
  { PtId: 1, PtName: '类型1', PtState: 1 },
  { PtId: 2, PtName: '类型2', PtState: 0 },
];

const ProjectType: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingRecord, setEditingRecord] = useState<ProjectTypeItem | null>(null);
  const actionRef = useRef<ActionType>();
  const [dataSource, setDataSource] = useState<ProjectTypeItem[]>(initialData);

  // 处理删除
  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      onOk: () => {
        setDataSource(dataSource.filter((item) => item.PtId !== id));
        message.success('删除成功');
        actionRef.current?.reload();
      },
    });
  };

  // 表格列定义
  const columns: ProColumns<ProjectTypeItem>[] = [
    {
      title: '类型ID',
      dataIndex: 'PtId',
      width: 80,
    },
    {
      title: '类型名称',
      dataIndex: 'PtName',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'PtState',
      width: 100,
      valueEnum: {
        0: { text: '禁用', status: 'Error' },
        1: { text: '启用', status: 'Success' },
      },
    },
    {
      title: '操作',
      width: 180,
      key: 'option',
      valueType: 'option',
      render: (_, record) => [
        <Button
          key="edit"
          type="link"
          onClick={() => {
            setEditingRecord(record);
            form.setFieldsValue(record);
            setModalVisible(true);
          }}
        >
          修改
        </Button>,
        <Button key="delete" type="link" danger onClick={() => handleDelete(record.PtId)}>
          删除
        </Button>,
      ],
    },
  ];

  // 处理添加/修改
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingRecord) {
        // 修改
        setDataSource(
          dataSource.map((item) =>
            item.PtId === editingRecord.PtId ? { ...item, ...values } : item,
          ),
        );
        message.success('修改成功');
      } else {
        // 添加
        const newItem = {
          ...values,
          PtId: Math.max(...dataSource.map((item) => item.PtId)) + 1,
        };
        setDataSource([...dataSource, newItem]);
        message.success('添加成功');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingRecord(null);
      actionRef.current?.reload();
    } catch (error) {
      message.error('操作失败');
    }
  };

  return (
    <PageContainer>
      <ProTable<ProjectTypeItem>
        headerTitle="项目类型列表"
        actionRef={actionRef}
        rowKey="PtId"
        search={false}
        toolBarRender={() => [
          <Button
            type="primary"
            key="add"
            onClick={() => {
              setEditingRecord(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            <PlusOutlined /> 新建
          </Button>,
        ]}
        dataSource={dataSource}
        columns={columns}
      />

      <Modal
        title={editingRecord ? '修改项目类型' : '新建项目类型'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingRecord(null);
        }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={editingRecord || {}}>
          <Form.Item
            name="PtName"
            label="类型名称"
            rules={[{ required: true, message: '请输入类型名称' }]}
          >
            <Input placeholder="请输入类型名称" />
          </Form.Item>
          <Form.Item
            name="PtState"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Select.Option value={1}>启用</Select.Option>
              <Select.Option value={0}>禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default ProjectType;
