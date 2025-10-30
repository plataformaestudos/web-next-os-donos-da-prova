'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Alert, Divider, Switch, Modal, message, Row, Col } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { getCookieConsent } from '@/utils/cookie-consent';
import { revokeConsent } from '@/services/cookie-consent.service';
import Link from 'next/link';
import { FaCookie } from 'react-icons/fa';
import styled from 'styled-components';

const { Title, Paragraph, Text } = Typography;

const PageContainer = styled.div`
    min-height: 100vh;
    background-color: ${({ theme }) => theme?.colorBgContainer || '#f5f5f5'};
    padding: 40px 20px;
`;

const CookieCard = styled(Card)`
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    margin-bottom: 24px;
`;

const HeaderWrapper = styled.div`
    text-align: center;
    margin-bottom: 32px;
`;

const CookieIcon = styled(FaCookie)`
    font-size: 64px;
    color: #fa8c16;
    margin-bottom: 16px;
`;

const StyledTitle = styled(Title)`
    color: #1890ff !important;
    margin-bottom: 8px !important;
`;

const TypeCard = styled(Card)`
    margin-bottom: 12px;
    border-radius: 8px;
    transition: all 0.3s ease;
    
    &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
`;

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
        <PageContainer>
            <Row justify="center">
                <Col xs={24} sm={22} md={20} lg={16} xl={14}>
                    <CookieCard>
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <HeaderWrapper>
                                <CookieIcon />
                                <StyledTitle level={2}>Configurações de Cookies</StyledTitle>
                                <Paragraph type="secondary" style={{ fontSize: '16px' }}>
                                    Gerencie suas preferências de cookies e privacidade
                                </Paragraph>
                            </HeaderWrapper>

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
                            <Title level={4} style={{ color: '#1890ff' }}>
                                Tipos de cookies que utilizamos:
                            </Title>
                            
                            <TypeCard 
                                size="small" 
                            >
                                <Space align="start" size="middle">
                                    <Switch checked disabled />
                                    <div>
                                        <Text strong style={{ fontSize: '15px' }}>🔒 Cookies Essenciais</Text>
                                        <br />
                                        <Text type="secondary" style={{ fontSize: '14px' }}>
                                            Necessários para o funcionamento básico do site. 
                                            Não podem ser desativados.
                                        </Text>
                                    </div>
                                </Space>
                            </TypeCard>

                            <TypeCard size="small">
                                <Space align="start" size="middle">
                                    <Switch checked={consent === 'accepted'} disabled />
                                    <div>
                                        <Text strong style={{ fontSize: '15px' }}>📊 Cookies de Analytics</Text>
                                        <br />
                                        <Text type="secondary" style={{ fontSize: '14px' }}>
                                            Nos ajudam a entender como os visitantes interagem 
                                            com o site, coletando informações de forma anônima.
                                        </Text>
                                    </div>
                                </Space>
                            </TypeCard>

                            <TypeCard size="small">
                                <Space align="start" size="middle">
                                    <Switch checked={consent === 'accepted'} disabled />
                                    <div>
                                        <Text strong style={{ fontSize: '15px' }}>⚙️ Cookies de Preferências</Text>
                                        <br />
                                        <Text type="secondary" style={{ fontSize: '14px' }}>
                                            Permitem que o site lembre suas escolhas e 
                                            preferências para oferecer uma experiência personalizada.
                                        </Text>
                                    </div>
                                </Space>
                            </TypeCard>
                        </div>

                        <Divider />

                        <Alert
                            message={<Text strong style={{ fontSize: '15px' }}>📋 Seus Direitos (LGPD)</Text>}
                            description={
                                <div>
                                    <Paragraph style={{ marginBottom: '12px' }}>
                                        De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem o direito de:
                                    </Paragraph>
                                    <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
                                        <li>Confirmar a existência de tratamento de dados</li>
                                        <li>Acessar seus dados pessoais</li>
                                        <li>Corrigir dados incompletos ou desatualizados</li>
                                        <li>Solicitar a eliminação de dados</li>
                                        <li>Revogar o consentimento a qualquer momento</li>
                                    </ul>
                                    <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                                        Para mais informações, consulte nossa{' '}
                                        <Link href="/privacy-policy" style={{ color: '#1890ff', fontWeight: 500 }}>
                                            Política de Privacidade
                                        </Link>
                                        {' '}e nossos{' '}
                                        <Link href="/terms-of-use" style={{ color: '#1890ff', fontWeight: 500 }}>
                                            Termos de Uso
                                        </Link>
                                        .
                                    </Paragraph>
                                </div>
                            }
                            type="success"
                            showIcon
                            style={{ borderRadius: '8px' }}
                        />

                        <Divider />

                        <div>
                            <Title level={4} style={{ color: '#1890ff' }}>
                                🚫 Revogar Consentimento
                            </Title>
                            <Paragraph style={{ fontSize: '15px' }}>
                                De acordo com o <Text strong style={{ color: '#fa8c16' }}>Art. 8º, § 5º da LGPD</Text>, você tem o direito de 
                                revogar seu consentimento a qualquer momento. Esta ação irá:
                            </Paragraph>
                            <ul style={{ paddingLeft: '20px', marginBottom: '16px', fontSize: '14px' }}>
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


                        <div style={{ textAlign: 'center', marginTop: '16px' }}>
                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                <Divider />
                                <Paragraph type="secondary" style={{ fontSize: '14px' }}>
                                    Para mais informações sobre privacidade e proteção de dados, 
                                    entre em contato com nosso suporte.
                                </Paragraph>
                                <Space size="middle">
                                    <Link href="/">
                                        <Button icon={<ArrowLeftOutlined />} size="large">
                                            Voltar
                                        </Button>
                                    </Link>
                                    <Link href="/privacy-policy">
                                        <Button type="primary" size="large">
                                            Política de Privacidade
                                        </Button>
                                    </Link>
                                </Space>
                            </Space>
                        </div>
                    </Space>
                </CookieCard>
            </Col>
        </Row>
    </PageContainer>
    );
}

