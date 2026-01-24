"use client";

import { useEffect, useState } from "react";
import { Badge } from "antd";
import HttpClient from "@/util/http-client/fetch-client.util";
import { ResponseModel } from "@/model/common.model";

interface ReportsBadgeProps {
  children: React.ReactNode;
}

export function ReportsBadge({ children }: ReportsBadgeProps) {
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    async function fetchPendingCount() {
      try {
        const resp = await HttpClient.fetch<ResponseModel<number>>(
          "/question-reports/pending/count",
          { method: "GET" },
          false
        );
        console.log(resp.data);
        const count = typeof resp?.data === "number" ? resp.data : Number(resp?.data) || 0;
        setPendingCount(count);
      } catch (err) {
        console.error("Erro ao buscar contagem de reports pendentes", err);
      }
    }

    fetchPendingCount();

    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchPendingCount, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Badge count={pendingCount} size="small" offset={[0, 0]}>
      {children}
    </Badge>
  );
}

