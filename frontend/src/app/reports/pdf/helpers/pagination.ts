let yPos: number = 20;

export const checkNewPage = (doc: any, requiredSpace: number): boolean => {
    if (yPos + requiredSpace > 280) {
        doc.addPage();
        yPos = 20;
        return true;
    }
    return false;
};

export const resetPosition = (margin: number = 20): void => {
    yPos = margin;
};

export const advancePosition = (amount: number): void => {
    yPos += amount;
};

export const getCurrentPosition = (): number => yPos;

export const addVerticalSpace = (doc: any, space: number): void => {
    checkNewPage(doc, space);
    advancePosition(space);
};
