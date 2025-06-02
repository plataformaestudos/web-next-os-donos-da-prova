import { Button } from "antd";
import {
  TbArrowNarrowLeft,
  TbArrowNarrowRight,
} from "react-icons/tb";

interface AppPaginationProps {
  prevPage: () => void;
  nextPage: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export default function AppPagination({
  prevPage,
  nextPage,
  hasPrev = false,
  hasNext = false,
}: AppPaginationProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "end",
        gap: "16px",
        marginTop: "24px",
      }}
    >
      <Button
        onClick={prevPage}
        disabled={!hasPrev}
      >
        <TbArrowNarrowLeft size={20} />
      </Button>

      <Button
        onClick={nextPage}
        disabled={!hasNext}
      >
        <TbArrowNarrowRight size={20} />
      </Button>
    </div>
  );
}
