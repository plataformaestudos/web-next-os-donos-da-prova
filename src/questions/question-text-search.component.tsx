"use client";

import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useDebouncedCallback } from "use-debounce";
import { useState } from "react";

interface QuestionTextSearchProps {
  defaultValue?: string;
  onSearch: (text: string) => void;
  placeholder?: string;
}

export function QuestionTextSearch({
  defaultValue = "",
  onSearch,
  placeholder = "Buscar por texto da questão..."
}: QuestionTextSearchProps) {
  const [searchText, setSearchText] = useState(defaultValue);
  const handleSearch = useDebouncedCallback((text: string) => {
    onSearch(text);
  }, 500);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    handleSearch(value);
  };

  return (
    <Input
      value={searchText}
      onChange={handleChange}
      placeholder={placeholder}
      prefix={<SearchOutlined />}
      allowClear
      style={{ width: "100%", minWidth: 300, maxWidth: 500 }}
    />
  );
}
