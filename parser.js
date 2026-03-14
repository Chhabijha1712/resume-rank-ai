const ResumeParser = (() => {
  // Set PDF.js worker if available
  if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  async function parsePDF(file) {
    if (typeof pdfjsLib === 'undefined') {
      throw new Error('PDF support requires internet connection. Please upload a .TXT file instead, or host this app on a web server.');
    }
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pages = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      pages.push(content.items.map(item => item.str).join(' '));
    }
    return pages.join('\n\n');
  }

  async function parseDOCX(file) {
    if (typeof mammoth === 'undefined') {
      throw new Error('DOCX support requires internet connection. Please upload a .TXT file instead, or host this app on a web server.');
    }
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  async function parseTXT(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read text file'));
      reader.readAsText(file);
    });
  }

  async function parseFile(file) {
    const name = file.name.toLowerCase();
    let text;
    if (name.endsWith('.pdf')) text = await parsePDF(file);
    else if (name.endsWith('.docx')) text = await parseDOCX(file);
    else if (name.endsWith('.txt')) text = await parseTXT(file);
    else throw new Error(`Unsupported file format: ${file.name}`);
    return text.replace(/\r\n/g, '\n').replace(/\t/g, ' ').replace(/ {3,}/g, '  ').replace(/\n{4,}/g, '\n\n\n').trim();
  }

  async function parseAndExtract(file) {
    const text = await parseFile(file);
    const extracted = await NLPEngine.extractAll(text);
    extracted.fileName = file.name;
    extracted.fileSize = file.size;
    return extracted;
  }

  return { parseFile, parseAndExtract };
})();
