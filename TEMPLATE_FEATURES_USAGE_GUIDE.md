# Template Features - User Guide

## Quick Start Guide

### Creating a Custom Template

1. **Navigate to Templates Section**
   - Open the CV Template Manager
   - Click "✨ Create Custom Template" button

2. **Customize Your Template**
   - **Basic Info**: Enter name, description, and select an emoji icon
   - **Colors**: Use color pickers to customize 5 different colors
   - **Fonts**: Choose heading and body fonts from 12 professional options
   - **Layout**: Configure header alignment, columns, and spacing
   - **Features**: Add feature tags (comma-separated)

3. **Preview & Save**
   - View real-time preview at the bottom
   - Click "Save" to store your custom template

### Importing a Template

1. Click "📥 Import Template" button
2. Select a `.json` template file
3. The template will be imported and available immediately

### Exporting a Template

1. Find your custom template in the grid
2. Click "📤 Export" button
3. A JSON file will be downloaded to your computer

### Rating a Template

1. Click the "⭐ Rate" button on any template card
2. Select 1-5 stars
3. Optionally write a review
4. Click "Submit Rating"
5. Average ratings appear on template cards

### Using AI Template Suggestions

1. **Prerequisites**: Enter a job description in the application
2. Switch to "🤖 AI Suggestions" view mode
3. View top 3 recommended templates based on:
   - Matched keywords
   - Industry alignment
   - Confidence scores
4. Click "Use This Template" to apply

### Browsing by Category

1. Click "📂 By Category" view mode
2. Select a category card (e.g., "Technology & Development")
3. View filtered templates matching that category
4. Click on any template to select it

## View Modes Explained

### 1. All Templates (🔲)
- Shows all available templates (default and custom)
- Best for: Browsing all options

### 2. By Category (📂)
- Filters templates by industry/style
- 10 categories available
- Best for: Finding industry-specific templates

### 3. AI Suggestions (🤖)
- Only appears when job description is provided
- Shows top 3 AI-recommended templates
- Includes confidence scores and reasons
- Best for: Quick, intelligent template selection

## Template Actions

| Action | Icon | Description |
|--------|------|-------------|
| Preview | 👁️ | View template details |
| Rate | ⭐ | Submit rating and review |
| Edit | ✏️ | Modify custom template (custom only) |
| Export | 📤 | Download as JSON (custom only) |
| Delete | 🗑️ | Remove custom template (custom only) |
| Select | ✓ | Apply template to your CV |

## Categories Overview

### Corporate & Business 💼
Finance, Banking, Consulting, Insurance, Legal

### Technology & Development 💻
Software, IT, Engineering, Data Science, Cybersecurity

### Creative & Design 🎨
Design, Marketing, Advertising, Media, Arts

### Healthcare & Medical ⚕️
Medical, Nursing, Healthcare, Pharmaceutical, Biotech

### Education & Academia 📚
Teaching, Research, Academic, Training, Education

### Startup & Innovation 🚀
Startup, Entrepreneur, Venture, Innovation

### Sales & Business Development 📈
Sales, Business Development, Account Management, Retail

### Executive & Leadership 👔
Executive, C-Level, Management, Leadership

### Engineering & Technical ⚙️
Mechanical, Electrical, Civil, Chemical, Industrial

### Entry Level & Students 🎓
Graduate, Internship, Entry-Level, Student

## Available Templates

### CV Templates (16 total)

**Original Templates:**
1. **Classic Professional** 📄 - Traditional ATS-friendly format
2. **Modern Minimalist** ✨ - Clean contemporary design
3. **Executive Elite** 👔 - Sophisticated leadership design
4. **Creative Portfolio** 🎨 - Eye-catching for designers
5. **Compact Professional** 📋 - Space-efficient layout
6. **Academic CV** 🎓 - Comprehensive academic format
7. **Tech Developer** 💻 - Developer-focused design
8. **Startup Ready** 🚀 - Dynamic startup design

**New Templates:**
9. **Finance Professional** 💼 - Conservative finance design
10. **Marketing Maven** 📣 - Vibrant marketing design
11. **Healthcare Professional** ⚕️ - Clean medical design
12. **Legal Professional** ⚖️ - Formal legal design
13. **Education & Teaching** 📚 - Friendly educator design
14. **Engineering Expert** ⚙️ - Technical engineering design
15. **Sales Champion** 📈 - Results-driven sales design
16. **Management Consulting** 🎯 - Strategic consulting design
17. **Data Science & Analytics** 📊 - Data-focused design

### Cover Letter Templates (10 total)

**Original Templates:**
1. **Classic Professional** 📄
2. **Modern Professional** ✨
3. **Executive Elite** 👔
4. **Creative Professional** 🎨
5. **Startup Ready** 🚀
6. **Academic & Research** 🎓

**New Templates:**
7. **Tech Developer** 💻
8. **Consulting Professional** 🎯
9. **Sales & Business Development** 📈

## Customization Options

### Colors (5 customizable)
- **Primary**: Main branding color
- **Secondary**: Supporting color
- **Accent**: Highlight color for important elements
- **Text**: Main text color
- **Background**: Page background color

### Fonts (12 options)
**Sans-serif (Modern):**
- Arial, Helvetica, Calibri, Verdana, Trebuchet MS

**Serif (Traditional):**
- Times New Roman, Georgia, Palatino, Garamond, Book Antiqua

**Monospace (Technical):**
- Consolas, Courier New

### Layout Options
- **Header Alignment**: Left, Center, Right
- **Column Layout**: Single Column, Two Columns
- **Section Spacing**: 8-32px (adjustable slider)

## AI Suggestion Algorithm

The AI suggestion system analyzes your job description for:

### Keywords (Weight: 1.0)
- Job titles, roles, responsibilities
- Technical terms, software, tools
- Industry-specific terminology

### Industries (Weight: 2.0)
- Finance, Tech, Healthcare, Legal, etc.
- Specific sectors mentioned
- Company types

### Tones (Weight: 0.5)
- Formal, Modern, Creative, Professional
- Company culture indicators
- Communication style

### Confidence Levels
- **Excellent Match** (70%+): Green badge - Highly recommended
- **Good Match** (50-69%): Blue badge - Strong candidate
- **Fair Match** (30-49%): Amber badge - Reasonable option
- **Possible Match** (<30%): Gray badge - Consider if others don't fit

## Tips for Best Results

### Creating Custom Templates
1. Start from an existing template you like
2. Make incremental changes and preview often
3. Use complementary colors (check color theory)
4. Choose fonts that are professional and readable
5. Test spacing with actual content

### Using AI Suggestions
1. Provide detailed job descriptions
2. Include industry-specific keywords
3. Mention company culture and values
4. Include technical requirements
5. Better input = Better suggestions

### Rating Templates
1. Rate after using the template
2. Consider: Readability, ATS compatibility, visual appeal
3. Write helpful reviews for other users
4. Update ratings as you gain experience

### Organizing Templates
1. Use categories to narrow down choices
2. Export your favorite customizations
3. Name custom templates clearly
4. Add descriptive features tags

## Troubleshooting

### Template Import Issues
**Problem**: "Failed to import template"
**Solution**: Ensure the JSON file is valid and follows the correct format

### Custom Template Not Saving
**Problem**: Template disappears after refresh
**Solution**: Check browser storage permissions, clear cache if needed

### AI Suggestions Not Showing
**Problem**: No suggestions appear
**Solution**: Make sure you've entered a job description with enough detail

### Colors Not Changing
**Problem**: Color picker updates not reflecting
**Solution**: Try entering hex codes directly, or refresh the page

## Developer Notes

### Template Structure
```typescript
interface CustomCVTemplate {
  id: string;
  name: string;
  description: string;
  preview: string; // emoji
  categoryId?: string;
  colors: {
    primary: string;
    secondary: string;
    text: string;
    background: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  layout: {
    headerAlign: 'left' | 'center' | 'right';
    sectionSpacing: number;
    columnLayout: 'single' | 'two-column';
  };
  features: string[];
  isCustom: boolean;
  createdAt: string;
  updatedAt?: string;
  averageRating?: number;
  totalRatings?: number;
}
```

### Storage Keys
- `customCVTemplates`: Array of custom CV templates
- `customCoverLetterTemplates`: Array of custom cover letter templates
- `templateRatings`: Array of all template ratings
- `templateCategories`: Category definitions

### API Reference
See `src/utils/storage.ts` for all available methods:
- Template CRUD operations
- Rating management
- Category handling

## Support

For issues or questions:
1. Check this guide first
2. Review the technical documentation in `TEMPLATE_ENHANCEMENTS_SUMMARY.md`
3. Check browser console for error messages
4. Verify browser storage is not full

## Best Practices

### For Users
1. ✅ Create backups by exporting important templates
2. ✅ Rate templates to help the community
3. ✅ Use categories to find industry-appropriate templates
4. ✅ Try AI suggestions for quick, intelligent choices
5. ✅ Customize templates to match your personal brand

### For Developers
1. ✅ Follow TypeScript interfaces strictly
2. ✅ Add translations for new features
3. ✅ Test import/export thoroughly
4. ✅ Validate all user inputs
5. ✅ Keep storage methods atomic

## Keyboard Shortcuts

Currently, template features are mouse/touch-driven. Future versions may include:
- `Ctrl/Cmd + N`: New custom template
- `Ctrl/Cmd + S`: Save template
- `Escape`: Close modal
- Arrow keys: Navigate template grid

---

**Version**: 1.0  
**Last Updated**: October 4, 2025  
**Compatible With**: Chrome Extension v2.0+
