import { Show, TextField, DateField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography } from "antd";

const { Title } = Typography;

export const PatientShow = () => {
  const { query } = useShow();
  const record = query?.data?.data;

  return (
    <Show isLoading={query?.isLoading}>
      <Title level={5}>Full name</Title>
      <TextField value={record?.full_name} />

      <Title level={5}>Birthdate</Title>
      {record?.birthdate ? (
        <DateField value={record.birthdate} format="MMMM D, YYYY" />
      ) : (
        <TextField value="-" />
      )}

      <Title level={5}>Phone</Title>
      <TextField value={record?.phone || "-"} />

      <Title level={5}>Notes</Title>
      <TextField value={record?.notes || "-"} />

      <Title level={5}>Added</Title>
      <DateField value={record?.created_at} format="MMMM D, YYYY h:mm A" />
    </Show>
  );
};
