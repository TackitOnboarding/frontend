import React from 'react'
import { Link } from 'react-router-dom'
import PostCard from './posts/PostCard'
import PaginationGroup from './Pagination'


type BaseItem = {
  id: number
  title: string
  content: string
  writer: string
  createdAt: string
  tags?: string[]
  imageUrl?: string | null
  profileImageUrl?: string | null
}

interface SectionListProps {
  title: string
  iconSrc: string
  items: BaseItem[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  moreTo: string
  showWriteButton?: boolean
}

export default function SectionList({
  title,
  iconSrc,
  items,
  currentPage,
  totalPages,
  onPageChange,
  moreTo,
  showWriteButton = false,
}: SectionListProps) {
  return (
    <section className="w-full max-w-[1100px] mb-[100px]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="flex items-center text-title-1 gap-2"><img src={iconSrc} alt={`${title} 아이콘`} className="w-10 h-10" />{title}</h3>
        {showWriteButton && (
          <Link
            to={`/write/${moreTo.replace('/', '')}`}
            className="flex items-center gap-2 px-[18px] py-[10px] bg-[#5D7CFF] text-white rounded-[12px] hover:bg-blue-600 transition-colors shadow-sm"
          >
            <span className="text-xl font-light">+</span>
            <span className="text-[16px] font-semibold">글쓰기</span>
          </Link>
        )}
      </div>

      <div className="overflow-hidden bg-white rounded-xl shadow-sm">
        <div className="px-7 py-3 flex flex-col">
          {items.length === 0 ? (
            <EmptyRow />
          ) : (
            <>
              <div className="flex flex-col">
                {items.map((p, index) => (
                  <Link
                    key={p.id}
                    to={`${moreTo}/${p.id}`}
                    className="block hover:bg-gray-50 transition-colors"
                    style={{ textDecoration: 'none' }}
                  >
                    <PostCard
                      id={p.id}
                      title={p.title}
                      content={p.content}
                      writer={p.writer}
                      createdAt={p.createdAt}
                      tags={p.tags ?? []}
                      imageUrl={p.imageUrl ?? null}
                      profileImageUrl={p.profileImageUrl ?? '/icons/mypage-icon.svg'}
                      previewLines={1}
                      borderColor={index === items.length - 1 ? 'transparent' : 'var(--line-normal)'}
                    />
                  </Link>
                ))}
              </div>

              {/* 하단 페이지네이션 */}
              <div className="flex justify-center mt-10">
                <PaginationGroup
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={onPageChange}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

function EmptyRow() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[250px] py-10">
      <img
        src="/icons/empty.svg"
        alt="데이터 없음"
        className="w-20 h-20 mb-4 opacity-40"
      />
      <p className="text-body-1sb text-label-neutral">
        아직 작성한 글이 없어요!
      </p>
    </div>
  )
}