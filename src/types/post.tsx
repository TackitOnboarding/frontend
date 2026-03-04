// 게시글 작성 / 수정 요청·응답

export type PostCreateReq = {
  title: string
  content: string
  tagIds: number[]
  isAnonymous: boolean,
}

export type PostCreateRes = {
  id: number
  writer: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  imageUrl?: string | null
}

export type PostUpdateReq = PostCreateReq & {
  removeImage: boolean
}

// 공통 게시글 타입
export type Post = {
  id: number
  writer: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  imageUrl?: string | null
  profileImageUrl?: string | null
}

// 목록 응답 타입 (전체 / 태그별)
export type ApiPostAll = {
  id: number
  writer: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  imageUrl?: string | null
  profileImageUrl?: string | null
}

export type ApiPostByTag = {
  postId: number
  writer: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  imageUrl?: string | null
  profileImageUrl?: string | null
}

export type ListRespAll = {
  page: number
  content: ApiPostAll[]
  size: number
  totalElements: number
  totalPages: number
}

export type ListRespByTag = {
  page: number
  content: ApiPostByTag[]
  size: number
  totalElements: number
  totalPages: number
}
