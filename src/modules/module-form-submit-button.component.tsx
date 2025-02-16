"use client";

import { Button } from "antd";
import { MODULE_FORM_ID } from "./module-form.constant";
import { useUpdateModule } from "./update/update-module.context";

export function ModuleFormSubmitButton() {
  const { isPending } = useUpdateModule();

  return (
    <Button
      type="primary"
      size="large"
      form={MODULE_FORM_ID}
      htmlType="submit"
      disabled={isPending}
      loading={isPending}
    >
      Salvar
    </Button>
  );
}
