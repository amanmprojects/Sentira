import {
    Twitter,
    Youtube,
    Instagram,
    Facebook,
    Globe,
    Smile,
    Meh,
    Frown,
} from "lucide-react";

export function getPlatformIcon(platform: string) {
    switch (platform) {
        case "twitter":
            return <Twitter size={14} />;
        case "youtube-shorts":
            return <Youtube size={14} />;
        case "instagram":
            return <Instagram size={14} />;
        case "facebook":
            return <Facebook size={14} />;
        default:
            return <Globe size={14} />;
    }
}

export function getPlatformColor(platform: string) {
    switch (platform) {
        case "twitter":
            return "#1DA1F2";
        case "youtube-shorts":
            return "#FF0000";
        case "instagram":
            return "#E4405F";
        case "facebook":
            return "#1877F2";
        default:
            return "#00f2fe";
    }
}

export function getSentimentIcon(label: string) {
    switch (label) {
        case "positive":
            return <Smile size={14} className="text-green-400" />;
        case "negative":
            return <Frown size={14} className="text-red-400" />;
        default:
            return <Meh size={14} className="text-gray-400" />;
    }
}

export function getSentimentColor(label: string) {
    switch (label) {
        case "positive":
            return "text-green-400 border-green-400/30";
        case "negative":
            return "text-red-400 border-red-400/30";
        default:
            return "text-gray-400 border-gray-400/30";
    }
}

export function getBiasColor(level: string) {
    switch (level) {
        case "low":
            return "text-green-400 border-green-400/30";
        case "medium":
            return "text-orange-400 border-orange-400/30";
        case "high":
            return "text-red-400 border-red-400/30";
        default:
            return "text-gray-400 border-gray-400/30";
    }
}
