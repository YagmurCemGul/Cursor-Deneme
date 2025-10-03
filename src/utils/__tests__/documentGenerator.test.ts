import { DocumentGenerator } from '../documentGenerator';
import { CVData } from '../../types';

describe('DocumentGenerator.generateProfessionalFileName', () => {
  const baseCv: CVData = {
    personalInfo: {
      firstName: 'Ada',
      middleName: '',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      linkedInUsername: '',
      portfolioUrl: '',
      githubUsername: '',
      whatsappLink: '',
      phoneNumber: '',
      countryCode: '',
      summary: '',
    },
    skills: [],
    experience: [],
    education: [],
    certifications: [],
    projects: [],
    customQuestions: [],
  };

  it('creates CV filename with underscores and date', () => {
    const file = DocumentGenerator.generateProfessionalFileName(baseCv, 'cv', 'pdf');
    expect(file).toMatch(/^Ada_Lovelace_Resume_\d{4}-\d{2}-\d{2}\.pdf$/);
  });

  it('creates cover letter filename with underscores and date', () => {
    const file = DocumentGenerator.generateProfessionalFileName(baseCv, 'cover-letter', 'docx');
    expect(file).toMatch(/^Ada_Lovelace_CoverLetter_\d{4}-\d{2}-\d{2}\.docx$/);
  });

  it('sanitizes whitespace in names', () => {
    const cv: CVData = {
      ...baseCv,
      personalInfo: { ...baseCv.personalInfo, firstName: 'Ada Marie', lastName: 'von  Lovelace' },
    };
    const file = DocumentGenerator.generateProfessionalFileName(cv, 'cv', 'pdf');
    expect(file).toMatch(/^Ada_Marie_von__Lovelace_Resume_\d{4}-\d{2}-\d{2}\.pdf$/);
  });
});
