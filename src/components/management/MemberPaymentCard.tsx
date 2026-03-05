import { useState, useRef, useEffect } from "react";
import StatusBadge from "../../components/management/StatusBadge";
import { MemberStatus } from "../../types/member";

interface MemberPaymentCardProps {
  member: MemberStatus;
  duesId: number;
  onStatusChange: (duesId: number, memberOrgId: number, newStatus: string) => Promise<void>;
}

export default function MemberPaymentCard({ member, duesId, onStatusChange }: MemberPaymentCardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOptionClick = (newStatus: "PAID" | "UNPAID") => {
    if (member.paymentStatus !== newStatus) {
      onStatusChange(duesId, member.memberOrgId, member.paymentStatus);
    }
    setIsDropdownOpen(false);
  };

  return (
    <div className={`flex items-center justify-between p-4 gap-4 bg-white border rounded-xl transition-all relative ${
      member.paymentStatus === 'PAID' 
        ? 'border-line-active'
        : 'border-line-normal'
    }`}>
      <div className="flex items-center gap-3">
        <img src={member.profileImageUrl || "/icons/profile-gray.svg"} alt="profile" className="w-8 h-8 rounded-full" />
        <div className="flex items-center gap-[2px]">
          <span className="text-body-2sb text-label-normal">{member.nickname}</span>
          {/* 타입, 역할 별 뱃지 */}
          <img src="" alt="badge" className="w-5 h-5" />
          <span className="text-caption text-label-neutral">{member.roleTag}</span>
        </div>
      </div>

      <div className="relative" ref={dropdownRef}>
        {/* 기존 StatusBadge를 클릭하면 드롭다운 토글 */}
        <StatusBadge 
          status={member.paymentStatus} 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
        />

        {/* 드롭다운 메뉴 (시안 이미지 디자인 반영) */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-[100px] bg-white border border-line-normal rounded-xl z-50 overflow-hidden">
            <button 
              onClick={() => handleOptionClick("PAID")}
              className="w-full px-4 py-3 flex justify-center hover:bg-gray-50 border-b border-line-normal"
            >
              <StatusBadge status="PAID"  />
            </button>
            <button 
              onClick={() => handleOptionClick("UNPAID")}
              className="w-full px-4 py-3 flex justify-center hover:bg-gray-50"
            >
              <StatusBadge status="UNPAID" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}