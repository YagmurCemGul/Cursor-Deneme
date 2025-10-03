import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import { CVData, ATSOptimization } from '../types';

export class DocumentGenerator {
  static async generateDOCX(cvData: CVData, _optimizations: ATSOptimization[], fileName: string): Promise<void> {
    // const _appliedOptimizations = optimizations.filter(o => o.applied);
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Header with name
          new Paragraph({
            text: `${cvData.personalInfo.firstName} ${cvData.personalInfo.middleName} ${cvData.personalInfo.lastName}`.trim(),
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          
          // Contact Information
          new Paragraph({
            children: [
              new TextRun({
                text: `${cvData.personalInfo.email} | ${cvData.personalInfo.countryCode}${cvData.personalInfo.phoneNumber}`,
              })
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
              cvData.personalInfo.githubUsername ? new TextRun({
                text: ` | https://github.com/${cvData.personalInfo.githubUsername}`,
              }) : new TextRun({ text: '' }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          
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
          
          ...cvData.experience.flatMap(exp => [
            new Paragraph({
              children: [
                new TextRun({ text: exp.title, bold: true }),
                new TextRun({ text: ` | ${exp.company}` }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ 
                  text: `${exp.startDate} - ${exp.endDate} | ${exp.location}`,
                  italics: true 
                }),
              ],
            }),
            ...exp.description.split('\n').filter(Boolean).map(line => new Paragraph({ text: line })),
            new Paragraph({ text: '' }),
          ]),
          
          // Education
          new Paragraph({
            text: 'EDUCATION',
            heading: HeadingLevel.HEADING_2,
          }),
          
          ...cvData.education.flatMap(edu => [
            new Paragraph({
              children: [
                new TextRun({ text: edu.school, bold: true }),
              ],
            }),
            new Paragraph({
              text: `${edu.degree} in ${edu.fieldOfStudy}`,
            }),
            new Paragraph({
              children: [
                new TextRun({ 
                  text: `${edu.startDate} - ${edu.endDate}`,
                  italics: true 
                }),
              ],
            }),
            ...edu.description.split('\n').filter(Boolean).map(line => new Paragraph({ text: line })),
            new Paragraph({ text: '' }),
          ]),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, fileName);
  }

  static async generatePDF(cvData: CVData, _optimizations: ATSOptimization[], fileName: string): Promise<void> {
    const doc = new jsPDF();
    let yPosition = 20;
    
    // Name
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    const fullName = `${cvData.personalInfo.firstName} ${cvData.personalInfo.middleName} ${cvData.personalInfo.lastName}`.trim();
    doc.text(fullName, 105, yPosition, { align: 'center' });
    
    yPosition += 10;
    
    // Contact Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const contactLine1 = `${cvData.personalInfo.email} | ${cvData.personalInfo.countryCode}${cvData.personalInfo.phoneNumber}`;
    doc.text(contactLine1, 105, yPosition, { align: 'center' });
    
    yPosition += 5;
    
    if (cvData.personalInfo.linkedInUsername) {
      const contactLine2 = `linkedin.com/in/${cvData.personalInfo.linkedInUsername}`;
      if (cvData.personalInfo.githubUsername) {
        doc.text(`${contactLine2} | github.com/${cvData.personalInfo.githubUsername}`, 105, yPosition, { align: 'center' });
      } else {
        doc.text(contactLine2, 105, yPosition, { align: 'center' });
      }
      yPosition += 10;
    } else {
      yPosition += 5;
    }
    
    // Summary
    if (cvData.personalInfo.summary) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('SUMMARY', 20, yPosition);
      yPosition += 7;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const summaryLines = doc.splitTextToSize(cvData.personalInfo.summary, 170);
      doc.text(summaryLines, 20, yPosition);
      yPosition += summaryLines.length * 5 + 5;
    }
    
    // Skills
    if (cvData.skills.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('SKILLS', 20, yPosition);
      yPosition += 7;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const skillsText = cvData.skills.join(' • ');
      const skillsLines = doc.splitTextToSize(skillsText, 170);
      doc.text(skillsLines, 20, yPosition);
      yPosition += skillsLines.length * 5 + 5;
    }
    
    // Experience
    if (cvData.experience.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('EXPERIENCE', 20, yPosition);
      yPosition += 7;
      
      cvData.experience.forEach((exp) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`${exp.title} | ${exp.company}`, 20, yPosition);
        yPosition += 5;
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.text(`${exp.startDate} - ${exp.endDate} | ${exp.location}`, 20, yPosition);
        yPosition += 6;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const descLines = doc.splitTextToSize(exp.description, 170);
        doc.text(descLines, 20, yPosition);
        yPosition += descLines.length * 5 + 5;
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
      doc.text('EDUCATION', 20, yPosition);
      yPosition += 7;
      
      cvData.education.forEach((edu) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(edu.school, 20, yPosition);
        yPosition += 5;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`${edu.degree} in ${edu.fieldOfStudy}`, 20, yPosition);
        yPosition += 5;
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.text(`${edu.startDate} - ${edu.endDate}`, 20, yPosition);
        yPosition += 8;
      });
    }
    
    doc.save(fileName);
  }

  static async generateCoverLetterDOCX(coverLetter: string, _name: string, fileName: string): Promise<void> {
    const paragraphs = coverLetter.split('\n\n').map(para => 
      new Paragraph({
        text: para.trim(),
        spacing: { after: 200 },
      })
    );

    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs,
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, fileName);
  }

  static async generateCoverLetterPDF(coverLetter: string, _name: string, fileName: string): Promise<void> {
    const doc = new jsPDF();
    let yPosition = 20;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const paragraphs = coverLetter.split('\n\n');
    
    paragraphs.forEach((para) => {
      const lines = doc.splitTextToSize(para.trim(), 170);
      
      if (yPosition + lines.length * 5 > 280) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.text(lines, 20, yPosition);
      yPosition += lines.length * 5 + 8;
    });
    
    doc.save(fileName);
  }

  static generateProfessionalFileName(cvData: CVData, type: 'cv' | 'cover-letter', extension: string): string {
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
