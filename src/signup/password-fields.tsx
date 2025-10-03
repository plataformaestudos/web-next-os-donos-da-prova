import { Form, Input, FormInstance } from "antd";
import { PersonalInfo } from "./personal-info.component";

const passwordRules = [
    { label: "Letra maiúscula", regex: /[A-Z]/ },
    { label: "Número", regex: /\d/ },
    { label: "Caractere especial", regex: /[!@#$%^&*(),.?\":{}|<>]/ },
    { label: "8 Caracteres", regex: /.{8,}/ },
];

export function PasswordField({ form }: { form: FormInstance<PersonalInfo> }) {
    const password = Form.useWatch("password", form) || "";

    const checkRules = passwordRules.map((rule) => ({
        ...rule,
        valid: rule.regex.test(password),
    }));

    return (
        <>
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
                                ? Promise.reject()
                                : Promise.resolve();
                        },
                    },
                ]}
            >
                <Input.Password />
            </Form.Item>

            <div
                style={{
                    marginTop: 8,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 12, // espaçamento entre os itens
                }}
            >
                {checkRules.map((rule) => (
                    <div
                        key={rule.label}
                        style={{
                            
                            fontSize: 12,
                            display: "flex",
                            alignItems: "center",

                        }}
                    >
                        {rule.valid ? "✅" : "❌"} {rule.label}
                    </div>
                ))}
            </div>

        </>
    );
}
