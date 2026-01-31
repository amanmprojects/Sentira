// Mock Bias Data

export const BIAS_CATEGORIES = [
    {
        id: "cultural",
        label: "Cultural Bias",
        status: "Detected",
        strength: "Medium",
        percent: 62,
        desc: "Regional narrative framing with limited global socio-contextual representation."
    },
    {
        id: "sensitivity",
        label: "Sensitivity Bias",
        status: "Not Detected",
        strength: "Low",
        percent: 12,
        desc: "Content adheres to standard non-inflammatory sensitivity protocols."
    },
    {
        id: "emotional",
        label: "Emotional over-representation",
        status: "Detected",
        strength: "High",
        percent: 88,
        desc: "Significant reliance on high-intensity emotional markers to drive narrative weight."
    },
    {
        id: "framing",
        label: "Narrative Framing",
        status: "Detected",
        strength: "Medium",
        percent: 54,
        desc: "Selective inclusion of supporting visual data points to reinforce specific conclusions."
    }
] as const;

export const EMOTION_DISTRIBUTION = [
    { label: "Negative", value: 46, color: "bg-aurora-blue" },
    { label: "Neutral", value: 34, color: "bg-white/10" },
    { label: "Positive", value: 20, color: "bg-aurora-cyan" },
] as const;

export const PROTOCOL_CONFLICTS = [
    {
        category: "Emotional Manipulation",
        level: "High Risk",
        desc: "Frequent use of horror-based facial markers in an educational/informational setting."
    },
    {
        category: "Sensitivity Violation",
        level: "Clear",
        desc: "References to culturally specific identifiers without proper contextual neutralizers."
    }
] as const;

export const REGIONAL_SUMMARY = [
    { name: "North India", bias: 82, trend: "up" as const, states: ["Delhi", "Uttar Pradesh", "Punjab", "Haryana"] },
    { name: "East India", bias: 75, trend: "up" as const, states: ["West Bengal", "Bihar", "Odisha"] },
    { name: "West India", bias: 62, trend: "stable" as const, states: ["Maharashtra", "Gujarat", "Rajasthan"] },
    { name: "South India", bias: 38, trend: "down" as const, states: ["Karnataka", "Tamil Nadu", "Kerala", "Andhra Pradesh"] },
    { name: "Central India", bias: 48, trend: "stable" as const, states: ["Madhya Pradesh", "Chhattisgarh"] },
    { name: "Northeast", bias: 25, trend: "down" as const, states: ["Assam", "Meghalaya", "Manipur"] },
] as const;

export interface BiasCategory {
    id: string;
    label: string;
    status: string;
    strength: "Low" | "Medium" | "High" | "Critical";
    percent: number;
    desc: string;
}

// export type BiasCategory = typeof BIAS_CATEGORIES[number];
export type EmotionDistribution = typeof EMOTION_DISTRIBUTION[number];
export type ProtocolConflict = typeof PROTOCOL_CONFLICTS[number];
export type RegionalSummary = typeof REGIONAL_SUMMARY[number];
