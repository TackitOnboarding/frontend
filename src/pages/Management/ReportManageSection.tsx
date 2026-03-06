import { useState, useEffect } from "react";
import { toastError, toastSuccess } from '../../utils/toast'
import StatusBadge from "../../components/management/StatusBadge";
import Pagination from "../../components/Pagination";
import { useNavigate } from "react-router-dom";



type ReportStatus = "ALL" | "REPORT"  | "INACTIVE";

interface Report {
  reportId: number;
  type: string;
  content: string;
  reason: string;
  location: string;
  ReportStatus: ReportStatus;
  authorName: string;
  reportName: string;
  reportedAt: string;
}

export default function ReportManageSection () {
   const [activeFilter, setActiveFilter] = useState<ReportStatus>("ALL");
   const [reports, setReports] = useState<Report[]>([]);
   const navigate = useNavigate();

   const [currentPage, setCurrentPage] = useState(1);
   const [totalPages, setTotalPages] = useState<number>(1)
   const size = 10

   const fetchReports = async () => {
       try {
         const params = new URLSearchParams();
       if (activeFilter !== "ALL") params.append("reportStatus", activeFilter);
       params.append("page", String(currentPage));
       params.append("size", "10");
   
       const response = await fetch(`/api/executive/members?${params.toString()}`);
       const data = await response.json();
         setReports(data);
          setTotalPages(Math.max(1, Number(data?.totalPages ?? 1)))
   
       } catch (e) {
         toastError("목록을 불러오는 중 오류가 발생했습니다.");
         setTotalPages(1)
       }
     };
   
     useEffect(() => { fetchReports(); }, [activeFilter, currentPage]);

  
  return (
    <div className="w-full flex flex-col gap-5">
      <h1 className="text-title1-bold text-label-normal">신고 관리</h1>
      {/* 탭 */}
      <div className="flex gap-3">
        {[
          { label: "전체", value: "ALL" },
          { label: "신고 접수", value: "REPORT" },
          { label: "비활성화", value: "INACTIVE" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveFilter(tab.value as ReportStatus)}
            className={`px-3 py-2 rounded-lg h-10 text-body-1 ${
              activeFilter === tab.value
                ? "bg-background-active text-label-inverse"
                : "bg-white text-label-normal"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="w-full flex flex-col px-6 pt-10 pb-4 rounded-lg bg-white">
        <table className="w-full text-left border-collapse">
          <thead className="flex bg-background-neutral text-label-neutral text-body-2 px-4 py-3 gap-4 rounded-t-lg">
            <tr>
              <th className="w-[135.5px] text-left">유형</th>
              <th className="w-[400px] text-left">신고 내용</th>
              <th className="w-[135.5px] text-left">신고 사유</th>
              <th className="w-[135.5px] text-left">상태</th>
              <th className="w-[135.5px] text-left">신고 일자</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-normal h-[600px] rounded-b-lg">
            {reports.map((report) => (
              <tr key={report.reportId} className="px-4 py-3 text-body-1 text-label-normal border-b border-line-normal h-[60px]">
                {/* 신고 유형 */}
                <td className="flex gap-[2px]">
                  {report.type}
                </td>

                {/* 내용 */}
                <td className="flex gap-2 items-center justify-center whitespace-nowrap"
                  onClick={() => navigate(`/executive/report/${report.reportId}`, { state: { report } })}
                >
                  {report.content}
                  <img src="/icons/goto.svg" alt="goto" className="w-5 h-5" />
                </td>
                {/* 사유 */}
                <td>
                  {report.content}
                </td>

                {/* 상태: 공통 StatusBadge 컴포넌트 활용 */}
                <td >
                  <StatusBadge status={report.ReportStatus} />
                </td>

                {/* 신고일자: 2025.06.20 형식으로 변환 */}
                <td>
                  {report.reportedAt.split('T')[0].replaceAll('-', '.')}
                </td>

              </tr>
            ))}

            {/* 데이터가 없을 경우 처리 */}
            {reports.length === 0 && (
              <tr>
                <td colSpan={5} className="py-20 text-center text-label-neutral text-body-2">
                  조회된 신고가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex justify-center mt-10">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages} // 데이터 양에 따라 계산된 값
            onPageChange={(p) => {
              setCurrentPage(p);
              window.scrollTo({ top: 350, behavior: 'smooth' });
            }}
          />
        </div> 
      </div>
      
    </div>
  )
}