"use client";

import { useState, useCallback } from 'react';

const useCopyToClipboard = () => {
    const [isCopied, setIsCopied] = useState(false);

    const copyToClipboard = useCallback((text: string) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                setIsCopied(true);
                setTimeout(() => {
                    setIsCopied(false);
                }, 2000);
            }).catch((err) => {
                console.error('Failed to copy: ', err);
            });
        } else {
            console.error('Clipboard API is not available.');
        }
    }, []);

    return {isCopied, copyToClipboard};
};

export default useCopyToClipboard;
