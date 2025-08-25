import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { SentimentAnalysisResult } from '../types';
import { DownloadIcon } from './IconComponents';

interface ExportControlsProps {
  data: SentimentAnalysisResult;
}

export const ExportControls: React.FC<ExportControlsProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleJsonExport = useCallback(() => {
    if (!data) return;
    try {
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(data, null, 2)
      )}`;
      const link = document.createElement("a");
      link.href = jsonString;
      link.download = "sentiment-analysis.json";
      link.click();
    } catch (error) {
      console.error("Failed to export JSON:", error);
      alert("An error occurred while exporting to JSON. Please check the console for details.");
    } finally {
      setIsOpen(false);
    }
  }, [data]);

  const handleCsvExport = useCallback(() => {
    if (!data) return;
    try {
      let csvContent = "";
      csvContent += "Overall Sentiment,Sentiment Score,Summary,Emotion,Emotion Score\r\n";

      if (data.emotions.length > 0) {
          data.emotions.forEach(emotion => {
              const row = [
                  `"${data.overallSentiment}"`,
                  data.sentimentScore,
                  `"${data.summary.replace(/"/g, '""')}"`,
                  `"${emotion.name}"`,
                  emotion.score
              ].join(",");
              csvContent += row + "\r\n";
          });
      } else {
          const row = [
              `"${data.overallSentiment}"`,
              data.sentimentScore,
              `"${data.summary.replace(/"/g, '""')}"`,
              "N/A",
              "N/A"
          ].join(",");
          csvContent += row + "\r\n";
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "sentiment-analysis.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
        console.error("Failed to export CSV:", error);
        alert("An error occurred while exporting to CSV. Please check the console for details.");
    } finally {
        setIsOpen(false);
    }
  }, [data]);

  const handlePdfExport = useCallback(() => {
    if (!data) return;
    try {
      const doc = new jsPDF();
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("Sentiment Analysis Report", 105, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      const generationDate = `Generated on: ${new Date().toLocaleString()}`;
      doc.text(generationDate, 105, 28, { align: 'center' });

      doc.setLineWidth(0.5);
      doc.line(20, 35, 190, 35);

      let y = 45;
      
      const addSection = (title: string, content: string | number) => {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
          doc.setTextColor(0);
          doc.text(title, 20, y);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(40);
          const contentStr = typeof content === 'number' ? content.toFixed(3) : content;
          const splitContent = doc.splitTextToSize(contentStr, 170);
          doc.text(splitContent, 20, y + 7);
          const contentHeight = (splitContent.length * 5);
          y += 10 + contentHeight;
      };

      addSection("Overall Sentiment:", data.overallSentiment);
      addSection("Sentiment Score:", data.sentimentScore);
      addSection("Summary:", data.summary);

      if (data.emotions.length > 0) {
          autoTable(doc, {
              startY: y,
              head: [['Emotion', 'Score']],
              body: data.emotions.map(e => [e.name, e.score.toFixed(3)]),
              theme: 'grid',
              headStyles: { fillColor: [15, 118, 110] }, // teal-700
          });
      }

      doc.save("sentiment-analysis.pdf");
    } catch (error) {
        console.error("Failed to export PDF:", error);
        alert("An error occurred while exporting to PDF. Please check the console for details.");
    } finally {
        setIsOpen(false);
    }
  }, [data]);

  const handleWordExport = useCallback(() => {
    if (!data) return;
    try {
        const emotionsTable = data.emotions.length > 0
            ? `
                <table style="border-collapse: collapse; width: 100%;" border="1">
                    <thead>
                        <tr style="background-color: #f2f2f2;">
                            <th style="padding: 8px; text-align: left;">Emotion</th>
                            <th style="padding: 8px; text-align: left;">Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.emotions.map(e => `
                            <tr>
                                <td style="padding: 8px;">${e.name}</td>
                                <td style="padding: 8px;">${e.score.toFixed(3)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `
            : '<p>No specific emotions detected.</p>';

        const htmlContent = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>Sentiment Analysis Report</title></head>
            <body>
                <h1>Sentiment Analysis Report</h1>
                <p>Generated on: ${new Date().toLocaleString()}</p>
                <hr/>
                <h2>Overall Sentiment</h2>
                <p>${data.overallSentiment}</p>
                <h2>Sentiment Score</h2>
                <p>${data.sentimentScore.toFixed(3)}</p>
                <h2>Summary</h2>
                <p>${data.summary.replace(/\n/g, '<br />')}</p>
                <h2>Emotion Breakdown</h2>
                ${emotionsTable}
            </body>
            </html>
        `;
        
        const blob = new Blob([htmlContent], { type: 'application/msword' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "sentiment-analysis.doc");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } catch (error) {
        console.error("Failed to export Word document:", error);
        alert("An error occurred while exporting to Word. Please check the console for details.");
    } finally {
        setIsOpen(false);
    }
  }, [data]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
        <span>Export</span>
      </button>
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 origin-top-right bg-slate-800 border border-slate-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10 animate-fade-in"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
        >
          <div className="py-1" role="none">
            <button
              onClick={handleJsonExport}
              className="w-full text-left block px-4 py-2 text-sm text-slate-300 hover:bg-teal-600/30 hover:text-teal-300"
              role="menuitem"
            >
              Export as JSON
            </button>
            <button
              onClick={handleCsvExport}
              className="w-full text-left block px-4 py-2 text-sm text-slate-300 hover:bg-teal-600/30 hover:text-teal-300"
              role="menuitem"
            >
              Export as CSV
            </button>
            <button
              onClick={handlePdfExport}
              className="w-full text-left block px-4 py-2 text-sm text-slate-300 hover:bg-teal-600/30 hover:text-teal-300"
              role="menuitem"
            >
              Export as PDF
            </button>
             <button
              onClick={handleWordExport}
              className="w-full text-left block px-4 py-2 text-sm text-slate-300 hover:bg-teal-600/30 hover:text-teal-300"
              role="menuitem"
            >
              Export as Word (.doc)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
