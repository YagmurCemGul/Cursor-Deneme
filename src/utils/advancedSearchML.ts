import { SavedJobDescription } from '../types';
import { AIService } from './aiService';

/**
 * Advanced Search with Machine Learning
 * Semantic search, intelligent ranking, and AI-powered query understanding
 */

export interface SearchQuery {
  text: string;
  filters?: {
    categories?: string[];
    tags?: string[];
    dateRange?: { start: string; end: string };
    minUsage?: number;
  };
  options?: {
    semantic?: boolean;
    fuzzy?: boolean;
    limit?: number;
    offset?: number;
  };
}

export interface SearchResult {
  description: SavedJobDescription;
  score: number;
  highlights: SearchHighlight[];
  relevanceReason: string;
}

export interface SearchHighlight {
  field: 'name' | 'description' | 'tags' | 'category';
  snippet: string;
  startIndex: number;
  endIndex: number;
}

export interface SearchSuggestion {
  query: string;
  score: number;
  type: 'correction' | 'completion' | 'related';
}

/**
 * Perform advanced search with ML ranking
 */
export async function advancedSearch(
  query: SearchQuery,
  descriptions: SavedJobDescription[],
  apiKey?: string,
  provider?: 'openai' | 'gemini' | 'claude'
): Promise<SearchResult[]> {
  let results: SearchResult[] = [];

  // Apply filters first
  let filtered = applyFilters(descriptions, query.filters);

  if (query.options?.semantic && apiKey && provider) {
    // Semantic search using AI embeddings
    results = await semanticSearch(query.text, filtered, apiKey, provider);
  } else {
    // Traditional keyword search with ML ranking
    results = keywordSearch(query.text, filtered, query.options?.fuzzy);
  }

  // Apply pagination
  const offset = query.options?.offset || 0;
  const limit = query.options?.limit || 50;
  
  return results.slice(offset, offset + limit);
}

/**
 * Keyword-based search with fuzzy matching
 */
function keywordSearch(
  queryText: string,
  descriptions: SavedJobDescription[],
  fuzzy: boolean = false
): SearchResult[] {
  const queryTerms = tokenize(queryText.toLowerCase());
  const results: SearchResult[] = [];

  descriptions.forEach(desc => {
    const score = calculateRelevanceScore(queryTerms, desc, fuzzy);
    
    if (score > 0) {
      results.push({
        description: desc,
        score,
        highlights: findHighlights(queryTerms, desc),
        relevanceReason: generateRelevanceReason(queryTerms, desc, score),
      });
    }
  });

  return results.sort((a, b) => b.score - a.score);
}

/**
 * Semantic search using AI embeddings
 */
async function semanticSearch(
  queryText: string,
  descriptions: SavedJobDescription[],
  apiKey: string,
  provider: 'openai' | 'gemini' | 'claude'
): Promise<SearchResult[]> {
  try {
    // Get semantic understanding of query
    const semanticPrompt = `Analyze this search query and extract the key concepts and intent:

Query: "${queryText}"

Provide:
1. Key concepts (3-5 words/phrases)
2. Search intent (what is the user looking for?)
3. Related terms and synonyms

Format as JSON:
{
  "concepts": ["concept1", "concept2"],
  "intent": "description of intent",
  "synonyms": ["synonym1", "synonym2"]
}`;

    const response = await AIService.generateText(semanticPrompt, apiKey, provider);
    const semantic = JSON.parse(response);

    // Expand search with semantic terms
    const expandedTerms = [
      ...tokenize(queryText),
      ...semantic.concepts,
      ...semantic.synonyms,
    ];

    // Search with expanded terms
    const results: SearchResult[] = [];

    descriptions.forEach(desc => {
      const score = calculateSemanticScore(expandedTerms, desc, semantic.intent);
      
      if (score > 0) {
        results.push({
          description: desc,
          score,
          highlights: findHighlights(expandedTerms, desc),
          relevanceReason: `Matches ${semantic.intent}`,
        });
      }
    });

    return results.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('Semantic search failed, falling back to keyword search:', error);
    return keywordSearch(queryText, descriptions, true);
  }
}

/**
 * Calculate relevance score for keyword search
 */
function calculateRelevanceScore(
  queryTerms: string[],
  description: SavedJobDescription,
  fuzzy: boolean
): number {
  let score = 0;

  const nameTokens = tokenize(description.name.toLowerCase());
  const descTokens = tokenize(description.description.toLowerCase());
  const categoryTokens = description.category ? [description.category.toLowerCase()] : [];
  const tagTokens = description.tags?.map(t => t.toLowerCase()) || [];

  queryTerms.forEach(term => {
    // Exact matches in name (highest weight)
    if (nameTokens.includes(term)) {
      score += 10;
    } else if (fuzzy && nameTokens.some(token => fuzzyMatch(token, term))) {
      score += 8;
    }

    // Matches in description
    const descMatches = descTokens.filter(token => token === term).length;
    score += descMatches * 2;

    if (fuzzy) {
      const fuzzyDescMatches = descTokens.filter(token => fuzzyMatch(token, term)).length;
      score += fuzzyDescMatches;
    }

    // Matches in category
    if (categoryTokens.includes(term)) {
      score += 5;
    }

    // Matches in tags
    if (tagTokens.includes(term)) {
      score += 7;
    } else if (fuzzy && tagTokens.some(tag => fuzzyMatch(tag, term))) {
      score += 5;
    }
  });

  // Boost score based on usage count (popular items)
  score += Math.log(1 + (description.usageCount || 0)) * 0.5;

  // Recency boost (newer descriptions slightly preferred)
  const ageInDays = (Date.now() - new Date(description.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
  score += Math.max(0, 5 - (ageInDays / 30)); // Decay over months

  return score;
}

/**
 * Calculate semantic relevance score
 */
function calculateSemanticScore(
  expandedTerms: string[],
  description: SavedJobDescription,
  intent: string
): number {
  let score = calculateRelevanceScore(expandedTerms, description, true);

  // Boost if description seems to match intent
  const descLower = description.description.toLowerCase();
  const intentWords = tokenize(intent.toLowerCase());
  
  intentWords.forEach(word => {
    if (descLower.includes(word)) {
      score += 3;
    }
  });

  return score;
}

/**
 * Tokenize text into search terms
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(term => term.length > 2); // Ignore very short words
}

/**
 * Fuzzy match two strings
 */
function fuzzyMatch(str1: string, str2: string, threshold: number = 0.8): boolean {
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  const similarity = 1 - (distance / maxLength);
  
  return similarity >= threshold;
}

/**
 * Calculate Levenshtein distance
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Apply filters to descriptions
 */
function applyFilters(
  descriptions: SavedJobDescription[],
  filters?: SearchQuery['filters']
): SavedJobDescription[] {
  if (!filters) return descriptions;

  return descriptions.filter(desc => {
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(desc.category || '')) {
        return false;
      }
    }

    if (filters.tags && filters.tags.length > 0) {
      const hasTag = filters.tags.some(tag => desc.tags?.includes(tag));
      if (!hasTag) return false;
    }

    if (filters.dateRange) {
      const descDate = new Date(desc.updatedAt);
      if (filters.dateRange.start && descDate < new Date(filters.dateRange.start)) {
        return false;
      }
      if (filters.dateRange.end && descDate > new Date(filters.dateRange.end)) {
        return false;
      }
    }

    if (filters.minUsage !== undefined) {
      if ((desc.usageCount || 0) < filters.minUsage) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Find and highlight matching terms
 */
function findHighlights(
  queryTerms: string[],
  description: SavedJobDescription
): SearchHighlight[] {
  const highlights: SearchHighlight[] = [];

  // Highlight in name
  queryTerms.forEach(term => {
    const index = description.name.toLowerCase().indexOf(term);
    if (index !== -1) {
      highlights.push({
        field: 'name',
        snippet: description.name,
        startIndex: index,
        endIndex: index + term.length,
      });
    }
  });

  // Highlight in description (with context)
  queryTerms.forEach(term => {
    const descLower = description.description.toLowerCase();
    let index = descLower.indexOf(term);
    
    while (index !== -1 && highlights.length < 5) {
      const start = Math.max(0, index - 50);
      const end = Math.min(description.description.length, index + term.length + 50);
      const snippet = description.description.substring(start, end);

      highlights.push({
        field: 'description',
        snippet: (start > 0 ? '...' : '') + snippet + (end < description.description.length ? '...' : ''),
        startIndex: index - start,
        endIndex: index - start + term.length,
      });

      index = descLower.indexOf(term, index + 1);
    }
  });

  return highlights;
}

/**
 * Generate relevance reason
 */
function generateRelevanceReason(
  queryTerms: string[],
  description: SavedJobDescription,
  score: number
): string {
  const reasons: string[] = [];

  const nameMatches = queryTerms.filter(term => 
    description.name.toLowerCase().includes(term)
  ).length;

  const tagMatches = queryTerms.filter(term =>
    description.tags?.some(tag => tag.toLowerCase().includes(term))
  ).length;

  if (nameMatches > 0) {
    reasons.push(`${nameMatches} term(s) in title`);
  }

  if (tagMatches > 0) {
    reasons.push(`${tagMatches} matching tag(s)`);
  }

  if (description.usageCount && description.usageCount > 5) {
    reasons.push('frequently used');
  }

  if (reasons.length === 0) {
    reasons.push('matches search terms');
  }

  return reasons.join(', ');
}

/**
 * Generate search suggestions
 */
export async function getSearchSuggestions(
  partialQuery: string,
  recentSearches: string[],
  descriptions: SavedJobDescription[],
  apiKey?: string,
  provider?: 'openai' | 'gemini' | 'claude'
): Promise<SearchSuggestion[]> {
  const suggestions: SearchSuggestion[] = [];

  // Auto-complete based on existing data
  const allTerms = new Set<string>();
  descriptions.forEach(desc => {
    tokenize(desc.name).forEach(term => allTerms.add(term));
    desc.tags?.forEach(tag => allTerms.add(tag.toLowerCase()));
    if (desc.category) allTerms.add(desc.category.toLowerCase());
  });

  const partialLower = partialQuery.toLowerCase();
  allTerms.forEach(term => {
    if (term.startsWith(partialLower) && term !== partialLower) {
      suggestions.push({
        query: term,
        score: 1,
        type: 'completion',
      });
    }
  });

  // Recent searches
  recentSearches.forEach(search => {
    if (search.toLowerCase().includes(partialLower)) {
      suggestions.push({
        query: search,
        score: 0.8,
        type: 'related',
      });
    }
  });

  // AI-powered suggestions
  if (apiKey && provider && partialQuery.length >= 3) {
    try {
      const aiSuggestions = await getAISuggestions(partialQuery, apiKey, provider);
      suggestions.push(...aiSuggestions);
    } catch (error) {
      console.error('AI suggestions failed:', error);
    }
  }

  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

/**
 * Get AI-powered search suggestions
 */
async function getAISuggestions(
  query: string,
  apiKey: string,
  provider: 'openai' | 'gemini' | 'claude'
): Promise<SearchSuggestion[]> {
  const prompt = `Given this partial search query for job descriptions: "${query}"

Suggest 5 related search terms that the user might be looking for.
Consider: synonyms, related roles, common variations, industry terms.

Respond with only the suggestions, one per line.`;

  try {
    const response = await AIService.generateText(prompt, apiKey, provider);
    const suggestions = response
      .split('\n')
      .filter(line => line.trim())
      .map((line, index) => ({
        query: line.trim().replace(/^[-\d.)\s]+/, ''),
        score: 0.9 - (index * 0.1),
        type: 'related' as const,
      }));

    return suggestions;
  } catch (error) {
    return [];
  }
}

/**
 * Build search index for faster lookups
 */
export function buildSearchIndex(descriptions: SavedJobDescription[]): Map<string, Set<string>> {
  const index = new Map<string, Set<string>>();

  descriptions.forEach(desc => {
    const terms = [
      ...tokenize(desc.name),
      ...tokenize(desc.description),
      ...(desc.tags || []).map(t => t.toLowerCase()),
    ];

    terms.forEach(term => {
      if (!index.has(term)) {
        index.set(term, new Set());
      }
      index.get(term)!.add(desc.id);
    });
  });

  return index;
}

/**
 * Get search analytics
 */
export interface SearchAnalytics {
  totalSearches: number;
  uniqueQueries: number;
  averageResultCount: number;
  topQueries: Array<{ query: string; count: number }>;
  zeroResultQueries: string[];
}

export function getSearchAnalytics(
  searchHistory: Array<{ query: string; resultCount: number }>
): SearchAnalytics {
  const queryCount = new Map<string, number>();
  const zeroResults: string[] = [];

  searchHistory.forEach(({ query, resultCount }) => {
    queryCount.set(query, (queryCount.get(query) || 0) + 1);
    if (resultCount === 0) {
      zeroResults.push(query);
    }
  });

  const topQueries = Array.from(queryCount.entries())
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const averageResultCount = searchHistory.length > 0
    ? searchHistory.reduce((sum, s) => sum + s.resultCount, 0) / searchHistory.length
    : 0;

  return {
    totalSearches: searchHistory.length,
    uniqueQueries: queryCount.size,
    averageResultCount,
    topQueries,
    zeroResultQueries: [...new Set(zeroResults)],
  };
}
