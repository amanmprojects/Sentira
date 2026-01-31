import { Globe, Twitter, Youtube, Instagram, Facebook } from "lucide-react";
import { PlatformConfig } from "../types";

export const PLATFORMS: PlatformConfig[] = [
    { id: "all", label: "All Platforms", icon: <Globe size={16} />, color: "#00f2fe" },
    { id: "twitter", label: "Twitter/X", icon: <Twitter size={16} />, color: "#1DA1F2" },
    { id: "youtube-shorts", label: "YouTube Shorts", icon: <Youtube size={16} />, color: "#FF0000" },
    { id: "instagram", label: "Instagram Reels", icon: <Instagram size={16} />, color: "#E4405F" },
    { id: "facebook", label: "Facebook", icon: <Facebook size={16} />, color: "#1877F2" },
];
