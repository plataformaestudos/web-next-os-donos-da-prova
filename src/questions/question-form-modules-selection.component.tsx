"use client";

import { LoadingOutlined, SearchOutlined } from "@ant-design/icons";
import { Select, Spin } from "antd";

import { DefaultOptionType } from "antd/es/select";
import { queryModules } from "@/modules/tree/load-modules.action";
import { useDebouncedCallback } from "use-debounce";
import { useState } from "react";

interface SearchModulesProps {
  defaultOptions: {
    value: string;
    label: string;
  }[];
  defaultValue: string | string[];
  onSelectModules: (modulesIds: string | string[]) => void;

  multiple?: boolean;
}

export function QuestionFormModulesSelection({
  defaultValue,
  defaultOptions,
  multiple = true,
  onSelectModules,
}: SearchModulesProps) {
  const [options, setOptions] = useState<DefaultOptionType[]>(
    defaultOptions ?? []
  );
  const [fetching, setFetching] = useState(false);
  const [query, setQuery] = useState<string>();

  const handleSearch = useDebouncedCallback((newQuery: string) => {
    setFetching(true);
    setQuery(newQuery);

    queryModules(newQuery)
      .then((modules) => {
        setOptions(
          modules
            ?.filter((mod) => mod.isLeaf)
            ?.map(({ key, title }) => ({ value: key, label: title })) ?? []
        );
      })
      .finally(() => {
        setFetching(false);
      });
  }, 500);

  return (
    <Select
      defaultValue={defaultValue}
      suffixIcon={<SearchOutlined />}
      mode={multiple ? "multiple" : undefined}
      filterOption={false}
      options={options}
      onChange={(v) => onSelectModules(v)}
      onSearch={handleSearch}
      placeholder="Buscar um módulo"
      notFoundContent={
        fetching ? (
          <Spin size="small" indicator={<LoadingOutlined />} />
        ) : query ? (
          <span>Módulo não encontrado</span>
        ) : null
      }
      showSearch
      maxTagCount="responsive"
      style={{ width: "100%", minWidth: 800 }}
    />
  );
}
