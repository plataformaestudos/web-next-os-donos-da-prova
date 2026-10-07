"use client";

import Image from "next/image";
import styled from "styled-components";

const Brand = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;

  > div {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  strong {
    color: ${({ theme }) => theme.colorText};
    font-size: 20px;
    font-weight: 700;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colorTextSecondary};
    font-size: 13px;
    line-height: 1.5;
  }

  @media (max-width: 480px) {
    strong {
      font-size: 18px;
    }
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 12px;
  background: #163658;

  img {
    object-fit: contain;
  }
`;

export function CheckoutBrand() {
  return (
    <Brand>
      <div>
        <Logo>
          <Image src="/images/passaro.png" alt="" width={34} height={34} priority />
        </Logo>
        <strong>Os Donos da Prova</strong>
      </div>
      <p>Plataforma de estudos para vestibulares e concursos</p>
    </Brand>
  );
}

export default CheckoutBrand;
