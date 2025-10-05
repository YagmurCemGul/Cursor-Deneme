// This file is maintained for backward compatibility
// For new implementations, use degreesI18n.ts which provides internationalized degree names

import { degreeOptions } from './degreesI18n';

// Export English degree names for backward compatibility
export const degrees: string[] = degreeOptions.map(option => option.en);
