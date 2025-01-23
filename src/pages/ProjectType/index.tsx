import { ActionType, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Form, Input, Modal, Select, message } from 'antd';
import React, { useRef, useState } from 'react';

// 在文件开头添加基础 URL 和 token 配置
const BASE_URL = 'http://localhost:8088';
const TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjE3Mzc2MzIzNTZ9.72dLbKF3impiJJCEG2YZTBg-3NysgV6wAHh3swZ_SLg';

// 创建通用的请求头
const headers = {
  'Content-Type': 'application/json',
  token: TOKEN,
};

// 定义项目类型的数据结构
type ProjectTypeItem = {
  ptId: number;
  ptName: string;
  ptState: string;
};

// 模拟数据
const initialData: ProjectTypeItem[] = [
  { ptId: 1, ptName: '类型1', ptState: '启用' },
  { ptId: 2, ptName: '类型2', ptState: '禁用' },
];

const ProjectType: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingRecord, setEditingRecord] = useState<ProjectTypeItem | null>(null);
  const actionRef = useRef<ActionType>();
  const [dataSource, setDataSource] = useState<ProjectTypeItem[]>(initialData);

  // 将函数定义移到使用之前
  const handleAdd = async (fields: ProjectTypeItem) => {
    try {
      const response = await fetch(`${BASE_URL}/project/type/add`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          ptName: fields.ptName,
          ptState: fields.ptState,
        }),
      });
      const result = await response.json();
      if (result.code === 200) {
        message.success('添加成功');
        actionRef.current?.reload();
        return true;
      }
      message.error(result.msg || '添加失败');
      return false;
    } catch (error) {
      message.error('添加失败');
      return false;
    }
  };

  const handleEdit = async (fields: ProjectTypeItem) => {
    try {
      const response = await fetch(`${BASE_URL}/project/type/edit`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          ptId: fields.ptId,
          ptName: fields.ptName,
          ptState: fields.ptState,
        }),
      });
      const result = await response.json();
      if (result.code === 200) {
        message.success('修改成功');
        actionRef.current?.reload();
        return true;
      }
      message.error(result.msg || '修改失败');
      return false;
    } catch (error) {
      message.error('修改失败');
      return false;
    }
  };

  const handleDelete = async (ptId: number) => {
    try {
      const response = await fetch(`${BASE_URL}/project/type/delete?ptId=${ptId}`, {
        method: 'DELETE',
        headers: headers,
      });
      const result = await response.json();
      if (result.code === 200) {
        message.success('删除成功');
        setDataSource(dataSource.filter((item) => item.ptId !== ptId));
        actionRef.current?.reload();
        return true;
      }
      message.error(result.msg || '删除失败');
      return false;
    } catch (error) {
      message.error('删除失败');
      return false;
    }
  };

  // 表格列定义
  const columns: ProColumns<ProjectTypeItem>[] = [
    {
      title: '类型ID',
      dataIndex: 'ptId',
      width: 80,
    },
    {
      title: '类型名称',
      dataIndex: 'ptName',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'ptState',
      width: 100,
      valueEnum: {
        启用: { text: '启用', status: 'Success' },
        禁用: { text: '禁用', status: 'Error' },
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
        <Button key="delete" type="link" danger onClick={() => handleDelete(record.ptId)}>
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
            item.ptId === editingRecord.ptId ? { ...item, ...values } : item,
          ),
        );
        await handleEdit(values);
      } else {
        // 添加
        const newItem = {
          ...values,
          ptId: Math.max(...dataSource.map((item) => item.ptId)) + 1,
        };
        setDataSource([...dataSource, newItem]);
        await handleAdd(newItem);
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
        rowKey="ptId"
        search={false}
        request={async (params) => {
          try {
            const response = await fetch(`${BASE_URL}/project/type/get`, {
              method: 'POST',
              headers: headers,
              body: JSON.stringify({
                page: params.current ? params.current - 1 : 0,
                size: params.pageSize || 10,
              }),
            });
            const result = await response.json();

            // 根据实际返回的数据格式进行处理
            return {
              data: result.data?.jfProjectTypes || [], // 使用 jfProjectTypes 作为数据源
              success: result.code === 200,
              total: result.data?.total || 0,
              pageSize: params.pageSize,
              current: params.current,
            };
          } catch (error) {
            message.error('获取数据失败');
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        pagination={{
          pageSize: 10,
          showQuickJumper: true,
          showSizeChanger: true,
        }}
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
          {editingRecord && (
            <Form.Item name="ptId" hidden>
              <Input />
            </Form.Item>
          )}
          <Form.Item
            name="ptName"
            label="类型名称"
            rules={[{ required: true, message: '请输入类型名称' }]}
          >
            <Input placeholder="请输入类型名称" />
          </Form.Item>
          <Form.Item
            name="ptState"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Select.Option value="启用">启用</Select.Option>
              <Select.Option value="禁用">禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default ProjectType;
