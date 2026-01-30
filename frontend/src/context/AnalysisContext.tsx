"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Modality = "text" | "audio" | "video";

interface AnalysisContextType {
    modality: Modality;
    setModality: (m: Modality) => void;
    text: string;
    setText: (t: string) => void;
    audioFile: File | null;
    setAudioFile: (f: File | null) => void;
    videoFile: File | null;
    setVideoFile: (f: File | null) => void;
    videoUrl: string;
    setVideoUrl: (url: string) => void;
    clearAll: () => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
    const [modality, setModality] = useState<Modality>("text");
    const [text, setText] = useState("");
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState("");

    const clearAll = () => {
        setText("");
        setAudioFile(null);
        setVideoFile(null);
        setVideoUrl("");
    };

    return (
        <AnalysisContext.Provider
            value={{
                modality,
                setModality,
                text,
                setText,
                audioFile,
                setAudioFile,
                videoFile,
                setVideoFile,
                videoUrl,
                setVideoUrl,
                clearAll,
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
