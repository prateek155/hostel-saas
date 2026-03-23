import React, { useState } from 'react';
import { Form, Input, Select, Button, message } from 'antd';
import axios from 'axios';

const { TextArea } = Input;
const { Option } = Select;

const FeedbackForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const { data } = await axios.post("https://ulcclub1.onrender.com/api/feedback/create", values);
      if (data.success) {
        message.success('Feedback submitted successfully');
        form.resetFields();
      }
    } catch (error) {
      console.error(error);
      message.error('Error submitting feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
    >
      <Form.Item
        name="subject"
        label="Subject"
        rules={[{ required: true, message: 'Please enter the subject' }]}
      >
        <Input placeholder="Enter feedback subject" />
      </Form.Item>

      <Form.Item
        name="message"
        label="Message"
        rules={[{ required: true, message: 'Please enter your message' }]}
      >
        <TextArea
          rows={4}
          placeholder="Enter your feedback message"
        />
      </Form.Item>

      <Form.Item
        name="priority"
        label="Priority"
        initialValue="medium"
      >
        <Select>
          <Option value="low">Low</Option>
          <Option value="medium">Medium</Option>
          <Option value="high">High</Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Submit Feedback
        </Button>
      </Form.Item>
    </Form>
  );
};

export default FeedbackForm;
