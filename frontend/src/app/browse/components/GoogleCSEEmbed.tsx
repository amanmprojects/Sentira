"use client";

import { useEffect, useRef } from "react";

interface GoogleCSEEmbedProps {
    searchQuery: string;
}

declare global {
    interface Window {
        google?: {
            search?: {
                cse?: {
                    element?: {
                        render: (config: {
                            div: string;
                            tag: string;
                            gname: string;
                        }) => void;
                        getElement: (gname: string) => {
                            execute: (query: string) => void;
                            clearAllResults: () => void;
                        } | null;
                    };
                };
            };
        };
        __gcse?: {
            parsetags?: string;
            callback?: () => void;
        };
    }
}

export function GoogleCSEEmbed({ searchQuery }: GoogleCSEEmbedProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const scriptLoadedRef = useRef(false);
    const searchBoxRenderedRef = useRef(false);

    useEffect(() => {
        // Define callback before loading script
        window.__gcse = {
            parsetags: "explicit",
            callback: () => {
                if (containerRef.current && !searchBoxRenderedRef.current) {
                    window.google?.search?.cse?.element?.render({
                        div: "gcse-searchresults",
                        tag: "searchresults-only",
                        gname: "gsearch",
                    });
                    searchBoxRenderedRef.current = true;
                }
                // Execute initial search if query exists
                if (searchQuery) {
                    const element = window.google?.search?.cse?.element?.getElement("gsearch");
                    element?.execute(searchQuery);
                }
            },
        };

        // Load Google CSE script
        if (!scriptLoadedRef.current) {
            const script = document.createElement("script");
            script.src = "https://cse.google.com/cse.js?cx=4051216d64ca047b8";
            script.async = true;
            document.head.appendChild(script);
            scriptLoadedRef.current = true;
        }

        return () => {
            // Cleanup on unmount
        };
    }, []);

    // Execute search when query changes
    useEffect(() => {
        if (searchQuery && searchBoxRenderedRef.current) {
            const element = window.google?.search?.cse?.element?.getElement("gsearch");
            if (element) {
                element.execute(searchQuery);
            }
        }
    }, [searchQuery]);

    return (
        <div className="google-cse-container">
            <style jsx global>{`
                /* Dark mode overrides for Google CSE */
                .google-cse-container {
                    min-height: 700px;
                    width: 100%;
                }
                
                .gsc-control-cse {
                    background-color: transparent !important;
                    border: none !important;
                    padding: 0 !important;
                    font-family: inherit !important;
                    font-size: 16px !important;
                }
                
                .gsc-results-wrapper-overlay,
                .gsc-results-wrapper-visible {
                    background-color: transparent !important;
                }
                
                .gsc-webResult.gsc-result {
                    background-color: rgba(255, 255, 255, 0.02) !important;
                    border: 1px solid rgba(255, 255, 255, 0.05) !important;
                    border-radius: 1rem !important;
                    padding: 1.5rem !important;
                    margin-bottom: 1rem !important;
                }
                
                .gsc-webResult.gsc-result:hover {
                    background-color: rgba(255, 255, 255, 0.04) !important;
                    border-color: rgba(0, 242, 254, 0.2) !important;
                }
                
                .gs-title,
                .gs-title * {
                    color: #00f2fe !important;
                    text-decoration: none !important;
                    font-size: 18px !important;
                    font-weight: 600 !important;
                }
                
                .gs-title:hover,
                .gs-title:hover * {
                    color: #00d4e0 !important;
                }
                
                .gs-snippet {
                    color: rgba(255, 255, 255, 0.6) !important;
                    line-height: 1.6 !important;
                    font-size: 15px !important;
                    margin-top: 0.5rem !important;
                }
                
                .gs-visibleUrl,
                .gs-visibleUrl-short,
                .gs-visibleUrl-long {
                    color: rgba(255, 255, 255, 0.4) !important;
                    font-size: 13px !important;
                }
                
                .gsc-cursor-page {
                    background-color: rgba(255, 255, 255, 0.05) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    border-radius: 0.5rem !important;
                    color: rgba(255, 255, 255, 0.6) !important;
                    padding: 0.5rem 0.75rem !important;
                }
                
                .gsc-cursor-current-page {
                    background-color: #00f2fe !important;
                    border-color: #00f2fe !important;
                    color: #000 !important;
                    font-weight: bold !important;
                }
                
                .gsc-results .gsc-cursor-box {
                    text-align: center !important;
                    margin-top: 1.5rem !important;
                }
                
                .gsc-above-wrapper-area {
                    border: none !important;
                    padding: 0 !important;
                }
                
                .gsc-result-info {
                    color: rgba(255, 255, 255, 0.4) !important;
                    padding: 0 0 1rem 0 !important;
                }
                
                .gsc-orderby-container {
                    display: none !important;
                }
                
                .gcsc-find-more-on-google,
                .gcsc-find-more-on-google-root {
                    display: none !important;
                }
                
                .gsc-table-result {
                    background-color: transparent !important;
                }
                
                .gs-image-box,
                .gs-image {
                    border-radius: 0.5rem !important;
                }
                
                .gsc-thumbnail-inside,
                .gsc-url-top {
                    padding: 0 !important;
                }
                
                /* Hide Google branding */
                .gsc-branding {
                    display: none !important;
                }
                
                /* Scrollbar styling */
                .gsc-results::-webkit-scrollbar {
                    width: 6px;
                }
                
                .gsc-results::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.02);
                }
                
                .gsc-results::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                }
                
                /* Loading state */
                .gsc-loading-popup {
                    background-color: rgba(5, 5, 5, 0.9) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    border-radius: 1rem !important;
                }
                
                /* No results styling */
                .gs-no-results-result .gs-snippet {
                    color: rgba(255, 255, 255, 0.4) !important;
                    background-color: transparent !important;
                    border: none !important;
                }

                /* Popup/Overlay styling - Fix inverted colors */
                .gsc-modal-background-image,
                .gsc-resultsbox-visible,
                .gsc-completion-container {
                    filter: none !important;
                    background-color: rgba(5, 5, 5, 0.95) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    border-radius: 1rem !important;
                }

                .gsc-completion-title,
                .gsc-completion-snippet {
                    color: rgba(255, 255, 255, 0.8) !important;
                }

                .gs-result .gs-title b,
                .gs-result .gs-snippet b {
                    color: #00f2fe !important;
                }

                /* Image search popup */
                .gsc-imageResult-classic,
                .gsc-imageResult-popup {
                    background-color: rgba(5, 5, 5, 0.95) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    filter: none !important;
                }

                .gsc-imageResult-classic:hover {
                    border-color: rgba(0, 242, 254, 0.3) !important;
                }

                /* Refinement tabs */
                .gsc-tabsArea {
                    border: none !important;
                }

                .gsc-tabHeader {
                    background-color: transparent !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    border-radius: 9999px !important;
                    color: rgba(255, 255, 255, 0.6) !important;
                    margin-right: 0.5rem !important;
                    padding: 0.5rem 1rem !important;
                }

                .gsc-tabHeader.gsc-tabhActive {
                    background-color: #00f2fe !important;
                    border-color: #00f2fe !important;
                    color: #000 !important;
                }
            `}</style>
            <div ref={containerRef} id="gcse-searchresults"></div>
        </div>
    );
}
