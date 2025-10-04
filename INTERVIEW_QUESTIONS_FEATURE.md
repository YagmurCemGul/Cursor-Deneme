# Interview Questions Generator Feature

## Overview

The Interview Questions Generator is an AI-powered feature that creates practical, relevant interview questions based on a candidate's CV and job requirements. This helps candidates prepare for job interviews by providing tailored questions that interviewers are likely to ask.

## Features

### Core Functionality

1. **AI-Powered Generation**
   - Generates questions using advanced AI models
   - Contextual questions based on CV content
   - Aligned with job requirements when provided

2. **Question Categories**
   - Technical: Tests specific technical skills
   - Behavioral: Assesses soft skills and work style
   - Situational: Evaluates problem-solving abilities

3. **Difficulty Levels**
   - Easy: Basic knowledge questions
   - Medium: In-depth understanding
   - Hard: Expert-level scenarios

4. **Relevance Scoring**
   - Each question has a relevance score (0-100)
   - Higher scores indicate more important questions
   - Based on CV content and job requirements

### User Interface

#### Main Controls
- **Number of Questions**: Adjustable (5-30 questions)
- **Generate Button**: Triggers question generation
- **Filter Controls**: Category and difficulty filters
- **Action Buttons**: Copy all and export functionality

#### Question Display
- **Question Card**: Each question in a dedicated card
- **Metadata Display**: Shows category, difficulty, and relevance
- **Source Information**: What CV element the question is based on
- **Individual Copy**: Copy button for each question

#### Filtering and Sorting
- **Category Filter**: Filter by Technical, Behavioral, or Situational
- **Difficulty Filter**: Filter by Easy, Medium, or Hard
- **Automatic Sorting**: Questions sorted by relevance score

### Usage Workflow

1. **Fill Out CV Information**
   - Complete personal info, skills, experience, education
   - Add projects and certifications
   - Upload existing CV (optional)

2. **Add Job Description** (Optional)
   - Paste the job posting
   - Questions will be tailored to job requirements
   - Improves question relevance

3. **Generate Questions**
   - Set desired number of questions
   - Click "Generate Questions"
   - Wait for AI processing

4. **Review and Filter**
   - Browse generated questions
   - Filter by category or difficulty
   - Sort by relevance

5. **Export or Copy**
   - Copy individual questions
   - Copy all questions at once
   - Export to text file

## Technical Implementation

### Service Layer
**File**: `src/utils/interviewQuestionsGenerator.ts`

#### Key Functions

```typescript
// Main generation function
generateInterviewQuestions(
  cvData: CVData,
  jobDescription?: string,
  numberOfQuestions: number = 15
): Promise<InterviewQuestionsResult>

// Filter functions
filterQuestionsByCategory(questions: InterviewQuestion[], category: string): InterviewQuestion[]
filterQuestionsByDifficulty(questions: InterviewQuestion[], difficulty: 'Easy' | 'Medium' | 'Hard'): InterviewQuestion[]
sortQuestionsByRelevance(questions: InterviewQuestion[]): InterviewQuestion[]
```

#### Data Structures

```typescript
interface InterviewQuestion {
  id: string;
  category: string;
  question: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  relevance: number; // 0-100
  basedOn: string;
}

interface InterviewQuestionsResult {
  questions: InterviewQuestion[];
  totalQuestions: number;
  categories: string[];
}
```

### UI Component
**File**: `src/components/InterviewQuestionsGenerator.tsx`

#### Component Props

```typescript
interface InterviewQuestionsGeneratorProps {
  cvData: CVData;
  jobDescription?: string;
}
```

#### State Management
- Questions list
- Loading state
- Error handling
- Filter selections
- Categories list

### AI Integration

The feature uses the existing AI service (`aiService.ts`) to generate questions:

1. **Context Building**: Extracts relevant information from CV
2. **Prompt Engineering**: Creates detailed prompt for AI
3. **Response Parsing**: Extracts questions from AI response
4. **Fallback Questions**: Provides template questions if AI fails

## Testing

### Unit Tests
**File**: `src/utils/__tests__/interviewQuestionsGenerator.test.ts`

Tests cover:
- Question generation
- Filtering by category
- Filtering by difficulty
- Sorting by relevance
- Fallback question generation

### Manual Testing Checklist

- [ ] Generate questions with full CV
- [ ] Generate questions with minimal CV
- [ ] Generate with job description
- [ ] Generate without job description
- [ ] Test category filtering
- [ ] Test difficulty filtering
- [ ] Test copy functionality
- [ ] Test export functionality
- [ ] Verify relevance scoring
- [ ] Check error handling

## Example Questions

### Technical Questions
- "Can you explain your experience with React hooks and how you've used them in production?"
- "Describe the most complex algorithm or data structure you've implemented and why you chose it."
- "How do you approach optimizing application performance?"

### Behavioral Questions
- "Tell me about a time when you had to work under pressure. How did you handle it?"
- "Describe a situation where you had to resolve a conflict in your team."
- "How do you approach learning new technologies?"

### Situational Questions
- "If you had to refactor a legacy codebase with no documentation, how would you approach it?"
- "How would you handle a situation where a project deadline is at risk?"
- "What would you do if you disagreed with a technical decision made by your team lead?"

## Best Practices

### For Candidates

1. **Complete Your CV**: More information = better questions
2. **Add Job Description**: Improves question relevance
3. **Review All Categories**: Don't skip behavioral questions
4. **Practice Out Loud**: Don't just read, actually answer
5. **Use STAR Method**: Structure behavioral answers (Situation, Task, Action, Result)

### For Developers

1. **AI Prompt Quality**: Keep the AI prompt detailed and specific
2. **Fallback Handling**: Always provide fallback questions
3. **Error Handling**: Gracefully handle API failures
4. **Performance**: Cache questions for the same CV/job combination
5. **Privacy**: Never log or store question content

## Future Enhancements

### Planned Features
- [ ] Question difficulty auto-adjustment based on experience level
- [ ] Sample answer generation
- [ ] Interview practice mode with timer
- [ ] Voice recording for answer practice
- [ ] Analytics on question preparation time
- [ ] Share questions with mentors or peers
- [ ] Company-specific question generation
- [ ] Integration with common interview platforms

### Potential Improvements
- Multilingual question generation
- Industry-specific question banks
- Video response recording
- AI-powered answer evaluation
- Interview scheduling integration
- Mock interview simulation

## Troubleshooting

### Questions Not Generating
1. Ensure CV has required information (name, skills, experience)
2. Check AI service configuration
3. Verify API key is valid
4. Check console for errors

### Low-Quality Questions
1. Provide more detailed CV information
2. Add specific job description
3. Increase number of questions for better variety
4. Check AI model temperature settings

### Performance Issues
1. Reduce number of questions
2. Check network connection
3. Verify AI service rate limits
4. Consider caching generated questions

## Support

For issues or feature requests related to the Interview Questions Generator:
1. Check the troubleshooting section
2. Review test files for expected behavior
3. Check console logs for errors
4. Open an issue on GitHub with:
   - CV data structure (anonymized)
   - Job description (if used)
   - Error messages
   - Expected vs actual behavior
