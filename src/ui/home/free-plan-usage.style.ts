import Link from "next/link";
import styled from "styled-components";

export const Card = styled.section`
    grid-area: freePlan;
    align-self: end;
    min-width: 0;
    background: ${({ theme }) => theme.colorSecondary};
    color: ${({ theme }) => theme.colorPrimaryText};
    border-radius: 12px;
    padding: 12px 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    @media (max-width: 1024px) {
        align-self: stretch;
    }

    @media (max-width: 768px) {
        padding: 20px 16px;
        gap: 16px;
    }
`;

export const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-width: 0;

    @media (max-width: 380px) {
        flex-wrap: wrap;
        gap: 8px;
    }
`;

export const TitleGroup = styled.div`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
`;

export const Title = styled.h2`
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    line-height: 20px;

    @media (max-width: 768px) {
        font-size: 17px;
    }
`;

export const Badge = styled.span`
    background: ${({ theme }) => theme.colorFillSecondary};
    color: ${({ theme }) => theme.colorTextSecondary};
    border-radius: 12px;
    padding: 1px 8px;
    font-size: 12px;
    line-height: 18px;
`;

export const PlansLink = styled(Link)`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: ${({ theme }) => theme.colorPrimaryText};
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }

    &:focus-visible {
        outline: 2px solid ${({ theme }) => theme.colorPrimaryText};
        outline-offset: 4px;
        border-radius: 2px;
    }
`;

export const Indicators = styled.div`
    display: flex;
    gap: 20px;

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 16px;
        padding-top: 16px;
        border-top: 1px solid ${({ theme }) => theme.colorBorderSecondary};
    }
`;

export const Indicator = styled.div`
    flex: 1;
    min-width: 0;

    & + & {
        border-left: 1px solid ${({ theme }) => theme.colorBorderSecondary};
        padding-left: 20px;
    }

    .ant-progress {
        display: block;
        line-height: 1;
        margin: 4px 0;
    }

    @media (max-width: 768px) {
        & + & {
            border-left: 0;
            border-top: 1px solid ${({ theme }) => theme.colorBorderSecondary};
            padding-left: 0;
            padding-top: 16px;
        }

        .ant-progress {
            margin: 8px 0;
        }
    }
`;

export const IndicatorHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 4px 12px;
    font-size: 13px;
    line-height: 18px;

    @media (max-width: 768px) {
        font-size: 13px;
        line-height: 20px;
    }
`;

export const Label = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: ${({ theme }) => theme.colorTextSecondary};
`;

export const Value = styled.strong<{ $limitReached?: boolean }>`
    color: ${({ theme, $limitReached }) => $limitReached ? theme.colorErrorText : theme.colorPrimaryText};
    font-size: 14px;
    white-space: nowrap;

    @media (max-width: 768px) {
        font-size: 16px;
    }
`;

export const Legend = styled.p`
    color: ${({ theme }) => theme.colorTextSecondary};
    font-size: 11px;
    line-height: 14px;
    margin: 0;

    @media (max-width: 768px) {
        font-size: 12px;
        line-height: 17px;
    }
`;
