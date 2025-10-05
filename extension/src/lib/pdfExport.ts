import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface PDFExportOptions {
  filename?: string;
  format?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  quality?: number; // 0.1 to 1.0
  margin?: number; // in mm
}

export async function exportToPDF(
  elementId: string,
  options: PDFExportOptions = {}
): Promise<void> {
  const {
    filename = 'CV_Resume.pdf',
    format = 'a4',
    orientation = 'portrait',
    quality = 0.95,
    margin = 10,
  } = options;

  try {
    // Get the element to export
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    // Show loading state
    const loadingElement = showLoadingOverlay();

    // Capture the element as canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // PDF dimensions in mm
    const pdfWidth = format === 'a4' ? 210 : 215.9; // A4 or Letter
    const pdfHeight = format === 'a4' ? 297 : 279.4;

    // Calculate dimensions
    const imgWidth = pdfWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Create PDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format,
    });

    // Check if content fits on one page
    const pageHeight = pdfHeight - margin * 2;
    let heightLeft = imgHeight;
    let position = margin;

    // Add image to PDF
    const imgData = canvas.toDataURL('image/png', quality);
    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add more pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save the PDF
    pdf.save(filename);

    // Hide loading
    hideLoadingOverlay(loadingElement);

    return Promise.resolve();
  } catch (error) {
    console.error('PDF Export Error:', error);
    throw error;
  }
}

export async function exportToImage(
  elementId: string,
  filename: string = 'CV_Resume.png',
  format: 'png' | 'jpeg' = 'png'
): Promise<void> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    }, `image/${format}`, 0.95);

  } catch (error) {
    console.error('Image Export Error:', error);
    throw error;
  }
}

function showLoadingOverlay(): HTMLDivElement {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    color: white;
  `;

  overlay.innerHTML = `
    <div style="text-align: center;">
      <div style="
        width: 50px;
        height: 50px;
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin: 0 auto 20px;
      "></div>
      <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">
        Generating PDF...
      </div>
      <div style="font-size: 14px; opacity: 0.8;">
        This may take a few seconds
      </div>
    </div>
    <style>
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
  `;

  document.body.appendChild(overlay);
  return overlay;
}

function hideLoadingOverlay(overlay: HTMLDivElement): void {
  setTimeout(() => {
    document.body.removeChild(overlay);
  }, 500);
}

// Generate filename from profile data
export function generatePDFFilename(
  firstName?: string,
  lastName?: string,
  jobTitle?: string
): string {
  const parts = [firstName, lastName].filter(Boolean);
  const name = parts.length > 0 ? parts.join('_') : 'Resume';
  const job = jobTitle ? `_${jobTitle.replace(/\s+/g, '_')}` : '';
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  return `${name}${job}_CV_${date}.pdf`.replace(/[^a-zA-Z0-9_\-\.]/g, '');
}

// Print CV directly
export function printCV(elementId: string): void {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow pop-ups to print');
    return;
  }

  const styles = Array.from(document.styleSheets)
    .map((styleSheet) => {
      try {
        return Array.from(styleSheet.cssRules)
          .map((rule) => rule.cssText)
          .join('\n');
      } catch (e) {
        return '';
      }
    })
    .join('\n');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print CV</title>
        <style>
          ${styles}
          @media print {
            body { margin: 0; padding: 0; }
            @page { margin: 0.5in; }
          }
        </style>
      </head>
      <body>
        ${element.outerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  
  // Wait for content to load then print
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
}
