import { CVData, ATSOptimization } from '../types';

/**
 * Utility for applying ATS optimizations to CV data
 */

/**
 * Apply optimizations to CV data by replacing original text with optimized text
 */
export function applyCVOptimizations(cvData: CVData, optimizations: ATSOptimization[]): CVData {
  // Create a deep copy to avoid mutations
  const optimizedCV: CVData = JSON.parse(JSON.stringify(cvData));

  // Get only applied optimizations
  const appliedOptimizations = optimizations.filter((opt) => opt.applied);

  // Apply each optimization
  appliedOptimizations.forEach((opt) => {
    if (!opt.originalText || !opt.optimizedText) return;

    // Apply to personal info summary
    if (optimizedCV.personalInfo.summary) {
      optimizedCV.personalInfo.summary = replaceText(
        optimizedCV.personalInfo.summary,
        opt.originalText,
        opt.optimizedText
      );
    }

    // Apply to experiences
    optimizedCV.experience.forEach((exp) => {
      if (exp.title) {
        exp.title = replaceText(exp.title, opt.originalText, opt.optimizedText);
      }
      if (exp.description) {
        exp.description = replaceText(exp.description, opt.originalText, opt.optimizedText);
      }
      if (exp.company) {
        exp.company = replaceText(exp.company, opt.originalText, opt.optimizedText);
      }
    });

    // Apply to education
    optimizedCV.education.forEach((edu) => {
      if (edu.degree) {
        edu.degree = replaceText(edu.degree, opt.originalText, opt.optimizedText);
      }
      if (edu.fieldOfStudy) {
        edu.fieldOfStudy = replaceText(edu.fieldOfStudy, opt.originalText, opt.optimizedText);
      }
      if (edu.description) {
        edu.description = replaceText(edu.description, opt.originalText, opt.optimizedText);
      }
      if (edu.activities) {
        edu.activities = replaceText(edu.activities, opt.originalText, opt.optimizedText);
      }
    });

    // Apply to certifications
    optimizedCV.certifications.forEach((cert) => {
      if (cert.name) {
        cert.name = replaceText(cert.name, opt.originalText, opt.optimizedText);
      }
      if (cert.description) {
        cert.description = replaceText(cert.description, opt.originalText, opt.optimizedText);
      }
    });

    // Apply to projects
    optimizedCV.projects.forEach((proj) => {
      if (proj.name) {
        proj.name = replaceText(proj.name, opt.originalText, opt.optimizedText);
      }
      if (proj.description) {
        proj.description = replaceText(proj.description, opt.originalText, opt.optimizedText);
      }
    });

    // Apply to skills (exact match for skills)
    optimizedCV.skills = optimizedCV.skills.map((skill) =>
      skill.toLowerCase() === opt.originalText.toLowerCase() ? opt.optimizedText : skill
    );
  });

  return optimizedCV;
}

/**
 * Helper function to replace text (case-insensitive, first occurrence)
 */
function replaceText(text: string, originalText: string, optimizedText: string): string {
  if (!text || !originalText || !optimizedText) return text;

  // Try exact match first
  if (text.includes(originalText)) {
    return text.replace(originalText, optimizedText);
  }

  // Try case-insensitive match
  const regex = new RegExp(escapeRegExp(originalText), 'i');
  return text.replace(regex, optimizedText);
}

/**
 * Escape special regex characters
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Get a preview of what will be changed by applying optimizations
 */
export function getOptimizationPreview(
  cvData: CVData,
  optimization: ATSOptimization
): { section: string; field: string; before: string; after: string }[] {
  const changes: { section: string; field: string; before: string; after: string }[] = [];

  // Check personal info
  if (
    cvData.personalInfo.summary &&
    cvData.personalInfo.summary.includes(optimization.originalText)
  ) {
    changes.push({
      section: 'Personal Info',
      field: 'Summary',
      before: cvData.personalInfo.summary,
      after: replaceText(
        cvData.personalInfo.summary,
        optimization.originalText,
        optimization.optimizedText
      ),
    });
  }

  // Check experiences
  cvData.experience.forEach((exp) => {
    if (exp.description && exp.description.includes(optimization.originalText)) {
      changes.push({
        section: 'Experience',
        field: `${exp.title} at ${exp.company}`,
        before: exp.description,
        after: replaceText(exp.description, optimization.originalText, optimization.optimizedText),
      });
    }
  });

  // Check education
  cvData.education.forEach((edu) => {
    if (edu.description && edu.description.includes(optimization.originalText)) {
      changes.push({
        section: 'Education',
        field: `${edu.degree} at ${edu.school}`,
        before: edu.description,
        after: replaceText(edu.description, optimization.originalText, optimization.optimizedText),
      });
    }
  });

  return changes;
}
