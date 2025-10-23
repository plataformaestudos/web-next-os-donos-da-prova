import styled from "styled-components";

export const ReportsContainer = styled.div`
  .ant-list-item {
    padding: 16px 0;
  }

  .ant-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.3s ease;

    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }
  }

  .ant-card-actions {
    border-top: 1px solid #f0f0f0;
    
    .ant-btn-link {
      color: #1890ff;
      
      &:hover {
        color: #40a9ff;
      }
    }
  }

  .ant-tag {
    border-radius: 4px;
    font-weight: 500;
  }

  .ant-typography {
    margin-bottom: 0;
  }

  .ant-divider {
    margin: 8px 0;
  }
`;

export const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding: 16px 0;
  border-top: 1px solid #f0f0f0;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
    
    .ant-space {
      justify-content: center;
    }
  }

  .ant-pagination {
    .ant-pagination-item {
      border-radius: 6px;
    }
    
    .ant-pagination-item-active {
      background-color: #1890ff;
      border-color: #1890ff;
    }
  }

  .ant-select {
    .ant-select-selector {
      border-radius: 6px;
    }
  }
`;

export const FiltersContainer = styled.div`
  .ant-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 16px;
  }

  .ant-card-head {
    border-bottom: 1px solid #f0f0f0;
    
    .ant-card-head-title {
      font-weight: 600;
    }
  }

  .ant-row {
    .ant-col {
      .ant-space-vertical {
        width: 100%;
        
        .ant-select,
        .ant-input {
          border-radius: 6px;
        }
      }
    }
  }

  .ant-btn {
    border-radius: 6px;
    font-weight: 500;
  }

  .ant-btn-primary {
    background-color: #1890ff;
    border-color: #1890ff;
    
    &:hover {
      background-color: #40a9ff;
      border-color: #40a9ff;
    }
  }

  .ant-collapse {
    border: none;
    background: transparent;
    
    .ant-collapse-item {
      border: none;
      border-radius: 8px;
      background: transparent;
      
      .ant-collapse-header {
        padding: 16px 20px;
        border-radius: 8px;
        background: transparent;
        border: none;
        
        &:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        
        .ant-collapse-arrow {
          color: #1890ff;
          font-size: 12px;
        }
      }
      
      .ant-collapse-content {
        border: none;
        border-radius: 0 0 8px 8px;
        background: transparent;
        
        .ant-collapse-content-box {
          padding: 20px;
          padding-top: 0;
        }
      }
    }
  }
`;
