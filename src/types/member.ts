export interface MemberStatus {
  memberOrgId: number;
  nickname: string;
  roleTag: string;
  profileImageUrl: string;
  paymentStatus: "PAID" | "UNPAID";
}