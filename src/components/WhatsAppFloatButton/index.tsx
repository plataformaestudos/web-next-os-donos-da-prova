"use client";

import { FloatButton } from "antd";
import {WhatsAppOutlined } from "@ant-design/icons";

interface WhatsAppFloatButtonProps {
  phoneNumber?: string;
  message?: string;
}

export function WhatsAppFloatButton({ 
  phoneNumber = "5531971466327",
  message = "Olá! Gostaria de saber mais sobre a plataforma." 
}: WhatsAppFloatButtonProps) {
  
  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <FloatButton
      icon={<WhatsAppOutlined />}
      type="primary"
      onClick={handleWhatsAppClick}
      tooltip="Fale conosco no WhatsApp"
    />
  );
}
