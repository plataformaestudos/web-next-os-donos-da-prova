"use client";

import { Button, Select, Spin } from "antd";
import { LoadingOutlined, SearchOutlined } from "@ant-design/icons";

import { DefaultOptionType } from "antd/es/select";
import { queryModules } from "../load-modules.action";
import { useDebouncedCallback } from "use-debounce";
import { useState } from "react";

interface SearchModulesProps {
  moduleId: string;
  onSelectModule: (moduleId: string) => void;
  onClickCreateNew: () => void;
}

export function SearchModules({
  moduleId,
  onSelectModule,
  onClickCreateNew,
}: SearchModulesProps) {
  const [options, setOptions] = useState<DefaultOptionType[]>([]);
  const [fetching, setFetching] = useState(false);
  const [query, setQuery] = useState<string>();

  const handleSearch = useDebouncedCallback((newQuery: string) => {
    setFetching(true);
    setQuery(newQuery);

    queryModules(newQuery, moduleId)
      .then((modules) => {
        setOptions(
          modules?.map(({ key, title }) => ({ value: key, label: title })) ?? []
        );
      })
      .finally(() => {
        setFetching(false);
      });
  }, 500);

  return (
    <Select
      suffixIcon={<SearchOutlined />}
      filterOption={false}
      options={options}
      onChange={onSelectModule}
      onSearch={handleSearch}
      placeholder="Buscar um módulo"
      notFoundContent={
        fetching ? (
          <Spin size="small" indicator={<LoadingOutlined />} />
        ) : query ? (
          <span>
            Módulo não encontrado,{" "}
            <Button
              type="link"
              onClick={onClickCreateNew}
              style={{ padding: 0 }}
            >
              você pode criar um novo
            </Button>
          </span>
        ) : null
      }
      showSearch
      style={{ width: "100%" }}
    />
  );
}
