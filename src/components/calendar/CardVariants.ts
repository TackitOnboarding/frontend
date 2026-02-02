import { cva } from "class-variance-authority";

export const CardVariant = cva(
  "w-[234px] rounded-[12px] p-4 transition-all flex justify-between items-center",
  {
    variants: {
      status: {
        default: "bg-white",
        today: "bg-white border border-line-active",
        urgent: "bg-background-red border border-line-negative", // 투표 마감
      }
    }
  }
)