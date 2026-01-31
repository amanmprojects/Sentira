export const setRiskColor = (doc: any, level: string): void => {
    switch(level?.toLowerCase()) {
        case 'high':
        case 'critical':
            doc.setTextColor(200, 0, 0);
            break;
        case 'medium':
            doc.setTextColor(200, 100, 0);
            break;
        case 'low':
            doc.setTextColor(0, 150, 0);
            break;
        default:
            doc.setTextColor(100, 100, 100);
    }
};

export const setVerificationColor = (doc: any, status: string): void => {
    switch(status) {
        case 'verified_true':
            doc.setTextColor(0, 150, 0);
            break;
        case 'verified_false':
            doc.setTextColor(200, 0, 0);
            break;
        case 'mixed':
        case 'uncertain':
            doc.setTextColor(200, 150, 0);
            break;
        default:
            doc.setTextColor(100, 100, 100);
    }
};
