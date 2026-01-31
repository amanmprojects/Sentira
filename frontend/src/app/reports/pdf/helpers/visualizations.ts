import { checkNewPage, getCurrentPosition, advancePosition } from './pagination';

export const drawEmotionSeismograph = (
    doc: any,
    emotion: string,
    values: number[],
    startY: number,
    width: number = 150,
    height: number = 40
): void => {
    if (!values || values.length === 0) return;

    const startX = 30;
    const barWidth = Math.max(0.5, (width - 10) / values.length);
    const gap = 0.5;
    const maxBarHeight = height - 15;
    
    checkNewPage(doc, height + 20);
    
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(245, 245, 250);
    doc.roundedRect(startX - 5, startY - 5, width, height, 2, 2, 'FD');
    
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(emotion, startX, startY - 2);
    
    const stats = calculateSeismographStats(values);
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(
        `Avg: ${Math.round(stats.avg * 100)}% | Max: ${Math.round(stats.max * 100)}% | Peaks: ${stats.highPeaks}`,
        startX + width - 60,
        startY - 2
    );
    
    let xPos = startX + 8;
    const barBaseY = startY + height - 12;
    
    values.forEach((value, index) => {
        const barHeight = Math.max(1, value * maxBarHeight);
        const barTopY = barBaseY - barHeight;
        
        const intensity = value;
        
        if (intensity >= 0.8) {
            doc.setFillColor(255, 80, 80);
        } else if (intensity >= 0.6) {
            doc.setFillColor(255, 160, 60);
        } else if (intensity >= 0.3) {
            doc.setFillColor(100, 200, 255);
        } else {
            doc.setFillColor(200, 200, 200);
        }
        
        doc.rect(xPos, barTopY, barWidth - gap, barHeight, 'F');
        
        xPos += barWidth;
    });
    
    doc.setDrawColor(180, 180, 180);
    doc.line(startX + 8, barBaseY, startX + width - 8, barBaseY);
    
    doc.setFontSize(6);
    doc.setTextColor(150, 150, 150);
    doc.text('0%', startX + 8, barBaseY + 2);
    doc.text('50%', startX + width / 2, barBaseY + 2);
    doc.text('100%', startX + width - 20, barBaseY + 2);
};

export const drawSimpleBarChart = (
    doc: any,
    data: { label: string; value: number }[],
    title: string,
    startY: number,
    width: number = 150,
    height: number = 80
): void => {
    checkNewPage(doc, height + 20);
    
    const startX = 30;
    const maxBarHeight = height - 25;
    const barWidth = 12;
    const gap = 8;
    
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(245, 245, 250);
    doc.roundedRect(startX - 5, startY - 5, width, height, 2, 2, 'FD');
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(title, startX, startY - 2);
    
    const maxValue = Math.max(...data.map(d => d.value));
    
    let xPos = startX + 15;
    const barBaseY = startY + height - 15;
    
    data.forEach((item, index) => {
        const barHeight = (item.value / maxValue) * maxBarHeight;
        const barTopY = barBaseY - barHeight;
        
        const normalizedValue = item.value / 100;
        if (normalizedValue >= 0.7) {
            doc.setFillColor(255, 80, 80);
        } else if (normalizedValue >= 0.4) {
            doc.setFillColor(100, 200, 255);
        } else {
            doc.setFillColor(100, 180, 100);
        }
        
        doc.roundedRect(xPos, barTopY, barWidth, barHeight, 1, 1, 'F');
        
        doc.setFontSize(7);
        doc.setTextColor(80, 80, 80);
        doc.text(Math.round(item.value) + '%', xPos + barWidth / 2 - 3, barTopY - 3);
        
        const wrappedLabel = doc.splitTextToSize(item.label, barWidth * 2);
        doc.setFontSize(5);
        doc.setTextColor(60, 60, 60);
        doc.text(wrappedLabel[0] || item.label, xPos + barWidth / 2 - 4, barBaseY + 8);
        
        xPos += barWidth + gap;
    });
};

export const drawBiasDonutChart = (
    doc: any,
    categories: { label: string; score: number; detected: boolean }[],
    startY: number,
    radius: number = 25,
    centerX: number = 60
): void => {
    checkNewPage(doc, radius * 2 + 30);
    
    const detectedCategories = categories.filter(c => c.detected);
    if (detectedCategories.length === 0) return;
    
    const totalScore = detectedCategories.reduce((sum, c) => sum + c.score, 0);
    let currentAngle = 0;
    
    detectedCategories.forEach((cat, index) => {
        const sliceAngle = (cat.score / totalScore) * 360;
        
        const startAngle = (currentAngle * Math.PI) / 180;
        const endAngle = ((currentAngle + sliceAngle) * Math.PI) / 180;
        
        const colors = [
            [255, 80, 80],
            [255, 160, 60],
            [100, 200, 255],
            [100, 180, 100],
            [180, 100, 200],
            [255, 120, 180]
        ];
        const colorIndex = index % colors.length;
        doc.setFillColor(...colors[colorIndex]);
        
        const x1 = centerX + radius * Math.cos(startAngle);
        const y1 = startY + radius * Math.sin(startAngle);
        const x2 = centerX + radius * Math.cos(endAngle);
        const y2 = startY + radius * Math.sin(endAngle);
        
        if (sliceAngle >= 180) {
            doc.moveTo(centerX, startY);
        }
        
        doc.circle(centerX, startY, radius, 'F');
        
        currentAngle += sliceAngle;
    });
    
    doc.setFillColor(255, 255, 255);
    doc.circle(centerX, startY, radius * 0.5, 'F');
    
    doc.setFontSize(14);
    doc.setTextColor(80, 80, 80);
    doc.text(Math.round(totalScore / detectedCategories.length) + '%', centerX - 10, startY + 5);
    
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('Avg Score', centerX - 15, startY + 14);
};

export const calculateSeismographStats = (values: number[]) => {
    if (!values || values.length === 0) {
        return { avg: 0, max: 0, min: 0, highPeaks: 0 };
    }
    
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const highPeaks = values.filter(v => v > 0.7).length;
    
    return { avg, max, min, highPeaks, count: values.length };
};
