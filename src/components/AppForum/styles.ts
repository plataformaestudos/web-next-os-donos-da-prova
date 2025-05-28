"use client";

import styled, { css } from "styled-components";

interface ISelectProps {
  $active?: boolean;
}

export const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export const FilterContainer = styled.div`
  display: flex;
  width: 100%;
  background-color: #edeff0;
  padding: 4px 10px;
  justify-content: flex-end;
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

export const PostHeader = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

export const PostInfoHeader = styled.div`
  display: flex;
  align-items: center;
`;

export const PostVotes = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

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
  color: #434747;
  text-align: center;
`;

export const Avatar = styled.img`
  min-width: 56px;
  width: 56px;
  min-height: 56px;
  height: 56px;
  border-radius: 50%;
  border: 1px solid #cbcdcf;
  margin: 0 8px 0 16px;
`;

export const PostInfoUser = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const PostUserName = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: #333333;
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
`;

export const PostContent = styled.div`
  font-size: 14px;
  margin-top: 16px;
  font-weight: 500;
  color: #83828b;
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