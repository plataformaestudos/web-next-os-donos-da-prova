"use client";

import { Button, Select, Input, Space, Typography, Row, Col, Collapse } from "antd";
import { QuestionReportStatus } from "@/types/question-report-status.types";
import { QuestionReportCategory, QuestionReportSubcategory } from "@/types/question-report.types";
import { FaFilter, FaTimes, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import * as Styled from "@/app/(protected)/question-reports/page.style";

const { Text } = Typography;
const { Panel } = Collapse;

interface QuestionReportFiltersProps {
  currentFilters: {
    status?: QuestionReportStatus;
    category?: QuestionReportCategory;
    subcategory?: QuestionReportSubcategory;
    questionText?: string;
  };
}

const reportCategories = {
  [QuestionReportCategory.ERROR_TEXT]: {
    label: QuestionReportCategory.ERROR_TEXT,
    subcategories: {
      [QuestionReportSubcategory.GRAMMAR]: QuestionReportSubcategory.GRAMMAR,
      [QuestionReportSubcategory.SPELLING]: QuestionReportSubcategory.SPELLING,
      [QuestionReportSubcategory.FORMULATION]: QuestionReportSubcategory.FORMULATION,
      [QuestionReportSubcategory.INCOMPLETE]: QuestionReportSubcategory.INCOMPLETE,
      [QuestionReportSubcategory.IMAGE_NOT_SHOWING]: QuestionReportSubcategory.IMAGE_NOT_SHOWING,
      [QuestionReportSubcategory.IMAGE_ILLEGIBLE]: QuestionReportSubcategory.IMAGE_ILLEGIBLE,
      [QuestionReportSubcategory.NO_STATEMENT]: QuestionReportSubcategory.NO_STATEMENT,
      [QuestionReportSubcategory.OTHER_TEXT_ERROR]: QuestionReportSubcategory.OTHER_TEXT_ERROR,
    }
  },
  [QuestionReportCategory.ANSWER_KEY]: {
    label: QuestionReportCategory.ANSWER_KEY,
    subcategories: {
      [QuestionReportSubcategory.INCORRECT_ANSWER_KEY]: QuestionReportSubcategory.INCORRECT_ANSWER_KEY,
      [QuestionReportSubcategory.ILLEGIBLE_ANSWER_KEY]: QuestionReportSubcategory.ILLEGIBLE_ANSWER_KEY,
      [QuestionReportSubcategory.ANSWER_KEY_NOT_SHOWING]: QuestionReportSubcategory.ANSWER_KEY_NOT_SHOWING,
    }
  },
  [QuestionReportCategory.ERROR_ALTERNATIVES]: {
    label: QuestionReportCategory.ERROR_ALTERNATIVES,
    subcategories: {
      [QuestionReportSubcategory.DUPLICATE_ALTERNATIVE]: QuestionReportSubcategory.DUPLICATE_ALTERNATIVE,
      [QuestionReportSubcategory.MISSING_ALTERNATIVE]: QuestionReportSubcategory.MISSING_ALTERNATIVE,
      [QuestionReportSubcategory.INCORRECT_ALTERNATIVE]: QuestionReportSubcategory.INCORRECT_ALTERNATIVE,
      [QuestionReportSubcategory.ILLEGIBLE_ALTERNATIVE]: QuestionReportSubcategory.ILLEGIBLE_ALTERNATIVE,
    }
  },
  [QuestionReportCategory.ERROR_COMMENT]: {
    label: QuestionReportCategory.ERROR_COMMENT,
    subcategories: {
      [QuestionReportSubcategory.INCORRECT_EXPLANATION]: QuestionReportSubcategory.INCORRECT_EXPLANATION,
      [QuestionReportSubcategory.INCOMPLETE_EXPLANATION]: QuestionReportSubcategory.INCOMPLETE_EXPLANATION,
      [QuestionReportSubcategory.CONFUSING_EXPLANATION]: QuestionReportSubcategory.CONFUSING_EXPLANATION,
      [QuestionReportSubcategory.COMMENT_IMAGE_NOT_SHOWING]: QuestionReportSubcategory.COMMENT_IMAGE_NOT_SHOWING,
      [QuestionReportSubcategory.COMMENT_IMAGE_ILLEGIBLE]: QuestionReportSubcategory.COMMENT_IMAGE_ILLEGIBLE,
      [QuestionReportSubcategory.NO_COMMENT]: QuestionReportSubcategory.NO_COMMENT,
    }
  },
  [QuestionReportCategory.TECHNICAL_PROBLEM]: {
    label: QuestionReportCategory.TECHNICAL_PROBLEM,
    subcategories: {
      [QuestionReportSubcategory.NOT_LOADING]: QuestionReportSubcategory.NOT_LOADING,
      [QuestionReportSubcategory.WRONG_FORMAT]: QuestionReportSubcategory.WRONG_FORMAT,
      [QuestionReportSubcategory.BROKEN_IMAGE]: QuestionReportSubcategory.BROKEN_IMAGE,
      [QuestionReportSubcategory.SLOW_LOADING]: QuestionReportSubcategory.SLOW_LOADING,
    }
  },
  [QuestionReportCategory.OTHER]: {
    label: QuestionReportCategory.OTHER,
    subcategories: {
      [QuestionReportSubcategory.SUGGESTION]: QuestionReportSubcategory.SUGGESTION,
      [QuestionReportSubcategory.DOUBT]: QuestionReportSubcategory.DOUBT,
    }
  }
};

export function QuestionReportFilters({ currentFilters }: QuestionReportFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState({
    status: currentFilters.status || "",
    category: currentFilters.category || "",
    subcategory: currentFilters.subcategory || "",
    questionText: currentFilters.questionText || "",
  });

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      ...(key === 'category' && { subcategory: "" })
    }));
  }, []);

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    params.set('page', '1');
    
    params.delete('status');
    params.delete('category');
    params.delete('subcategory');
    params.delete('questionText');
    
    if (filters.status) params.set('status', filters.status);
    if (filters.category) params.set('category', filters.category);
    if (filters.subcategory) params.set('subcategory', filters.subcategory);
    if (filters.questionText) params.set('questionText', filters.questionText);
    
    router.push(`/question-reports?${params.toString()}`);
  }, [filters, router, searchParams]);

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('status');
    params.delete('category');
    params.delete('subcategory');
    params.delete('questionText');
    params.set('page', '1');

    setFilters({
      status: "",
      category: "",
      subcategory: "",
      questionText: "",
    });
    router.push(`/question-reports?${params.toString()}`);
  }, [router, searchParams]);

  const hasActiveFilters = Object.values(currentFilters).some(value => value);

  const getActiveFiltersCount = () => {
    return Object.values(currentFilters).filter(value => value).length;
  };

  const getActiveFiltersText = () => {
    const count = getActiveFiltersCount();
    if (count === 0) return "Filtros";
    return `Filtros (${count} ativo${count > 1 ? 's' : ''})`;
  };

  return (
    <Styled.FiltersContainer>
      <Collapse 
        defaultActiveKey={[]}
        ghost
        expandIcon={({ isActive }) => 
          isActive ? <FaChevronUp /> : <FaChevronDown />
        }
        expandIconPosition="end"
      >
        <Panel 
          header={
            <Space>
              <FaFilter />
              <Text strong>{getActiveFiltersText()}</Text>
              {hasActiveFilters && (
                <Button 
                  type="link" 
                  danger 
                  size="small"
                  icon={<FaTimes />}
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFilters();
                  }}
                >
                  Limpar Filtros
                </Button>
              )}
            </Space>
          }
          key="filters"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Status:</Text>
                <Select
                  placeholder="Todos os status"
                  value={filters.status || undefined}
                  onChange={(value) => handleFilterChange('status', value || '')}
                  style={{ width: '100%' }}
                  allowClear
                  options={Object.values(QuestionReportStatus).map(status => ({
                    value: status,
                    label: status
                  }))}
                />
              </Space>
            </Col>
            
            <Col xs={24} sm={12} md={6}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Categoria:</Text>
                <Select
                  placeholder="Todas as categorias"
                  value={filters.category || undefined}
                  onChange={(value) => handleFilterChange('category', value || '')}
                  style={{ width: '100%' }}
                  allowClear
                  options={Object.entries(reportCategories).map(([key, value]) => ({
                    value: key,
                    label: value.label
                  }))}
                />
              </Space>
            </Col>
            
            <Col xs={24} sm={12} md={6}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Subcategoria:</Text>
                <Select
                  placeholder="Todas as subcategorias"
                  value={filters.subcategory || undefined}
                  onChange={(value) => handleFilterChange('subcategory', value || '')}
                  style={{ width: '100%' }}
                  allowClear
                  disabled={!filters.category}
                  options={
                    filters.category 
                      ? Object.entries(reportCategories[filters.category as keyof typeof reportCategories].subcategories).map(([key, value]) => ({
                          value: key,
                          label: value
                        }))
                      : []
                  }
                />
              </Space>
            </Col>
            
            <Col xs={24} sm={12} md={6}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Texto da Questão:</Text>
                <Input
                  placeholder="Buscar no texto..."
                  value={filters.questionText}
                  onChange={(e) => handleFilterChange('questionText', e.target.value)}
                  allowClear
                />
              </Space>
            </Col>
          </Row>
          
          <Row style={{ marginTop: 16 }}>
            <Col span={24}>
              <Space>
                <Button type="primary" onClick={applyFilters}>
                  Aplicar Filtros
                </Button>
              </Space>
            </Col>
          </Row>
        </Panel>
      </Collapse>
    </Styled.FiltersContainer>
  );
}
