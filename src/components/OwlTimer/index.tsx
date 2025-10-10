import React, { useState, useEffect } from 'react';
import { Button, theme } from 'antd';
import { 
    PauseOutlined, 
    CaretRightOutlined, 
    EyeOutlined, 
    EyeInvisibleOutlined 
} from '@ant-design/icons';

interface OwlTimerProps {
    formattedTime: string;
    isRunning: boolean;
    isVisible: boolean;
    onToggleVisibility: () => void;
    onToggleTimer: () => void;
}

export const OwlTimer: React.FC<OwlTimerProps> = ({
    formattedTime,
    isRunning,
    isVisible,
    onToggleVisibility,
    onToggleTimer
}) => {
    const { token } = theme.useToken();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Timer simples para mobile - posição original no Flex
    if (isMobile) {
        return (
            <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <Button
                    icon={isVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                    onClick={onToggleVisibility}
                    type="text"
                    size="small"
                    title={isVisible ? "Esconder tempo" : "Mostrar tempo"}
                    style={{ 
                        color: token.colorPrimaryText,
                        minWidth: 'clamp(22px, 4vw, 28px)',
                        height: 'clamp(22px, 4vw, 28px)'
                    }}
                />
                {isVisible && (
                    <div style={{
                        fontSize: 'clamp(12px, 3.3vw, 18px)',
                        fontWeight: 'bold',
                        color: token.colorPrimary,
                        fontFamily: 'Digital-7, monospace'
                    }}>
                        {formattedTime}
                    </div>
                )}
                <Button
                    icon={isRunning ? <PauseOutlined /> : <CaretRightOutlined />}
                    onClick={onToggleTimer}
                    type="primary"
                    size="small"
                    title={isRunning ? "Pausar timer" : "Iniciar timer"}
                    style={{
                        minWidth: 'clamp(22px, 4vw, 28px)',
                        height: 'clamp(22px, 4vw, 28px)'
                    }}
                />
            </div>
        );
    }

    // Timer com imagem da coruja para desktop
    return (
        <div style={{ 
            display: 'inline-block'
        }}>
            {/* Imagem da coruja com relógio */}
            <img 
                src="/images/ze-da-prova - relogio.png" 
                alt="Coruja com relógio"
                style={{
                    width: '120px',
                    height: 'auto',
                    display: 'block',
                    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))'
                }}
            />
            
            {/* Timer posicionado sobre o relógio digital */}
            <div style={{
                position: 'absolute',
                top: 'calc(72% + 12px)',
                left: 'calc(48% + 2px)',
                transform: 'translate(-50%, -50%) rotate(1.5deg)',
                // backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '6px',
                padding: '4px 8px',
                minWidth: '60px',
                textAlign: 'center',
                display: isVisible ? 'block' : 'none',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                fontFamily: 'monospace'
            }}>
                <div style={{
                    fontSize: 'clamp(10px, 2.5vw, 20px)',
                    fontWeight: 'bold',
                    color: '#000000',
                    lineHeight: '1.2',
                    letterSpacing: 'clamp(0.2px, 0.1vw, 0.8px)',
                    fontFamily: 'Digital-7, monospace'
                }}>
                    {formattedTime}
                </div>
            </div>

            {/* Controles do timer */}
            <div style={{
                position: 'absolute',
                left: '-50px',
                top: '70%',
                transform: 'translateY(-50%)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                alignItems: 'center'
            }}>
                <Button
                    icon={isVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                    onClick={onToggleVisibility}
                    type="text"
                    size="small"
                    title={isVisible ? "Esconder tempo" : "Mostrar tempo"}
                    style={{ 
                        color: token.colorPrimaryText,
                        minWidth: 'clamp(22px, 4vw, 28px)',
                        height: 'clamp(22px, 4vw, 28px)'
                    }}
                />
                <Button
                    icon={isRunning ? <PauseOutlined /> : <CaretRightOutlined />}
                    onClick={onToggleTimer}
                    type="primary"
                    size="small"
                    title={isRunning ? "Pausar timer" : "Iniciar timer"}
                    style={{
                        minWidth: 'clamp(22px, 4vw, 28px)',
                        height: 'clamp(22px, 4vw, 28px)'
                    }}
                />
            </div>
        </div>
    );
};