'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Alert, Divider, Switch, Modal, message } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { getCookieConsent } from '@/utils/cookie-consent';
import { revokeConsent } from '@/services/cookie-consent.service';
import Link from 'next/link';
import { FaCookie } from 'react-icons/fa';

const { Title, Paragraph, Text } = Typography;

export default function ConfiguracoesCookiesPage() {
    const [consent, setConsent] = useState<'accepted' | 'rejected' | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const currentConsent = getCookieConsent();
        setConsent(currentConsent);
    }, []);

    const handleRevokeConsent = () => {
        Modal.confirm({
            title: 'Revogar Consentimento de Cookies?',
            icon: <ExclamationCircleOutlined />,
            content: (
                <div>
                    <Paragraph>
                        Você está prestes a <strong>revogar seu consentimento</strong> para o uso de cookies.
                    </Paragraph>
                    <Paragraph>
                        <strong>O que isso significa?</strong>
                    </Paragraph>
                    <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                        <li>Cookies de analytics e rastreamento serão desativados</li>
                        <li>Sua preferência será removida do sistema</li>
                        <li>O banner de cookies aparecerá novamente</li>
                        <li>Esta ação será registrada para conformidade com a LGPD</li>
                    </ul>
                    <Paragraph type="secondary" style={{ marginTop: '12px' }}>
                        Este é um direito garantido pela LGPD (Art. 8º, § 5º).
                    </Paragraph>
                </div>
            ),
            okText: 'Sim, revogar consentimento',
            cancelText: 'Cancelar',
            okButtonProps: { danger: true },
            width: 600,
            onOk: async () => {
                setLoading(true);
                try {
                    const success = await revokeConsent();
                    
                    if (success) {
                        message.success('Consentimento revogado com sucesso!');
                        
                        // Aguardar um pouco antes de recarregar para mostrar a mensagem
                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    } else {
                        message.error('Erro ao revogar consentimento. Tente novamente.');
                        setLoading(false);
                    }
                } catch (error) {
                    console.error('Erro ao revogar:', error);
                    message.error('Erro ao revogar consentimento. Tente novamente.');
                    setLoading(false);
                }
            },
        });
    };

    const getStatusColor = () => {
        if (consent === 'accepted') return 'success';
        if (consent === 'rejected') return 'warning';
        return 'info';
    };

    const getStatusText = () => {
        if (consent === 'accepted') return 'Você aceitou o uso de cookies';
        if (consent === 'rejected') return 'Você recusou o uso de cookies não essenciais';
        return 'Você ainda não tomou uma decisão sobre cookies';
    };

    const getStatusIcon = () => {
        if (consent === 'accepted') return <CheckCircleOutlined />;
        if (consent === 'rejected') return <CloseCircleOutlined />;
        return <FaCookie  />;
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            padding: '40px 20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Card 
                    style={{ 
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                    }}
                >
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <div style={{ textAlign: 'center' }}>
                            <FaCookie  style={{ fontSize: '48px', color: '#1890ff' }} />
                            <Title level={2}>Configurações de Cookies</Title>
                            <Paragraph type="secondary">
                                Gerencie suas preferências de cookies e privacidade
                            </Paragraph>
                        </div>

                        <Alert
                            message="Status Atual"
                            description={getStatusText()}
                            type={getStatusColor()}
                            icon={getStatusIcon()}
                            showIcon
                        />

                        <Divider />

                        <div>
                            <Title level={4}>O que são cookies?</Title>
                            <Paragraph>
                                Cookies são pequenos arquivos de texto armazenados no seu navegador 
                                quando você visita um site. Eles ajudam a melhorar sua experiência 
                                e nos permitem entender como nosso site é utilizado.
                            </Paragraph>
                        </div>

                        <div>
                            <Title level={4}>Tipos de cookies que utilizamos:</Title>
                            
                            <Card 
                                size="small" 
                                style={{ marginBottom: '12px', background: '#f0f2f5' }}
                            >
                                <Space align="start">
                                    <Switch checked disabled />
                                    <div>
                                        <Text strong>Cookies Essenciais</Text>
                                        <br />
                                        <Text type="secondary" style={{ fontSize: '13px' }}>
                                            Necessários para o funcionamento básico do site. 
                                            Não podem ser desativados.
                                        </Text>
                                    </div>
                                </Space>
                            </Card>

                            <Card 
                                size="small" 
                                style={{ marginBottom: '12px' }}
                            >
                                <Space align="start">
                                    <Switch checked={consent === 'accepted'} disabled />
                                    <div>
                                        <Text strong>Cookies de Analytics</Text>
                                        <br />
                                        <Text type="secondary" style={{ fontSize: '13px' }}>
                                            Nos ajudam a entender como os visitantes interagem 
                                            com o site, coletando informações de forma anônima.
                                        </Text>
                                    </div>
                                </Space>
                            </Card>

                            <Card 
                                size="small" 
                                style={{ marginBottom: '12px' }}
                            >
                                <Space align="start">
                                    <Switch checked={consent === 'accepted'} disabled />
                                    <div>
                                        <Text strong>Cookies de Preferências</Text>
                                        <br />
                                        <Text type="secondary" style={{ fontSize: '13px' }}>
                                            Permitem que o site lembre suas escolhas e 
                                            preferências para oferecer uma experiência personalizada.
                                        </Text>
                                    </div>
                                </Space>
                            </Card>
                        </div>

                        <Divider />

                        <div>
                            <Title level={4}>Seus Direitos (LGPD)</Title>
                            <Paragraph>
                                De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem o direito de:
                            </Paragraph>
                            <ul style={{ paddingLeft: '20px' }}>
                                <li>Confirmar a existência de tratamento de dados</li>
                                <li>Acessar seus dados pessoais</li>
                                <li>Corrigir dados incompletos ou desatualizados</li>
                                <li>Solicitar a eliminação de dados</li>
                                <li>Revogar o consentimento a qualquer momento</li>
                            </ul>
                            <Paragraph>
                                Para mais informações, consulte nossa{' '}
                                <Link href="/privacy-policy" style={{ color: '#1890ff' }}>
                                    Política de Privacidade
                                </Link>
                                {' '}e nossos{' '}
                                <Link href="/terms-of-use" style={{ color: '#1890ff' }}>
                                    Termos de Uso
                                </Link>
                                .
                            </Paragraph>
                        </div>

                        <Divider />

                        <div>
                            <Title level={4}>Revogar Consentimento</Title>
                            <Paragraph>
                                De acordo com o <strong>Art. 8º, § 5º da LGPD</strong>, você tem o direito de 
                                revogar seu consentimento a qualquer momento. Esta ação irá:
                            </Paragraph>
                            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                                <li>Desativar imediatamente todos os cookies não essenciais</li>
                                <li>Remover suas preferências do sistema</li>
                                <li>Registrar a revogação para auditoria (LGPD)</li>
                                <li>Fazer o banner de cookies aparecer novamente</li>
                            </ul>

                            {consent ? (
                                <Alert
                                    message="Você pode revogar seu consentimento"
                                    description={
                                        <div>
                                            <Paragraph style={{ marginBottom: '12px', marginTop: '8px' }}>
                                                Ao revogar, você exercerá seu direito garantido pela LGPD. 
                                                A revogação será registrada em nosso sistema para fins de auditoria 
                                                e conformidade legal.
                                            </Paragraph>
                                            <Button
                                                danger
                                                size="large"
                                                onClick={handleRevokeConsent}
                                                loading={loading}
                                                disabled={loading}
                                                style={{ marginTop: '8px' }}
                                            >
                                                🚫 Revogar Meu Consentimento
                                            </Button>
                                        </div>
                                    }
                                    type="warning"
                                    showIcon
                                    icon={<ExclamationCircleOutlined />}
                                />
                            ) : (
                                <Alert
                                    message="Nenhum consentimento registrado"
                                    description="Você ainda não aceitou ou recusou o uso de cookies. O banner aparecerá quando você acessar o site."
                                    type="info"
                                    showIcon
                                />
                            )}
                        </div>

                        <Divider />

                        <div style={{ textAlign: 'center' }}>
                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                <Paragraph type="secondary">
                                    Para mais informações sobre privacidade e proteção de dados, 
                                    entre em contato com nosso suporte.
                                </Paragraph>
                                <Link href="/">
                                    <Button type="primary" size="large">Voltar para o início</Button>
                                </Link>
                            </Space>
                        </div>
                    </Space>
                </Card>

                <div style={{ textAlign: 'center', marginTop: '24px', color: 'white' }}>
                    <Text style={{ color: 'white' }}>
                        © {new Date().getFullYear()} Os Donos da Prova - Todos os direitos reservados
                    </Text>
                </div>
            </div>
        </div>
    );
}

