interface SummaryCardProps {
  title: string;
  amount: number;
  icon: string;
  bg: string;
  isBalance?: boolean;
}

export default function SummaryCard({ title, amount, icon, bg, isBalance = false }: SummaryCardProps) {
  return (
    <div className="flex gap-6 p-6 rounded-xl bg-white min-w-[256px] h-[118px] items-center">
      <div className={`flex items-center justify-center rounded-xl ${bg} w-16 h-16`}>
        <img src={icon} alt={title} className="w-6 h-6" />
      </div>
      <div className="flex flex-col gap-1 items-start justify-center">
        <p className="text-body-1 text-label-neutral">{title}</p>
        <div className="flex items-center gap-1">
          <h2 className="text-title-1b text-label-normal">{amount.toLocaleString()}</h2>
          <p className="text-body-1 text-label-neutral">원</p>
        </div>
      </div>
    </div>
  )
}