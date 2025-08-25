import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';

// Set up the worker for pdf.js. This is required for it to work in a browser environment.
// @ts-ignore
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.4.168/build/pdf.worker.mjs`;

async function readDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

async function readPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  let textContent = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const text = await page.getTextContent();
    // Use 'str' from the item if it exists, otherwise it's a rich text element we can ignore.
    textContent += text.items.map(item => ('str' in item ? item.str : '')).join(' ');
    if (i < pdf.numPages) {
        textContent += '\n\n'; // Add space between pages for clarity
    }
  }
  return textContent;
}

async function readJson(file: File): Promise<string> {
  const fileText = await file.text();
  try {
    const json = JSON.parse(fileText);
    // Handle if the JSON is just a string
    if (typeof json === 'string') {
      return json;
    }
    // Handle if the JSON is an object with a "text" property
    if (typeof json === 'object' && json !== null && 'text' in json && typeof json.text === 'string') {
      return json.text;
    }
    throw new Error('JSON file must be a string or an object with a "text" property.');
  } catch (e) {
    // If JSON parsing fails, the file might just be a plain text file with a .json extension.
    // In this case, we can return the raw text.
    return fileText;
  }
}

async function readTxt(file: File): Promise<string> {
    return file.text();
}

export async function readFileContent(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'docx':
      return readDocx(file);
    case 'pdf':
      return readPdf(file);
    case 'json':
      return readJson(file);
    case 'txt':
      return readTxt(file);
    default:
      throw new Error(`Unsupported file type: .${extension}. Please upload a .docx, .pdf, .json or .txt file.`);
  }
}
