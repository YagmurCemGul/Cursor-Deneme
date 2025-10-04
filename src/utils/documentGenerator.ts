import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  VerticalAlign,
  BorderStyle,
} from 'docx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import { CVData, ATSOptimization } from '../types';
import { getTemplateById, getDefaultTemplate } from '../data/cvTemplates';
import {
  getCoverLetterTemplateById,
  getDefaultCoverLetterTemplate,
} from '../data/coverLetterTemplates';

export class DocumentGenerator {
  static base64ToBuffer(base64: string): Uint8Array {
    // Remove data URL prefix if present
    const base64Data = base64.includes(',') ? base64.split(',')[1]! : base64;
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  static async generateDOCX(
    cvData: CVData,
    _optimizations: ATSOptimization[],
    fileName: string,
    _templateId?: string
  ): Promise<void> {
    // const template = templateId ? getTemplateById(templateId) || getDefaultTemplate() : getDefaultTemplate();
    // const _appliedOptimizations = optimizations.filter(o => o.applied);

    const headerChildren: (Paragraph | Table)[] = [];

    // If photo exists, create a header table with photo on the right
    if (cvData.personalInfo.photoDataUrl) {
      try {
        const photoBuffer = this.base64ToBuffer(cvData.personalInfo.photoDataUrl);

        headerChildren.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 70, type: WidthType.PERCENTAGE },
                    verticalAlign: VerticalAlign.CENTER,
                    children: [
                      new Paragraph({
                        text: `${cvData.personalInfo.firstName} ${cvData.personalInfo.middleName} ${cvData.personalInfo.lastName}`.trim(),
                        heading: HeadingLevel.HEADING_1,
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `${cvData.personalInfo.email} | ${cvData.personalInfo.countryCode}${cvData.personalInfo.phoneNumber}`,
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: cvData.personalInfo.linkedInUsername
                              ? `https://www.linkedin.com/in/${cvData.personalInfo.linkedInUsername}`
                              : '',
                          }),
                          cvData.personalInfo.githubUsername
                            ? new TextRun({
                                text: ` | https://github.com/${cvData.personalInfo.githubUsername}`,
                              })
                            : new TextRun({ text: '' }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    verticalAlign: VerticalAlign.CENTER,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new ImageRun({
                            type: 'png',
                            data: photoBuffer,
                            transformation: {
                              width: 100,
                              height: 100,
                            },
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          })
        );
      } catch (error) {
        console.error('Error adding photo to DOCX:', error);
        // Fallback to header without photo
        headerChildren.push(
          new Paragraph({
            text: `${cvData.personalInfo.firstName} ${cvData.personalInfo.middleName} ${cvData.personalInfo.lastName}`.trim(),
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `${cvData.personalInfo.email} | ${cvData.personalInfo.countryCode}${cvData.personalInfo.phoneNumber}`,
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: cvData.personalInfo.linkedInUsername
                  ? `https://www.linkedin.com/in/${cvData.personalInfo.linkedInUsername}`
                  : '',
              }),
              cvData.personalInfo.githubUsername
                ? new TextRun({
                    text: ` | https://github.com/${cvData.personalInfo.githubUsername}`,
                  })
                : new TextRun({ text: '' }),
            ],
            alignment: AlignmentType.CENTER,
          })
        );
      }
    } else {
      // No photo, use centered header
      headerChildren.push(
        new Paragraph({
          text: `${cvData.personalInfo.firstName} ${cvData.personalInfo.middleName} ${cvData.personalInfo.lastName}`.trim(),
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `${cvData.personalInfo.email} | ${cvData.personalInfo.countryCode}${cvData.personalInfo.phoneNumber}`,
            }),
          ],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: cvData.personalInfo.linkedInUsername
                ? `https://www.linkedin.com/in/${cvData.personalInfo.linkedInUsername}`
                : '',
            }),
            cvData.personalInfo.githubUsername
              ? new TextRun({
                  text: ` | https://github.com/${cvData.personalInfo.githubUsername}`,
                })
              : new TextRun({ text: '' }),
          ],
          alignment: AlignmentType.CENTER,
        })
      );
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            ...headerChildren,

            // Summary
            new Paragraph({ text: '' }),
            new Paragraph({
              text: 'SUMMARY',
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              text: cvData.personalInfo.summary,
            }),

            // Skills
            new Paragraph({ text: '' }),
            new Paragraph({
              text: 'SKILLS',
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              text: cvData.skills.join(' • '),
            }),

            // Experience
            new Paragraph({ text: '' }),
            new Paragraph({
              text: 'EXPERIENCE',
              heading: HeadingLevel.HEADING_2,
            }),

            ...cvData.experience.flatMap((exp) => [
              new Paragraph({
                children: [
                  new TextRun({ text: exp.title, bold: true }),
                  new TextRun({ text: ` | ${exp.company}` }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${exp.startDate} - ${exp.currentlyWorking ? 'Present' : exp.endDate || 'Present'} | ${exp.location}`,
                    italics: true,
                  }),
                ],
              }),
              ...exp.description
                .split('\n')
                .filter(Boolean)
                .map((line) => new Paragraph({ text: line })),
              new Paragraph({ text: '' }),
            ]),

            // Education
            new Paragraph({
              text: 'EDUCATION',
              heading: HeadingLevel.HEADING_2,
            }),

            ...cvData.education.flatMap((edu) => [
              new Paragraph({
                children: [new TextRun({ text: edu.school, bold: true })],
              }),
              new Paragraph({
                text: `${edu.degree} in ${edu.fieldOfStudy}`,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${edu.startDate} - ${edu.currentlyStudying ? 'Expected' : edu.endDate}`,
                    italics: true,
                  }),
                ],
              }),
              ...edu.description
                .split('\n')
                .filter(Boolean)
                .map((line) => new Paragraph({ text: line })),
              new Paragraph({ text: '' }),
            ]),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, fileName);
  }

  static async generatePDF(
    cvData: CVData,
    _optimizations: ATSOptimization[],
    fileName: string,
    templateId?: string
  ): Promise<void> {
    const template = templateId ? getTemplateById(templateId) : getDefaultTemplate();
    const doc = new jsPDF();
    let yPosition = 20;

    // Add profile photo if available
    if (cvData.personalInfo.photoDataUrl) {
      try {
        const photoSize = 30; // 30mm photo
        doc.addImage(cvData.personalInfo.photoDataUrl, 'JPEG', 180, 10, photoSize, photoSize);
      } catch (error) {
        console.error('Error adding photo to PDF:', error);
      }
    }

    // Apply template colors (jsPDF uses RGB values)
    const hexToRgb = (hex: string): [number, number, number] => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [parseInt(result[1]!, 16), parseInt(result[2]!, 16), parseInt(result[3]!, 16)]
        : [0, 0, 0];
    };

    // Name with template color
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    const primaryColor = hexToRgb(template.colors.primary);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    const fullName =
      `${cvData.personalInfo.firstName} ${cvData.personalInfo.middleName} ${cvData.personalInfo.lastName}`.trim();
    const headerAlign =
      template.layout.headerAlign === 'center'
        ? 'center'
        : template.layout.headerAlign === 'right'
          ? 'right'
          : 'left';
    // Adjust x position if photo is present
    const hasPhoto = cvData.personalInfo.photoDataUrl;
    const xPosition = hasPhoto
      ? 20
      : headerAlign === 'center'
        ? 105
        : headerAlign === 'right'
          ? 190
          : 20;
    const textAlign = hasPhoto ? 'left' : headerAlign;
    doc.text(fullName, xPosition, yPosition, { align: textAlign });

    yPosition += 10;

    // Contact Info - reset to text color
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const textColor = hexToRgb(template.colors.text);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    const contactLine1 = `${cvData.personalInfo.email} | ${cvData.personalInfo.countryCode}${cvData.personalInfo.phoneNumber}`;
    doc.text(contactLine1, xPosition, yPosition, { align: textAlign });

    yPosition += 5;

    if (cvData.personalInfo.linkedInUsername) {
      const contactLine2 = `linkedin.com/in/${cvData.personalInfo.linkedInUsername}`;
      if (cvData.personalInfo.githubUsername) {
        doc.text(
          `${contactLine2} | github.com/${cvData.personalInfo.githubUsername}`,
          xPosition,
          yPosition,
          { align: textAlign }
        );
      } else {
        doc.text(contactLine2, xPosition, yPosition, { align: textAlign });
      }
      yPosition += 10;
    } else {
      yPosition += 5;
    }

    // Add extra space if photo is present to avoid overlap
    if (hasPhoto && yPosition < 50) {
      yPosition = 50;
    }

    // Apply section spacing from template
    const sectionSpacing = template?.layout?.sectionSpacing || 16;

    // Summary - section headings use accent color
    if (cvData.personalInfo.summary) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      const accentColor = hexToRgb(template.colors.accent);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text('SUMMARY', 20, yPosition);
      yPosition += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      const summaryLines = doc.splitTextToSize(cvData.personalInfo.summary, 170);
      doc.text(summaryLines, 20, yPosition);
      yPosition += summaryLines.length * 5 + sectionSpacing;
    }

    // Skills
    if (cvData.skills.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      const accentColor = hexToRgb(template.colors.accent);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text('SKILLS', 20, yPosition);
      yPosition += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      const skillsText = cvData.skills.join(' • ');
      const skillsLines = doc.splitTextToSize(skillsText, 170);
      doc.text(skillsLines, 20, yPosition);
      yPosition += skillsLines.length * 5 + sectionSpacing;
    }

    // Experience
    if (cvData.experience.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      const accentColor = hexToRgb(template.colors.accent);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text('EXPERIENCE', 20, yPosition);
      yPosition += 7;

      cvData.experience.forEach((exp) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        const secondaryColor = hexToRgb(template.colors.secondary);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text(`${exp.title} | ${exp.company}`, 20, yPosition);
        yPosition += 5;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.text(
          `${exp.startDate} - ${exp.currentlyWorking ? 'Present' : exp.endDate || 'Present'} | ${exp.location}`,
          20,
          yPosition
        );
        yPosition += 6;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const descLines = doc.splitTextToSize(exp.description, 170);
        doc.text(descLines, 20, yPosition);
        yPosition += descLines.length * 5 + sectionSpacing;
      });
    }

    // Education
    if (cvData.education.length > 0) {
      if (yPosition > 230) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      const accentColor = hexToRgb(template.colors.accent);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text('EDUCATION', 20, yPosition);
      yPosition += 7;

      cvData.education.forEach((edu) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        const secondaryColor = hexToRgb(template.colors.secondary);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text(edu.school, 20, yPosition);
        yPosition += 5;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.text(`${edu.degree} in ${edu.fieldOfStudy}`, 20, yPosition);
        yPosition += 5;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.text(
          `${edu.startDate} - ${edu.currentlyStudying ? 'Expected' : edu.endDate}`,
          20,
          yPosition
        );
        yPosition += 8;
      });
    }

    doc.save(fileName);
  }

  static async generateCoverLetterDOCX(
    coverLetter: string,
    name: string,
    fileName: string,
    templateId?: string
  ): Promise<void> {
    const template = templateId
      ? getCoverLetterTemplateById(templateId)
      : getDefaultCoverLetterTemplate();

    // Split into lines and paragraphs
    const lines = coverLetter.split('\n');
    const paragraphs: Paragraph[] = [];

    // Add date if template includes it
    if (template.style.includeDate && lines[0]) {
      paragraphs.push(
        new Paragraph({
          text: lines[0],
          alignment:
            template.style.headerFormat === 'center'
              ? AlignmentType.CENTER
              : template.style.headerFormat === 'right'
                ? AlignmentType.RIGHT
                : AlignmentType.LEFT,
          spacing: { after: 200 },
        })
      );
      lines.shift();
    }

    // Process rest of the content
    let currentParagraph = '';
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim() || '';

      if (line === '') {
        if (currentParagraph) {
          // Check if it's a closing or signature
          const isClosing = currentParagraph.match(/^(Sincerely|Best regards|Regards|Thank you)/i);
          const isSignature = currentParagraph === name;

          const alignment =
            template.style.headerFormat === 'center' && (isClosing || isSignature)
              ? AlignmentType.CENTER
              : AlignmentType.LEFT;

          paragraphs.push(
            new Paragraph({
              text: currentParagraph,
              spacing: { after: template.style.paragraphSpacing * 20 },
              alignment: alignment,
            })
          );
          currentParagraph = '';
        }
      } else {
        currentParagraph += (currentParagraph ? ' ' : '') + line;
      }
    }

    // Add last paragraph if exists
    if (currentParagraph) {
      const isClosing = currentParagraph.match(/^(Sincerely|Best regards|Regards|Thank you)/i);
      const isSignature = currentParagraph === name;

      const alignment =
        template.style.headerFormat === 'center' && (isClosing || isSignature)
          ? AlignmentType.CENTER
          : AlignmentType.LEFT;

      paragraphs.push(
        new Paragraph({
          text: currentParagraph,
          spacing: { after: template.style.paragraphSpacing * 20 },
          alignment: alignment,
        })
      );
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440, // 1 inch
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
          },
          children: paragraphs,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, fileName);
  }

  static async generateCoverLetterPDF(
    coverLetter: string,
    name: string,
    fileName: string,
    templateId?: string
  ): Promise<void> {
    const template = templateId
      ? getCoverLetterTemplateById(templateId)
      : getDefaultCoverLetterTemplate();
    const doc = new jsPDF();
    let yPosition = 20;

    // Helper to convert hex to RGB
    const hexToRgb = (hex: string): [number, number, number] => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [parseInt(result[1]!, 16), parseInt(result[2]!, 16), parseInt(result[3]!, 16)]
        : [0, 0, 0];
    };

    // Set font based on template
    const fontFamily = (template.style.fontFamily || 'Arial').includes('Times')
      ? 'times'
      : (template.style.fontFamily || 'Arial').includes('Georgia')
        ? 'times'
        : (template.style.fontFamily || 'Arial').includes('Courier') ||
            (template.style.fontFamily || 'Arial').includes('monospace')
          ? 'courier'
          : 'helvetica';

    doc.setFont(fontFamily, 'normal');
    doc.setFontSize(template.style.fontSize);

    const textColor = hexToRgb(template.colors.text);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);

    // Parse and render content
    const lines = coverLetter.split('\n');
    let currentParagraph = '';

    const renderParagraph = (
      text: string,
      isDate = false,
      isClosing = false,
      isSignature = false
    ) => {
      if (!text.trim()) return;

      // Determine alignment
      let align: 'left' | 'center' | 'right' = 'left';
      if (template.style.headerFormat === 'center' && (isDate || isClosing || isSignature)) {
        align = 'center';
      } else if (template.style.headerFormat === 'right' && isDate) {
        align = 'right';
      }

      // Apply special formatting for signature
      if (isSignature || isClosing) {
        doc.setFont(fontFamily, isSignature ? 'bold' : 'italic');
      }

      const maxWidth = 170;
      const textLines = doc.splitTextToSize(text.trim(), maxWidth);

      // Check for page break
      if (yPosition + textLines.length * (template.style.fontSize * 0.5) > 280) {
        doc.addPage();
        yPosition = 20;
      }

      // Render lines
      const xPosition = align === 'center' ? 105 : align === 'right' ? 190 : 20;
      doc.text(textLines, xPosition, yPosition, { align });

      yPosition +=
        textLines.length * (template.style.fontSize * 0.5) + template.style.paragraphSpacing;

      // Reset font
      if (isSignature || isClosing) {
        doc.setFont(fontFamily, 'normal');
      }
    };

    // Process content
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim() || '';

      if (line === '') {
        if (currentParagraph) {
          // Determine paragraph type
          const isDate = i < 3 && !!currentParagraph.match(/\d{4}/);
          const isClosing = !!currentParagraph.match(
            /^(Sincerely|Best regards|Regards|Thank you)/i
          );
          const isSignature = currentParagraph === name;

          renderParagraph(currentParagraph, isDate, isClosing, isSignature);
          currentParagraph = '';
        }
      } else {
        currentParagraph += (currentParagraph ? ' ' : '') + line;
      }
    }

    // Render last paragraph
    if (currentParagraph) {
      const isClosing = !!currentParagraph.match(/^(Sincerely|Best regards|Regards|Thank you)/i);
      const isSignature = currentParagraph === name;
      renderParagraph(currentParagraph, false, isClosing, isSignature);
    }

    doc.save(fileName);
  }

  static generateProfessionalFileName(
    cvData: CVData,
    type: 'cv' | 'cover-letter',
    extension: string
  ): string {
    const firstName = cvData.personalInfo.firstName.replace(/\s+/g, '_');
    const lastName = cvData.personalInfo.lastName.replace(/\s+/g, '_');
    const date = new Date().toISOString().split('T')[0];

    if (type === 'cv') {
      return `${firstName}_${lastName}_Resume_${date}.${extension}`;
    } else {
      return `${firstName}_${lastName}_CoverLetter_${date}.${extension}`;
    }
  }
}
