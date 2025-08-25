import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { AnalyzedReview, Sentiment } from '../types';
import { DownloadIcon } from './IconComponents';

interface BatchExportControlsProps {
  results: AnalyzedReview[];
  summary: {
    sentimentCounts: Record<Sentiment, number>;
    averageScore: number;
    totalReviews: number;
  };
}

export const BatchExportControls: React.FC<BatchExportControlsProps> = ({ results, summary }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const createFileName = () => `batch-sentiment-analysis-${new Date().toISOString().split('T')[0]}`;

  const handleJsonExport = useCallback(() => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify({ summary, results }, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `${createFileName()}.json`;
    link.click();
    setIsOpen(false);
  }, [results, summary]);

  const handleCsvExport = useCallback(() => {
    let csvContent = "Source File,Overall Sentiment,Sentiment Score,Summary,Source Text,Error\r\n";
    results.forEach(r => {
      const row = [
        `"${r.sourceFileName.replace(/"/g, '""')}"`,
        `"${r.analysis.overallSentiment}"`,
        r.analysis.sentimentScore,
        `"${r.analysis.summary.replace(/"/g, '""')}"`,
        `"${r.sourceText.replace(/"/g, '""')}"`,
        `"${r.error ? r.error.replace(/"/g, '""') : ''}"`,
      ].join(",");
      csvContent += row + "\r\n";
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${createFileName()}.csv`);
    link.click();
    setIsOpen(false);
  }, [results]);

  const handlePdfExport = useCallback(() => {
    const doc = new jsPDF();
    const fileName = `${createFileName()}.pdf`;
    
    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Batch Sentiment Analysis Report", 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 28, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);
    
    // Summary Section
    let y = 45;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Analysis Summary", 20, y);
    y += 8;
    
    const summaryText = [
        `Total Reviews Analyzed: ${summary.totalReviews}`,
        `Average Sentiment Score: ${summary.averageScore.toFixed(3)}`,
        `Positive: ${summary.sentimentCounts.Positive || 0} (${((summary.sentimentCounts.Positive || 0) / summary.totalReviews * 100).toFixed(1)}%)`,
        `Negative: ${summary.sentimentCounts.Negative || 0} (${((summary.sentimentCounts.Negative || 0) / summary.totalReviews * 100).toFixed(1)}%)`,
        `Neutral: ${summary.sentimentCounts.Neutral || 0} (${((summary.sentimentCounts.Neutral || 0) / summary.totalReviews * 100).toFixed(1)}%)`,
        `Mixed: ${summary.sentimentCounts.Mixed || 0} (${((summary.sentimentCounts.Mixed || 0) / summary.totalReviews * 100).toFixed(1)}%)`,
    ];
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(summaryText, 20, y);
    y += (summaryText.length * 5) + 10;
    
    // Detailed Results Table
    autoTable(doc, {
      startY: y,
      head: [['File', 'Sentiment', 'Score', 'Summary']],
      body: results.map(r => [
          r.sourceFileName, 
          r.analysis.overallSentiment, 
          r.analysis.sentimentScore.toFixed(3),
          r.analysis.summary
      ]),
      theme: 'grid',
      headStyles: { fillColor: [15, 118, 110] },
      didParseCell: (data) => {
        if (data.column.dataKey === 'Summary') {
           // allow text wrapping
        }
      }
    });
    
    doc.save(fileName);
    setIsOpen(false);
  }, [results, summary]);

  const handleWordExport = useCallback(() => {
    const summaryHtml = `
      <h2>Analysis Summary</h2>
      <ul>
        <li><b>Total Reviews Analyzed:</b> ${summary.totalReviews}</li>
        <li><b>Average Sentiment Score:</b> ${summary.averageScore.toFixed(3)}</li>
        <li><b>Positive:</b> ${summary.sentimentCounts.Positive || 0}</li>
        <li><b>Negative:</b> ${summary.sentimentCounts.Negative || 0}</li>
        <li><b>Neutral:</b> ${summary.sentimentCounts.Neutral || 0}</li>
        <li><b>Mixed:</b> ${summary.sentimentCounts.Mixed || 0}</li>
      </ul>
    `;

    const resultsTable = `
      <h2>Detailed Results</h2>
      <table style="border-collapse: collapse; width: 100%;" border="1">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 8px; text-align: left;">File</th>
            <th style="padding: 8px; text-align: left;">Sentiment</th>
            <th style="padding: 8px; text-align: left;">Score</th>
            <th style="padding: 8px; text-align: left;">Summary</th>
            <th style="padding: 8px; text-align: left;">Full Text</th>
          </tr>
        </thead>
        <tbody>
          ${results.map(r => `
            <tr>
              <td style="padding: 8px;">${r.sourceFileName}</td>
              <td style="padding: 8px;">${r.analysis.overallSentiment}</td>
              <td style="padding: 8px;">${r.analysis.sentimentScore.toFixed(3)}</td>
              <td style="padding: 8px;">${r.analysis.summary.replace(/\n/g, '<br />')}</td>
              <td style="padding: 8px;">${r.sourceText.replace(/\n/g, '<br />')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Batch Analysis Report</title></head>
      <body>
        <h1>Batch Sentiment Analysis Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <hr/>
        ${summaryHtml}
        <hr/>
        ${resultsTable}
      </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${createFileName()}.doc`);
    link.click();
    setIsOpen(false);
  }, [results, summary]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700/50 border border-slate-600 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-teal-500 transition-all"
      >
        <DownloadIcon className="w-5 h-5" />
        <span>Export Report</span>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 origin-top-right bg-slate-800 border border-slate-700 rounded-md shadow-lg z-10 animate-fade-in">
          <div className="py-1">
            <button onClick={handleJsonExport} className="w-full text-left block px-4 py-2 text-sm text-slate-300 hover:bg-teal-600/30 hover:text-teal-300">Export as JSON</button>
            <button onClick={handleCsvExport} className="w-full text-left block px-4 py-2 text-sm text-slate-300 hover:bg-teal-600/30 hover:text-teal-300">Export as CSV</button>
            <button onClick={handlePdfExport} className="w-full text-left block px-4 py-2 text-sm text-slate-300 hover:bg-teal-600/30 hover:text-teal-300">Export as PDF</button>
            <button onClick={handleWordExport} className="w-full text-left block px-4 py-2 text-sm text-slate-300 hover:bg-teal-600/30 hover:text-teal-300">Export as Word (.doc)</button>
          </div>
        </div>
      )}
    </div>
  );
};
