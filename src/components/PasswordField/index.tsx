import { Form, Input, FormInstance } from "antd";

const passwordRules = [
    { label: "Letra maiúscula", regex: /[A-Z]/ },
    { label: "Número", regex: /\d/ },
    { label: "Caractere especial", regex: /[!@#$%^&*(),.?\":{}|<>]/ },
    { label: "8 Caracteres", regex: /.{8,}/ },
];

interface PasswordFieldProps {
    form: FormInstance<Record<string, unknown>>;
    fieldName?: string;
    label?: string;
    placeholder?: string;
    size?: "small" | "middle" | "large";
    showValidationRules?: boolean;
}

export function PasswordField({ 
    form, 
    fieldName = "password", 
    label = "Senha",
    placeholder = "Digite sua senha",
    size = "large",
    showValidationRules = true
}: PasswordFieldProps) {
    const password = Form.useWatch(fieldName, form) as string || "";

    const checkRules = passwordRules.map((rule) => ({
        ...rule,
        valid: rule.regex.test(password),
    }));

    return (
        <>
            <Form.Item
                label={<span>{label}</span>}
                name={fieldName}
                rules={[
                    { required: true, message: `Por favor, insira sua ${label.toLowerCase()}!` },
                    
                ]}
                style={{ marginBottom: 16 }}
            >
                <Input.Password
                    placeholder={placeholder}
                    size={size}
                />
            </Form.Item>

            {showValidationRules && (
                <div
                    style={{
                        marginTop: 6,
                        marginBottom: 16,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 12,
                    }}
                >
                    {checkRules.map((rule) => (
                        <div
                            key={rule.label}
                            style={{
                                fontSize: 12,
                                display: "flex",
                                alignItems: "center",
                                color: rule.valid ? "#52c41a" : "#ff4d4f",
                            }}
                        >
                            {rule.valid ? "✅" : "❌"} {rule.label}
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
