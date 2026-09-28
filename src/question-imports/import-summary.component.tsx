import { Card, Col, Row, Statistic } from "antd";
import type { QuestionImportSummary } from "./question-import.model";

export function ImportSummary({ summary }: { summary: QuestionImportSummary }) {
  const counters = [
    ["Questões identificadas", summary.totalItems],
    ["Válidas pela análise", summary.validItems],
    ["Questões com erro", summary.invalidItems],
    ["Questões com aviso", summary.warningItems],
    ["Erros encontrados", summary.errorCount],
    ["Questões já salvas", summary.savedItems],
  ] as const;
  return (
    <Row gutter={[16, 16]}>
      {counters.map(([title, value]) => (
        <Col xs={24} sm={12} lg={8} key={title}>
          <Card size="small">
            <Statistic title={title} value={value} />
          </Card>
        </Col>
      ))}
    </Row>
  );
}
