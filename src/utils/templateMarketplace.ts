import { SavedJobDescription } from '../types';

/**
 * Template Marketplace
 * Public sharing and discovery of job description templates
 */

export interface MarketplaceTemplate extends SavedJobDescription {
  author: string;
  authorId: string;
  downloads: number;
  rating: number;
  ratingCount: number;
  reviews: TemplateReview[];
  verified: boolean;
  featured: boolean;
  price: number; // 0 for free
  previewUrl?: string;
  screenshots?: string[];
  changelog?: ChangelogEntry[];
  compatibility?: string[];
  relatedTemplates?: string[];
}

export interface TemplateReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export interface MarketplaceFilter {
  category?: string;
  tags?: string[];
  minRating?: number;
  maxPrice?: number;
  verified?: boolean;
  featured?: boolean;
  searchQuery?: string;
  sortBy?: 'popular' | 'recent' | 'rating' | 'downloads';
}

/**
 * Publish template to marketplace
 */
export function publishToMarketplace(
  template: SavedJobDescription,
  authorInfo: { name: string; id: string },
  metadata: {
    price?: number;
    previewUrl?: string;
    screenshots?: string[];
  } = {}
): MarketplaceTemplate {
  return {
    ...template,
    author: authorInfo.name,
    authorId: authorInfo.id,
    downloads: 0,
    rating: 0,
    ratingCount: 0,
    reviews: [],
    verified: false,
    featured: false,
    price: metadata.price || 0,
    previewUrl: metadata.previewUrl,
    screenshots: metadata.screenshots || [],
    changelog: [{
      version: '1.0.0',
      date: new Date().toISOString(),
      changes: ['Initial release']
    }],
    compatibility: ['v2.0+'],
    relatedTemplates: [],
  };
}

/**
 * Search marketplace templates
 */
export function searchMarketplace(
  templates: MarketplaceTemplate[],
  filter: MarketplaceFilter
): MarketplaceTemplate[] {
  let results = [...templates];

  // Apply filters
  if (filter.category) {
    results = results.filter(t => t.category === filter.category);
  }

  if (filter.tags && filter.tags.length > 0) {
    results = results.filter(t => 
      t.tags?.some(tag => filter.tags!.includes(tag))
    );
  }

  if (filter.minRating !== undefined) {
    results = results.filter(t => t.rating >= filter.minRating!);
  }

  if (filter.maxPrice !== undefined) {
    results = results.filter(t => t.price <= filter.maxPrice!);
  }

  if (filter.verified) {
    results = results.filter(t => t.verified);
  }

  if (filter.featured) {
    results = results.filter(t => t.featured);
  }

  if (filter.searchQuery) {
    const query = filter.searchQuery.toLowerCase();
    results = results.filter(t =>
      t.name.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query) ||
      t.author.toLowerCase().includes(query) ||
      t.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }

  // Sort results
  switch (filter.sortBy) {
    case 'popular':
      results.sort((a, b) => b.downloads - a.downloads);
      break;
    case 'recent':
      results.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
    case 'rating':
      results.sort((a, b) => b.rating - a.rating);
      break;
    case 'downloads':
      results.sort((a, b) => b.downloads - a.downloads);
      break;
    default:
      // Default: featured first, then by rating
      results.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return b.rating - a.rating;
      });
  }

  return results;
}

/**
 * Rate a template
 */
export function rateTemplate(
  template: MarketplaceTemplate,
  rating: number,
  review?: TemplateReview
): MarketplaceTemplate {
  const newRatingCount = template.ratingCount + 1;
  const newRating = ((template.rating * template.ratingCount) + rating) / newRatingCount;

  const updated = {
    ...template,
    rating: newRating,
    ratingCount: newRatingCount,
  };

  if (review) {
    updated.reviews = [review, ...updated.reviews];
  }

  return updated;
}

/**
 * Download/install template
 */
export function downloadTemplate(
  template: MarketplaceTemplate
): { template: SavedJobDescription; success: boolean } {
  // Create local copy
  const localTemplate: SavedJobDescription = {
    id: crypto.randomUUID(),
    name: template.name,
    description: template.description,
    category: template.category,
    tags: template.tags,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usageCount: 0,
  };

  // Increment download count (would be done server-side in real implementation)
  template.downloads += 1;

  return {
    template: localTemplate,
    success: true,
  };
}

/**
 * Get template recommendations
 */
export function getRecommendations(
  userTemplates: SavedJobDescription[],
  marketplaceTemplates: MarketplaceTemplate[],
  limit: number = 5
): MarketplaceTemplate[] {
  // Analyze user's templates
  const userCategories = new Set(userTemplates.map(t => t.category).filter(Boolean));
  const userTags = new Set(userTemplates.flatMap(t => t.tags || []));

  // Score marketplace templates
  const scored = marketplaceTemplates.map(template => {
    let score = 0;

    // Category match
    if (template.category && userCategories.has(template.category)) {
      score += 5;
    }

    // Tag matches
    const matchingTags = template.tags?.filter(tag => userTags.has(tag)) || [];
    score += matchingTags.length * 2;

    // Quality factors
    score += template.rating * 2;
    score += Math.min(template.downloads / 100, 5);
    if (template.verified) score += 3;
    if (template.featured) score += 2;

    // Penalize if already downloaded (would check against user's library)
    // score -= userTemplates.some(t => t.name === template.name) ? 100 : 0;

    return { template, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.template);
}

/**
 * Get trending templates
 */
export function getTrendingTemplates(
  templates: MarketplaceTemplate[],
  days: number = 7
): MarketplaceTemplate[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  // In real implementation, would use actual download/view metrics over time
  // For now, use a combination of recent downloads and rating
  return templates
    .filter(t => new Date(t.updatedAt) > cutoffDate)
    .sort((a, b) => {
      const scoreA = a.downloads * 0.7 + a.rating * a.ratingCount * 0.3;
      const scoreB = b.downloads * 0.7 + b.rating * b.ratingCount * 0.3;
      return scoreB - scoreA;
    })
    .slice(0, 10);
}

/**
 * Validate template before publishing
 */
export function validateForPublishing(
  template: SavedJobDescription
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!template.name || template.name.trim().length < 3) {
    errors.push('Name must be at least 3 characters');
  }

  if (!template.description || template.description.trim().length < 50) {
    errors.push('Description must be at least 50 characters');
  }

  if (!template.category) {
    errors.push('Category is required');
  }

  if (!template.tags || template.tags.length === 0) {
    errors.push('At least one tag is required');
  }

  // Check for placeholder content
  if (template.description.includes('[INSERT') || 
      template.description.includes('TODO') ||
      template.description.includes('XXX')) {
    errors.push('Template contains placeholder content');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate template preview
 */
export function generatePreview(template: SavedJobDescription): string {
  const preview = template.description.substring(0, 300);
  return preview + (template.description.length > 300 ? '...' : '');
}

/**
 * Calculate template quality score
 */
export function calculateQualityScore(template: MarketplaceTemplate): number {
  let score = 0;

  // Rating contribution (0-40 points)
  score += template.rating * 8;

  // Review count contribution (0-20 points)
  score += Math.min(template.ratingCount / 5, 20);

  // Download count contribution (0-20 points)
  score += Math.min(template.downloads / 50, 20);

  // Content quality (0-20 points)
  const descLength = template.description.length;
  score += Math.min(descLength / 100, 10);
  score += template.tags ? Math.min(template.tags.length * 2, 10) : 0;

  // Verified bonus
  if (template.verified) score += 10;

  return Math.min(score, 100);
}

/**
 * Export template for sharing
 */
export function exportTemplateForSharing(template: MarketplaceTemplate): string {
  return JSON.stringify({
    ...template,
    exportedAt: new Date().toISOString(),
    exportVersion: '1.0',
  }, null, 2);
}

/**
 * Import shared template
 */
export function importSharedTemplate(jsonString: string): MarketplaceTemplate {
  try {
    const data = JSON.parse(jsonString);
    
    // Validate required fields
    if (!data.name || !data.description) {
      throw new Error('Invalid template format');
    }

    return data as MarketplaceTemplate;
  } catch (error) {
    throw new Error(`Failed to import template: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Report template for review
 */
export interface TemplateReport {
  templateId: string;
  reason: 'inappropriate' | 'misleading' | 'plagiarism' | 'poor-quality' | 'other';
  details: string;
  reporterId: string;
  createdAt: string;
}

export function reportTemplate(
  templateId: string,
  reason: TemplateReport['reason'],
  details: string,
  reporterId: string
): TemplateReport {
  return {
    templateId,
    reason,
    details,
    reporterId,
    createdAt: new Date().toISOString(),
  };
}
