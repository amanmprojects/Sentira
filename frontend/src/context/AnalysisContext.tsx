"use client";

import { createContext, useContext, useState, ReactNode } from "react";

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
}

const defaultInput: AnalysisInput = {
    modality: "video",
    content: "",
    file: null,
};

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export function AnalysisProvider({ children }: { children: ReactNode }) {
    const [input, setInputState] = useState<AnalysisInput>(defaultInput);

    const setInput = (newInput: AnalysisInput) => {
        setInputState(newInput);
    };

    const setModality = (modality: InputModality) => {
        setInputState((prev) => ({ ...prev, modality, content: "", file: null }));
    };

    const setContent = (content: string) => {
        setInputState((prev) => ({ ...prev, content }));
    };

    const setFile = (file: File | null) => {
        setInputState((prev) => ({ ...prev, file }));
    };

    const clearInput = () => {
        setInputState(defaultInput);
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
