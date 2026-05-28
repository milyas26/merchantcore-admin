import api from "@/interceptors/axiosInterceptor";

export type AnnouncementType = "INFO" | "WARNING" | "PROMO" | "MAINTENANCE";

export interface Announcement {
  id: string;
  title: string;
  description: string | null;
  link: string | null;
  type: AnnouncementType;
  createdBy: string;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetAnnouncementsResponse {
  success: boolean;
  data: Announcement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface AnnouncementResponse {
  success: boolean;
  data: Announcement;
}

export interface GetAnnouncementsQuery {
  page?: number;
  limit?: number;
  q?: string;
  type?: AnnouncementType;
  active?: boolean;
  sortBy?: "title" | "type" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export interface CreateAnnouncementRequest {
  title: string;
  description?: string;
  link?: string;
  type?: AnnouncementType;
  isActive?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
}

export interface UpdateAnnouncementRequest extends Partial<CreateAnnouncementRequest> {}

export class AnnouncementApi {
  private static instance: AnnouncementApi;
  private constructor() {}

  static getInstance(): AnnouncementApi {
    if (!AnnouncementApi.instance) AnnouncementApi.instance = new AnnouncementApi();
    return AnnouncementApi.instance;
  }

  async getAnnouncements(query?: GetAnnouncementsQuery): Promise<GetAnnouncementsResponse> {
    const params = new URLSearchParams();
    if (query) {
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params.append(k, String(v));
      });
    }
    const res = await api.get<GetAnnouncementsResponse>(`/announcements?${params}`);
    return res.data;
  }

  async getAnnouncementById(id: string): Promise<AnnouncementResponse> {
    const res = await api.get<AnnouncementResponse>(`/announcements/${id}`);
    return res.data;
  }

  async createAnnouncement(data: CreateAnnouncementRequest): Promise<AnnouncementResponse> {
    const res = await api.post<AnnouncementResponse>("/announcements", data);
    return res.data;
  }

  async updateAnnouncement(id: string, data: UpdateAnnouncementRequest): Promise<AnnouncementResponse> {
    const res = await api.put<AnnouncementResponse>(`/announcements/${id}`, data);
    return res.data;
  }

  async deleteAnnouncement(id: string): Promise<{ success: boolean }> {
    const res = await api.delete<{ success: boolean }>(`/announcements/${id}`);
    return res.data;
  }
}

export const announcementApi = AnnouncementApi.getInstance();
