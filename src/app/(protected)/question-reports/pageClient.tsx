"use client";

import * as Styled from "@/app/(protected)/question-reports/page.style";
import { Button, Card, List, Tag, Typography, Space, Divider, Empty, Pagination, Select } from "antd";
import { PageLayout } from "@/ui/page-layout/page-layout.component";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { Roles } from "@/util/roles";
import { FullPageLoading } from "@/ui/loading/full-page-loading";
import { QuestionReportModel, QuestionReportViewModel } from "@/model/question-report.model";
import { QuestionReportStatus } from "@/types/question-report-status.types";
import { QuestionReportCategory, QuestionReportSubcategory } from "@/types/question-report.types";
import { updateQuestionReportStatus } from "@/question-reports/update-report-status.action";
import { QuestionReportFilters } from "@/question-reports/question-report-filters.component";
import { FaEye, FaUser, FaQuestionCircle, FaCalendarAlt, FaCheck, FaTimes, FaSearch } from "react-icons/fa";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { App } from "antd";

const { Text, Title } = Typography;

interface QuestionReportsPageClientProps {
  reports: QuestionReportModel[];
  total: number;
  currentPage: number;
  itemsPerPage: number;
  currentFilters: {
    status?: QuestionReportStatus;
    category?: QuestionReportCategory;
    subcategory?: QuestionReportSubcategory;
    questionText?: string;
  };
}

export function QuestionReportsPageClient({ 
  reports, 
  total, 
  currentPage, 
  itemsPerPage, 
  currentFilters
}: QuestionReportsPageClientProps) {
  const { loading, allowed } = useAuthGuard({
    requireRoles: [Roles.ADMIN],
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const { message } = App.useApp();

  const handlePageChange = useCallback((page: number, pageSize?: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    if (pageSize) {
      params.set('itemsPerPage', pageSize.toString());
    }
    router.push(`/question-reports?${params.toString()}`);
  }, [router, searchParams]);

  const handleItemsPerPageChange = useCallback((value: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('itemsPerPage', value.toString());
    params.set('page', '1');
    router.push(`/question-reports?${params.toString()}`);
  }, [router, searchParams]);

  const handleStatusUpdate = useCallback(async (reportId: string, newStatus: QuestionReportStatus) => {
    setUpdatingStatus(reportId);
    
    try {
      const result = await updateQuestionReportStatus(reportId, newStatus);
      
      if (result.success) {
        message.success(`Status atualizado para "${newStatus}" com sucesso!`);
        router.refresh();
      } else {
        message.error(result.error || "Erro ao atualizar status");
      }
    } catch (error) {
      console.error(error);
      message.error("Erro ao atualizar status");
    } finally {
      setUpdatingStatus(null);
    }
  }, [message, router]);

  const getStatusColor = (status: QuestionReportStatus) => {
    const colors: Record<QuestionReportStatus, string> = {
      [QuestionReportStatus.PENDING]: "orange",
      [QuestionReportStatus.IN_ANALYSIS]: "blue",
      [QuestionReportStatus.CORRECTED]: "green",
      [QuestionReportStatus.REJECTED]: "red",
    };
    return colors[status] || "default";
  };

  const getAvailableActions = (status: QuestionReportStatus, reportId: string) => {
    const actions = [];
    const report = reports.find(r => r.id === reportId);

    if (report?.question.id) {
      actions.push(
        <Link key="view" href={`/questions/${report.question.id}`}>
          <Button type="link" icon={<FaEye />}>
            Ver Questão
          </Button>
        </Link>
      );
    }
    switch (status) {
      case QuestionReportStatus.PENDING:
        actions.push(
          <Button
            key="analyze"
            type="link"
            icon={<FaSearch />}
            loading={updatingStatus === reportId}
            onClick={() => handleStatusUpdate(reportId, QuestionReportStatus.IN_ANALYSIS)}
          >
            Analisar
          </Button>
        );
        actions.push(
          <Button
            key="correct"
            type="link"
            icon={<FaCheck />}
            loading={updatingStatus === reportId}
            onClick={() => handleStatusUpdate(reportId, QuestionReportStatus.CORRECTED)}
          >
            Corrigido
          </Button>
        );
        actions.push(
          <Button
            key="reject"
            type="link"
            danger
            icon={<FaTimes />}
            loading={updatingStatus === reportId}
            onClick={() => handleStatusUpdate(reportId, QuestionReportStatus.REJECTED)}
          >
            Recusado
          </Button>
        );
        break;
      
      case QuestionReportStatus.IN_ANALYSIS:
        actions.push(
          <Button
            key="correct"
            type="link"
            icon={<FaCheck />}
            loading={updatingStatus === reportId}
            onClick={() => handleStatusUpdate(reportId, QuestionReportStatus.CORRECTED)}
          >
            Corrigido
          </Button>
        );
        actions.push(
          <Button
            key="reject"
            type="link"
            danger
            icon={<FaTimes />}
            loading={updatingStatus === reportId}
            onClick={() => handleStatusUpdate(reportId, QuestionReportStatus.REJECTED)}
          >
            Recusado
          </Button>
        );
        break;
      
      case QuestionReportStatus.CORRECTED:
      case QuestionReportStatus.REJECTED:
        // Nenhuma ação adicional além de "Ver Questão"
        break;
    }

    return actions;
  };

  if (loading) return <FullPageLoading />;

  if (!allowed) return null;

  const reportsWithKeys: QuestionReportViewModel[] = reports.map((report) => ({
    ...report,
    key: report.id,
  }));

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Erro no enunciado da questão": "red",
      "Erro no gabarito": "orange",
      "Erro nas alternativas": "purple",
      "Erro no comentário": "blue",
      "Problema técnico": "volcano",
      "Outro problema": "default",
    };
    return colors[category] || "default";
  };

  const formatQuestionText = (text: string | null) => {
    if (!text) return "Questão não encontrada";
    
    // Remove HTML tags and limit length
    const cleanText = text.replace(/<[^>]*>/g, "");
    return cleanText.length > 100 
      ? `${cleanText.substring(0, 100)}...` 
      : cleanText;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <PageLayout title="Reports de Questões" actions={[]}>
      <QuestionReportFilters currentFilters={currentFilters} />
      <Styled.ReportsContainer>
        {reportsWithKeys.length === 0 ? (
          <Empty
            description="Nenhum report encontrado"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <>
            <List
              dataSource={reportsWithKeys}
              renderItem={(report) => (
                <List.Item>
                  <Card
                    style={{ width: "100%" }}
                    actions={getAvailableActions(report.status, report.id)}
                  >
                    <Card.Meta
                      title={
                        <Space direction="vertical" size="small" style={{ width: "100%" }}>
                          <Space wrap>
                            <Tag color={getCategoryColor(report.category)}>
                              {report.category}
                            </Tag>
                            <Tag color="geekblue">{report.subcategory}</Tag>
                            <Tag color={getStatusColor(report.status)}>
                              {report.status}
                            </Tag>
                          </Space>
                          <Title level={5} style={{ margin: 0 }}>
                            {formatQuestionText(report.question.text)}
                          </Title>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size="small" style={{ width: "100%" }}>
                          {report.description && (
                            <>
                              <Text> <strong>Descrição:</strong> {report.description}</Text>
                            </>
                          )}
                          
                          <Divider style={{ margin: "8px 0" }} />
                          
                          <Space>
                            <FaUser style={{ color: "#1890ff" }} />
                            <Text strong>{report.user.name}</Text>
                            <Text type="secondary">({report.user.email})</Text>
                          </Space>
                          
                          <Space>
                            <FaCalendarAlt style={{ color: "#722ed1" }} />
                            <Text type="secondary">{formatDate(report.createdAt)}</Text>
                          </Space>
                          
                          {report.question.id && (
                            <Space>
                              <FaQuestionCircle style={{ color: "#52c41a" }} />
                              <Text type="secondary">ID da Questão: {report.question.id}</Text>
                            </Space>
                          )}
                        </Space>
                      }
                    />
                  </Card>
                </List.Item>
              )}
            />
            
            <Styled.PaginationContainer>
              <Space size="large" align="center">
                <Text strong>Itens por página:</Text>
                <Select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  options={[
                    { value: 5, label: '5' },
                    { value: 10, label: '10' },
                    { value: 20, label: '20' },
                    { value: 50, label: '50' },
                  ]}
                  style={{ width: 80 }}
                />
                <Text type="secondary">
                  Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, total)} de {total} reports
                </Text>
              </Space>
              
              <Pagination
                current={currentPage}
                total={total}
                pageSize={itemsPerPage}
                onChange={handlePageChange}
                showSizeChanger={false}
                showQuickJumper
                showTotal={(total, range) => 
                  `${range[0]}-${range[1]} de ${total} reports`
                }
              />
            </Styled.PaginationContainer>
          </>
        )}
      </Styled.ReportsContainer>
    </PageLayout>
  );
}
