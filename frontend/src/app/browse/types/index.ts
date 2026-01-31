export interface SearchResult {
    id: string;
    platform: "twitter" | "youtube-shorts" | "instagram" | "facebook";
    contentType: "text" | "video" | "image";
    url: string;
    author: {
        username: string;
        displayName: string;
        avatarUrl: string;
        verified?: boolean;
        subscribers?: number;
    };
    content: {
        text: string;
        title?: string;
        thumbnailUrl?: string;
        videoUrl?: string;
        duration?: number;
    };
    metadata: {
        publishedAt: string;
        views: number;
        likes: number;
        shares?: number;
        comments?: number;
        retweets?: number;
    };
    quickAnalysis: {
        sentiment: {
            score: number;
            label: "positive" | "neutral" | "negative";
        };
        biasLevel: "low" | "medium" | "high";
        toxicity: "none" | "low" | "medium" | "high";
        language: string;
    };
}

export type Platform = "twitter" | "youtube-shorts" | "instagram" | "facebook" | "all";
export type ViewMode = "grid" | "list";

export interface PlatformConfig {
    id: Platform;
    label: string;
    icon: React.ReactNode;
    color: string;
}
