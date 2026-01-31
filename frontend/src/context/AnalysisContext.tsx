"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { SentimentAnalysisResponse, EnhancedReelAnalysis } from "@/lib/api";

export type InputModality = "video" | "audio" | "text";

export interface AnalysisInput {
    modality: InputModality;
    content: string; // URL for video/audio, or text content
    file?: File | null;
}

interface AnalysisContextType {
    input: AnalysisInput;
    setInput: (input: AnalysisInput) => void;
    setModality: (modality: InputModality) => void;
    setContent: (content: string) => void;
    setFile: (file: File | null) => void;
    clearInput: () => void;
    isInputValid: boolean;

    // Convenience accessors
    modality: InputModality;
    text: string;
    videoUrl: string;
    setText: (text: string) => void;
    setVideoUrl: (url: string) => void;
    setAudioFile: (file: File | null) => void;
    setVideoFile: (file: File | null) => void;

    // Global Results
    sentimentData: SentimentAnalysisResponse | null;
    reelData: EnhancedReelAnalysis | null;
    setSentimentData: (data: SentimentAnalysisResponse | null) => void;
    setReelData: (data: EnhancedReelAnalysis | null) => void;
    isAnalyzing: boolean;
    setIsAnalyzing: (isAnalyzing: boolean) => void;

    // Auto-Pilot Mode
    isAutoPilot: boolean;
    setIsAutoPilot: (isAutoPilot: boolean) => void;
}

const defaultInput: AnalysisInput = {
    modality: "video",
    content: "",
    file: null,
};

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export function AnalysisProvider({ children }: { children: ReactNode }) {
    const [input, setInputState] = useState<AnalysisInput>(defaultInput);
    const [sentimentData, setSentimentData] = useState<SentimentAnalysisResponse | null>(null);
    const [reelData, setReelData] = useState<EnhancedReelAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isAutoPilot, setIsAutoPilot] = useState(false);

    const setInput = (newInput: AnalysisInput) => {
        setInputState(newInput);
    };

    const setModality = (modality: InputModality) => {
        setInputState((prev) => ({ ...prev, modality, content: "", file: null }));
        setSentimentData(null);
        setReelData(null);
    };

    const setContent = (content: string) => {
        setInputState((prev) => ({ ...prev, content }));
        setSentimentData(null);
        setReelData(null);
    };

    const setFile = (file: File | null) => {
        setInputState((prev) => ({ ...prev, file }));
        setSentimentData(null);
        setReelData(null);
    };

    const clearInput = () => {
        setInputState(defaultInput);
        setSentimentData(null);
        setReelData(null);
    };

    const setText = (text: string) => {
        setInputState((prev) => ({ ...prev, content: text }));
        setSentimentData(null);
        setReelData(null);
    };

    const setVideoUrl = (url: string) => {
        setInputState((prev) => ({ ...prev, content: url }));
        setSentimentData(null);
        setReelData(null);
    };

    const setAudioFile = (file: File | null) => {
        setInputState((prev) => ({ ...prev, file, modality: "audio" }));
        setSentimentData(null);
        setReelData(null);
    };

    const setVideoFile = (file: File | null) => {
        setInputState((prev) => ({ ...prev, file, modality: "video" }));
        setSentimentData(null);
        setReelData(null);
    };

    const isInputValid =
        input.content.trim().length > 0 || input.file !== null;

    return (
        <AnalysisContext.Provider
            value={{
                input,
                setInput,
                setModality,
                setContent,
                setFile,
                clearInput,
                isInputValid,
                modality: input.modality,
                text: input.content,
                videoUrl: input.content,
                setText,
                setVideoUrl,
                setAudioFile,
                setVideoFile,
                sentimentData,
                reelData,
                setSentimentData,
                setReelData,
                isAnalyzing,
                setIsAnalyzing,
                isAutoPilot,
                setIsAutoPilot,
            }}
        >
            {children}
        </AnalysisContext.Provider>
    );
}

export function useAnalysis() {
    const context = useContext(AnalysisContext);
    if (context === undefined) {
        throw new Error("useAnalysis must be used within an AnalysisProvider");
    }
    return context;
}
