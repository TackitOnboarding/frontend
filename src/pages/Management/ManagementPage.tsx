import HomeBar from "../../components/HomeBar";
import Footer from "../../components/layouts/Footer";
import { useState } from "react";
import MemberManageSection from "./MemberManageSection";
import ExecutiveManageSection from "./ExecutiveManageSection";
import ReportManageSection from "./ReportManageSection";

type ManagementTab = 'MEMBER' | 'EXECUTIVE' | 'REPORT';

export default function ManagementPage() {
  const [activeTab, setActiveTab] = useState<ManagementTab>('MEMBER');
  
  const tabConfigs: Record<ManagementTab, { title: string; iconName: string }> = {
    MEMBER: {title: "회원 관리", iconName: "Person"},
    EXECUTIVE: {title: "회비 관리", iconName: "inventory"},
    REPORT: {title: "신고 관리", iconName: "error"},
  }

  return (
    <>
    <HomeBar/>
    <div className="flex w-full border border-line-normal">
      <aside className="flex flex-col w-[282px] border-r border-line-normal">
        <div className="flex flex-col w-full px-5 pt-8 gap-2">
          {(Object.keys(tabConfigs) as ManagementTab[]).map((type) => {
            const isActive = activeTab === type;
            const iconPath = `/icons/${tabConfigs[type].iconName}-${isActive ? 'black' : 'gray'}.svg`;
            return (
              <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`flex items-center px-4 py-3 gap-2 rounded-m ${
                isActive
                  ? 'bg-background-neutral text-label-normal text-body-1sb'
                  : 'bg-white text-label-assistive text-body-1'
              }`}
              >
                <img src={iconPath} alt={tabConfigs[type].title} className="w-5 h-5"/>
                {tabConfigs[type].title}
              </button>
            )    
          })}
        </div>
      </aside>

      <main className="flex flex-col items-start px-9 pt-8 pb-10 gap-10 w-full bg-background-neutral">
        <div className="w-full">
          {{
            MEMBER: < MemberManageSection />,
            EXECUTIVE: <ExecutiveManageSection />,
            REPORT: <ReportManageSection />,
          }[activeTab]}
        </div>
      </main>
    </div>

    <Footer/>
    </>
  )
}