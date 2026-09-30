import { Create, useForm } from "@refinedev/antd";
import { Form, Input, DatePicker } from "antd";

export const PatientCreate = () => {
  const { formProps, saveButtonProps } = useForm();

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        layout="vertical"
        onFinish={(values) => {
          const v = values as Record<string, any>;
          formProps.onFinish?.({
            ...v,
            birthdate: v.birthdate ? v.birthdate.format("YYYY-MM-DD") : null,
          });
        }}
      >
        <Form.Item
          label="Full name"
          name="full_name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Birthdate" name="birthdate">
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Phone" name="phone">
          <Input />
        </Form.Item>
        <Form.Item label="Notes" name="notes">
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Create>
  );
};
