"use client";

import styled, { css } from "styled-components";

interface ISelectProps {
  $active?: boolean;
}

export const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const HeaderAction = styled.span`
  font-size: 14px;
  font-weight: 400;
  color: #3398da;
  white-space: nowrap;
  padding: 4px 10px;
  background-color: ${({ theme }) => theme.colorBgFilter};

  &:hover {
    cursor: pointer;
    text-decoration: underline;
  }
`;

export const FilterContainer = styled.div`
  display: flex;
  width: 100%;
  background-color: ${({ theme }) => theme.colorBgFilter};
  padding: 4px 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
`;

export const FilterTitle = styled.span`
  font-size: 14px;
  font-weight: 400;
  color: #83828b;
  margin-right: 8px;
`;

export const FilterOption = styled.span<ISelectProps>`
  font-size: 14px;
  font-weight: 400;
  color: #83828b;
  cursor: pointer;
  padding: 0 6px;

  &:hover {
    cursor: pointer;
  }

  ${({ $active }) =>
    $active &&
    css`
      font-weight: 700;
    `}
`;

export const FilterDivider = styled.span`
  font-size: 8px;
  font-weight: 400;
  color: #83828b;
  display: flex;
  align-items: center;
`;

export const PostsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
`;

export const Post = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  border-top: 1px solid #edeff0;
  margin-top: 24px;
  padding-top: 24px;

  &:first-child {
    border-top: none;
    margin-top: 0;
    padding-top: 0;
  }
`;

export const Child = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 24px;
  padding: 24px 48px;
  background-color: ${({ theme }) => theme.colorBgFilter};
`;

export const PostHeader = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

export const PostInfoHeader = styled.div`
  display: flex;
  align-items: center;
`;

export const PostVotes = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 8px;

  svg {
    width: 20px;
    height: 20px;
    color: #cbcdcf;
  }

  .positive {
    svg {
      color: #1fac31;
    }
  }

  .negative {
    svg {
      color: #ff4d4f;
    }
  }
`;

export const PostVoteCount = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colorTextPrimary};
  text-align: center;
`;

export const PostAvatar = styled.span`
  min-width: 56px;
  width: 56px;
  min-height: 56px;
  height: 56px;
  border-radius: 50%;
  border: 1px solid #cbcdcf;
  margin-right: 8px;
  color: ${({ theme }) => theme.colorTextPrimary};
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const PostInfoUser = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const PostUserName = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colorTextPrimary};
`;

export const PostUserRating = styled.span`
  font-size: 14px;
  font-weight: 400;
  color: #83828b;

  span.positive {
    color: #1fac31;
  }

  span.negative {
    color: #ff4d4f;
  }
`;

export const PostActionsHeader = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const DateTime = styled.span`
  font-size: 14px;
  font-weight: 400;
  color: #83828b;
`;

export const PostActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const PostAction = styled.span`
  font-size: 14px;
  font-weight: 400;
  color: #3398da;
  cursor: pointer;
  display: flex;
  align-items: center;

  span {
    color: #ff4d4f;
  }
`;

export const PostContent = styled.div`
  font-size: 14px;
  margin-top: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colorTextPrimary};
  width: 100%;
  display: flex;
  flex-direction: column;
`;

export const PostAnswerActions = styled.div`
  display: flex;
  width: 100%;
  margin-top: 4px;

  svg {
    margin-left: auto;

    &:hover {
      cursor: pointer;
      filter: brightness(0.7);
    }
  }
`;

export const SilencedPostContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px;
  background-color: #f5f5f5;
  border-radius: 8px;
`;

export const ShowPost = styled.button`
  font-size: 14px;
  font-weight: 400;
  color: #3398da;
  cursor: pointer;
  margin-top: 8px;
  text-align: right;

  &:hover {
    text-decoration: underline;
  }
`;

export const NewPostContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colorBgFilter};
  border-radius: 8px;
  gap: 30px;
  padding: 10px;
`;

export const EditorContainer = styled.div`
  padding-left: 17px;
  padding-right: 17px;
  padding-top: 10px;
`;

export const NewPostButton = styled.button`
  width: fit-content;
  padding: 8px 16px;
  background-color: #1677ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  margin-top: -20px;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #cbcdcf;
    cursor: not-allowed;
  }
`;
