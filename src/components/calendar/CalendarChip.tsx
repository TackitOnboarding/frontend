import { cva, VariantProps } from "class-variance-authority";

const calendarChipVariant = cva(
  "h-6 px-2 rounded-lg text-body2-sb truncate cursor-pointer transition-opacity hover:opacity-80 flex items-center",
  {
    variants: {
      type: {
        schedule: "text-label-inverse",
        vote: "bg-gray-50 text-label-normal",
      },
      color: {
        blue : "bg-chip-blue",
        gray : "bg-chip-gray",
        pink : "bg-chip-pink",
        orange : "bg-chip-orange",
        green: "bg-chip-green", 
      },
    }
  }
)

interface CalendarChipProps extends VariantProps<typeof calendarChipVariant> {
  title: string;
  style? :React.CSSProperties;
  isStart?: boolean; // 실제 일정의 시작일인가?
  isEnd?: boolean;   // 실제 일정의 종료일인가?
  onClick? : () => void;
}

export const CalendarChip = ({ title, type, color, style, isStart = true, isEnd = true, onClick }: CalendarChipProps) => (
  <div
    className={calendarChipVariant({
      type,
      color,
      // 시작이 아니면 왼쪽 모서리를 사각형으로, 끝이 아니면 오른쪽 모서리를 사각형으로!
      className: `
        ${isStart ? "rounded-l-lg" : "rounded-l-none"} 
        ${isEnd ? "rounded-r-lg" : "rounded-r-none"}
      `
    })}
    onClick={onClick}
    style={{left: '8px', ...style}}
  >
    {isStart && title}
  </div>
)