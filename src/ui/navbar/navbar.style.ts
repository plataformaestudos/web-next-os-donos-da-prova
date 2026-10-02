import styled, { css } from "styled-components";

import NextLink from "next/link";

export const Container = styled.div<{ $collapsed: boolean }>`
  background-color: ${({ theme }) => theme.colorMenu};
  position: absolute;
  height: 100%;
  width: 60%;

  transition: left 300ms ease-in-out, width 300ms ease-in-out;
  z-index: 20;

  display: flex;
  flex-direction: column;

  left: 0;

  ${({ $collapsed }) =>
    $collapsed &&
    css`
      left: -100%;
    `}

  @media (min-width: 640px) {
    position: static;
    width: 270px;

    ${({ $collapsed }) =>
      $collapsed &&
      css`
        width: 72px;
      `}
  }
`;

export const MenuItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
`;

export const Backdrop = styled.div<{ $collapsed: boolean }>`
  position: absolute;
  width: 100%;
  height: 100%;
  transition: opacity 300ms ease-in-out;
  z-index: 10;
  backdrop-filter: blur(4px);
  opacity: 0;
  pointer-events: none;

  @media (min-width: 640px) {
    display: none;
  }

  ${({ $collapsed }) =>
    !$collapsed &&
    css`
      opacity: 1;
      pointer-events: auto;
    `}
`;

export const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin: 48px 0;

  svg {
    color: #fff;
  }

  button {
    flex-shrink: 0;
  }
`;

const menuItemStyles = css<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  padding: 8px;
  margin-bottom: 16px;
  border-radius: 4px;
  width: calc(100% - 32px);
  height: 40px;

  transition: background-color 200ms ease-in-out;

  &:hover {
    background-color: white;
    svg {
      color: ${({ theme }) => theme.colorTertiary} !important;
    }
    span {
      color: ${({ theme }) => theme.colorTertiary};
    }
  }

  ${({ $active }) => $active && `background-color: white;`}

  svg {
    color: ${({ theme, $active }) =>
      $active ? theme.colorTertiary : "#fff"} !important;
    flex-shrink: 0;
  }

  span {
    color: ${({ theme, $active }) => ($active ? theme.colorTertiary : "#fff")};
  }
`;

export const Link = styled(NextLink)<{ $active: boolean }>`
  ${menuItemStyles}
`;

export const LogoutButton = styled.button<{ $active: boolean }>`
  ${menuItemStyles}
  border: 0;
  background: transparent;
  font: inherit;
  text-align: left;
  &:disabled { cursor: wait; opacity: 0.6; }
`;

export const LinkText = styled.span<{ $collapsed: boolean; $active: boolean }>`
  line-height: 1.25rem;
  transition: opacity 200ms ease-in-out;
  opacity: 0;
  pointer-events: none;
  transition-delay: 0;

  ${({ $collapsed }) =>
    !$collapsed &&
    css`
      opacity: 1;
      pointer-events: auto;
      transition-delay: 200ms;
      display: block;
    `}
`;
export const RedHeader = styled.div`
  width: 100%;
  background-color: #af2615;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0px 0;      /* aumenta o padding vertical */
  margin-bottom: 24px;  /* cria espaço entre o vermelho e os menus */
  
  img {
    width: 70px;        /* aumenta o tamanho da imagem para não cortar */
    height: 70px;
    object-fit: contain;
  }
`;
