import { CheckCircleFilled, MinusCircleOutlined } from "@ant-design/icons";
import { Form, Input, FormInstance } from "antd";
import type { PersonalInfo } from "./personal-info.component";
import { PasswordPanel, PasswordRequirement, VisuallyHidden } from "./personal-info.style";

const passwordRules = [
    { label: "Letra maiúscula", regex: /[A-Z]/ },
    { label: "Número", regex: /\d/ },
    { label: "Caractere especial", regex: /[!@#$%^&*(),.?\":{}|<>]/ },
    { label: "Pelo menos 8 caracteres", regex: /.{8,}/ },
];

export function PasswordField({ requirementsId }: {
    form: FormInstance<PersonalInfo>;
    requirementsId?: string;
}) {
    return (
        <Form.Item
            label="Senha"
            name="password"
            rules={[
                { required: true, message: "Por favor preencha a senha" },
                {
                    validator: (_, value) => {
                        if (!value) return Promise.resolve();

                        const invalidRule = passwordRules.find((rule) => !rule.regex.test(value));
                        return invalidRule
                            ? Promise.reject(new Error("A senha deve atender a todos os requisitos abaixo"))
                            : Promise.resolve();
                    },
                },
            ]}
        >
            <Input.Password
                placeholder="Crie sua senha"
                autoComplete="new-password"
                aria-describedby={requirementsId}
                aria-details={requirementsId}
            />
        </Form.Item>
    );
}

export function PasswordRequirements({ form, id }: {
    form: FormInstance<PersonalInfo>;
    id: string;
}) {
    const password = Form.useWatch("password", form) || "";
    const checkRules = passwordRules.map((rule) => ({
        ...rule,
        valid: rule.regex.test(password),
    }));
    const validCount = checkRules.filter((rule) => rule.valid).length;

    return (
        <PasswordPanel id={id} role="region" aria-labelledby={`${id}-title`}>
            <h3 id={`${id}-title`}>Requisitos de segurança da senha</h3>
            <ul>
                {checkRules.map((rule) => (
                    <PasswordRequirement key={rule.label} $valid={rule.valid}>
                        {rule.valid
                            ? <CheckCircleFilled aria-hidden="true" />
                            : <MinusCircleOutlined aria-hidden="true" />}
                        <span>
                            <VisuallyHidden>{rule.valid ? "Atendido: " : "Pendente: "}</VisuallyHidden>
                            {rule.label}
                        </span>
                    </PasswordRequirement>
                ))}
            </ul>
            <VisuallyHidden role="status" aria-live="polite" aria-atomic="true">
                {validCount} de {passwordRules.length} requisitos de senha atendidos.
            </VisuallyHidden>
        </PasswordPanel>
    );
}
