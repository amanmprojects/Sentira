"use client";

import { useState, memo } from "react";
import { motion } from "framer-motion";
import {
    ComposableMap,
    Geographies,
    Geography,
    ZoomableGroup,
    Marker,
} from "react-simple-maps";

const INDIA_TOPO_JSON = "https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson";

// State-wise bias data (mock data for demonstration)
const STATE_BIAS_DATA: Record<string, { bias: number; sentiment: "high" | "medium" | "low" | "neutral"; hotspots: number }> = {
    // High bias states (red zones)
    "Uttar Pradesh": { bias: 89, sentiment: "high", hotspots: 5 },
    "Bihar": { bias: 85, sentiment: "high", hotspots: 4 },
    "West Bengal": { bias: 82, sentiment: "high", hotspots: 3 },
    "Maharashtra": { bias: 78, sentiment: "high", hotspots: 4 },
    "Delhi": { bias: 92, sentiment: "high", hotspots: 6 },

    // Medium bias states (orange/cyan zones)
    "Rajasthan": { bias: 65, sentiment: "medium", hotspots: 2 },
    "Madhya Pradesh": { bias: 58, sentiment: "medium", hotspots: 2 },
    "Gujarat": { bias: 62, sentiment: "medium", hotspots: 2 },
    "Karnataka": { bias: 55, sentiment: "medium", hotspots: 1 },
    "Tamil Nadu": { bias: 52, sentiment: "medium", hotspots: 1 },
    "Andhra Pradesh": { bias: 48, sentiment: "medium", hotspots: 1 },
    "Telangana": { bias: 56, sentiment: "medium", hotspots: 2 },
    "Punjab": { bias: 68, sentiment: "medium", hotspots: 2 },
    "Haryana": { bias: 72, sentiment: "medium", hotspots: 3 },
    "Odisha": { bias: 45, sentiment: "medium", hotspots: 1 },

    // Low bias states (green zones)
    "Kerala": { bias: 22, sentiment: "low", hotspots: 0 },
    "Himachal Pradesh": { bias: 18, sentiment: "low", hotspots: 0 },
    "Uttarakhand": { bias: 25, sentiment: "low", hotspots: 0 },
    "Goa": { bias: 15, sentiment: "low", hotspots: 0 },
    "Sikkim": { bias: 12, sentiment: "low", hotspots: 0 },
    "Meghalaya": { bias: 20, sentiment: "low", hotspots: 0 },
    "Mizoram": { bias: 14, sentiment: "low", hotspots: 0 },
    "Nagaland": { bias: 16, sentiment: "low", hotspots: 0 },
    "Arunachal Pradesh": { bias: 18, sentiment: "low", hotspots: 0 },
    "Manipur": { bias: 35, sentiment: "neutral", hotspots: 1 },
    "Tripura": { bias: 28, sentiment: "neutral", hotspots: 0 },
    "Assam": { bias: 42, sentiment: "neutral", hotspots: 1 },
    "Jharkhand": { bias: 55, sentiment: "medium", hotspots: 1 },
    "Chhattisgarh": { bias: 38, sentiment: "neutral", hotspots: 1 },
    "Jammu and Kashmir": { bias: 75, sentiment: "high", hotspots: 3 },
    "Ladakh": { bias: 20, sentiment: "low", hotspots: 0 },
};

// Hot spot markers for high bias areas
const HOTSPOT_MARKERS = [
    { name: "Delhi NCR", coordinates: [77.1025, 28.7041], intensity: "critical" },
    { name: "Mumbai", coordinates: [72.8777, 19.0760], intensity: "high" },
    { name: "Kolkata", coordinates: [88.3639, 22.5726], intensity: "high" },
    { name: "Lucknow", coordinates: [80.9462, 26.8467], intensity: "critical" },
    { name: "Patna", coordinates: [85.1376, 25.5941], intensity: "high" },
    { name: "Hyderabad", coordinates: [78.4867, 17.3850], intensity: "medium" },
    { name: "Bengaluru", coordinates: [77.5946, 12.9716], intensity: "medium" },
    { name: "Jaipur", coordinates: [75.7873, 26.9124], intensity: "medium" },
];

interface IndiaMapProps {
    onStateHover?: (stateName: string | null, data: typeof STATE_BIAS_DATA[string] | null) => void;
    selectedState?: string | null;
    highlightedStates?: string[];
}

function IndiaMap({ onStateHover, selectedState, highlightedStates = [] }: IndiaMapProps) {
    const [hoveredState, setHoveredState] = useState<string | null>(null);
    const [tooltipContent, setTooltipContent] = useState<{ name: string; bias: number; x: number; y: number } | null>(null);

    const getStateColor = (stateName: string, isHovered: boolean) => {
        // AI Detected Relevance - High priority vibrant color
        if (highlightedStates.some(s => s.toLowerCase() === stateName.toLowerCase())) {
            return isHovered ? "rgba(255, 0, 128, 0.9)" : "rgba(255, 0, 128, 0.7)";
        }

        const data = STATE_BIAS_DATA[stateName];
        if (!data) return isHovered ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.03)";

        const bias = data.bias;

        // Mute the default mock colors to let AI highlights POP
        if (bias >= 75) {
            return isHovered ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.1)";
        } else if (bias >= 50) {
            return isHovered ? "rgba(0, 242, 254, 0.3)" : "rgba(0, 242, 254, 0.15)";
        } else if (bias >= 30) {
            return isHovered ? "rgba(79, 172, 254, 0.2)" : "rgba(79, 172, 254, 0.1)";
        } else {
            return isHovered ? "rgba(0, 230, 118, 0.2)" : "rgba(0, 230, 118, 0.05)";
        }
    };

    const getStrokeColor = (stateName: string) => {
        if (highlightedStates.some(s => s.toLowerCase() === stateName.toLowerCase())) {
            return "#ff0080";
        }

        const data = STATE_BIAS_DATA[stateName];
        if (!data) return "rgba(255,255,255,0.05)";

        if (data.bias >= 75) return "rgba(255, 255, 255, 0.2)";
        if (data.bias >= 50) return "rgba(0, 242, 254, 0.3)";
        return "rgba(255, 255, 255, 0.1)";
    };

    const handleMouseEnter = (geo: any, evt: React.MouseEvent) => {
        const stateName = geo.properties.NAME_1 || geo.properties.name || geo.properties.NAME;
        setHoveredState(stateName);
        const data = STATE_BIAS_DATA[stateName];
        if (data) {
            setTooltipContent({
                name: stateName,
                bias: data.bias,
                x: evt.clientX,
                y: evt.clientY,
            });
            onStateHover?.(stateName, data);
        }
    };

    const handleMouseLeave = () => {
        setHoveredState(null);
        setTooltipContent(null);
        onStateHover?.(null, null);
    };

    return (
        <div className="relative w-full h-full">
            <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                    scale: 1000,
                    center: [82, 22],
                }}
                style={{
                    width: "100%",
                    height: "100%",
                }}
            >
                <ZoomableGroup center={[82, 22]} zoom={1}>
                    <Geographies geography={INDIA_TOPO_JSON}>
                        {({ geographies }) =>
                            geographies.map((geo) => {
                                const stateName = geo.properties.NAME_1 || geo.properties.name || geo.properties.NAME;
                                const isHovered = hoveredState === stateName;

                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        onMouseEnter={(evt) => handleMouseEnter(geo, evt)}
                                        onMouseLeave={handleMouseLeave}
                                        style={{
                                            default: {
                                                fill: getStateColor(stateName, false),
                                                stroke: getStrokeColor(stateName),
                                                strokeWidth: 0.5,
                                                outline: "none",
                                                transition: "all 0.3s ease",
                                            },
                                            hover: {
                                                fill: getStateColor(stateName, true),
                                                stroke: getStrokeColor(stateName),
                                                strokeWidth: 1,
                                                outline: "none",
                                                cursor: "pointer",
                                            },
                                            pressed: {
                                                fill: getStateColor(stateName, true),
                                                stroke: "#fff",
                                                strokeWidth: 1.5,
                                                outline: "none",
                                            },
                                        }}
                                    />
                                );
                            })
                        }
                    </Geographies>

                    {/* Hotspot Markers - REMOVED */}
                    {/* {HOTSPOT_MARKERS.map((marker) => (
                        <Marker key={marker.name} coordinates={marker.coordinates as [number, number]}>
                            <motion.circle
                                r={marker.intensity === "critical" ? 6 : marker.intensity === "high" ? 5 : 4}
                                fill={
                                    marker.intensity === "critical"
                                        ? "#ff0080"
                                        : marker.intensity === "high"
                                            ? "#ff4444"
                                            : "#00f2fe"
                                }
                                fillOpacity={0.8}
                                stroke="#fff"
                                strokeWidth={1}
                                initial={{ scale: 0 }}
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            />
                            <motion.circle
                                r={marker.intensity === "critical" ? 12 : marker.intensity === "high" ? 10 : 8}
                                fill="none"
                                stroke={
                                    marker.intensity === "critical"
                                        ? "#ff0080"
                                        : marker.intensity === "high"
                                            ? "#ff4444"
                                            : "#00f2fe"
                                }
                                strokeWidth={2}
                                initial={{ scale: 0.5, opacity: 1 }}
                                animate={{ scale: 2, opacity: 0 }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeOut",
                                }}
                            />
                        </Marker>
                    ))} */}
                </ZoomableGroup>
            </ComposableMap>

            {/* Floating Tooltip */}
            {tooltipContent && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="fixed z-[200] pointer-events-none"
                    style={{
                        left: tooltipContent.x + 15,
                        top: tooltipContent.y - 10,
                    }}
                >
                    <div className="bg-[#0a0a0a] border border-white/20 rounded-xl px-4 py-3 shadow-2xl">
                        <p className="text-xs font-black uppercase tracking-wider text-white mb-1">
                            {tooltipContent.name}
                        </p>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${tooltipContent.bias >= 75 ? 'bg-aurora-rose' :
                                tooltipContent.bias >= 50 ? 'bg-aurora-cyan' :
                                    tooltipContent.bias >= 30 ? 'bg-aurora-blue' : 'bg-emerald-400'
                                }`} />
                            <span className={`text-sm font-bold ${tooltipContent.bias >= 75 ? 'text-aurora-rose' :
                                tooltipContent.bias >= 50 ? 'text-aurora-cyan' :
                                    tooltipContent.bias >= 30 ? 'text-aurora-blue' : 'text-emerald-400'
                                }`}>
                                {tooltipContent.bias}% Bias
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

export default memo(IndiaMap);

// Export state data for use in parent components
export { STATE_BIAS_DATA, HOTSPOT_MARKERS };
