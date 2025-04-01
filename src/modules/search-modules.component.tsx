"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useDebouncedCallback } from "use-debounce";

export const SearchModules = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((query: string) => {
    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set("nome", query);
    } else {
      params.delete("nome");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 500);

  return (
    <Input
      key="search-module"
      prefix={<SearchOutlined />}
      placeholder="Buscar módulo"
      size="large"
      allowClear
      style={{
        width: 300,
      }}
      onChange={(ev) => handleSearch(ev.target.value)}
      defaultValue={searchParams.get("nome")?.toString()}
    />
  );
};
