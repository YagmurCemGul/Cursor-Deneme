# Form Builder - Quick Start Guide

## 🎯 New Features Overview

### 1. ✅ Required Questions
**What it does:** Mark questions as mandatory and validate user responses.

**How to use:**
- When creating a question, check the "Make this question required" checkbox
- Required questions display a red asterisk (*) next to the title
- Empty required fields show a validation error: "⚠️ This field is required"

### 2. 📊 Character Counter (Form Group & Fieldset)
**What it does:** Set and track character limits for long-form text answers.

**How to use:**
- Select "Form Group" or "Fieldset" as question type
- Enter a character limit (default: 1000)
- Counter updates in real-time:
  - Green: "500 characters remaining"
  - Red: "25 characters over limit"

### 3. 💾 Auto-save
**What it does:** Automatically saves your work as you type.

**How it works:**
- Saves automatically 1 second after you stop typing
- Shows "✓ Auto-saved" confirmation banner
- Banner disappears after 2 seconds
- No manual save button needed!

### 4. ✨ Rich Text Editor (Form Group)
**What it does:** Format answers with bold, italic, bullets, and lists.

**How to use:**
- Create a "Form Group" question
- Use the toolbar to format text:
  - **B** = Bold
  - *I* = Italic
  - • = Bullet points
  - 1. = Numbered lists
- Or use markdown: `**bold**` `_italic_`
- Paste formatted content from Word/Google Docs

### 5. 📎 File Upload
**What it does:** Allow users to upload files as answers.

**How to use:**
- Select "File Upload" as question type
- Click "📎 Upload File" button
- Select file (max 10MB)
- View file details (name, size)
- Change or remove file as needed

## 🚀 Common Use Cases

### Use Case 1: Required Resume Upload
```
Question: "Please upload your resume"
Type: File Upload
✓ Required
```

### Use Case 2: Cover Letter with Character Limit
```
Question: "Write a cover letter"
Type: Form Group (Multi-line)
✓ Rich text editor enabled
Character Limit: 1000
✓ Required
```

### Use Case 3: Short Answer
```
Question: "What is your expected salary?"
Type: Text Input
Optional (not required)
```

## 🎨 Visual Indicators

| Indicator | Meaning |
|-----------|---------|
| Red * | Required field |
| Red border | Validation error |
| ⚠️ icon | Missing required answer |
| ✓ banner | Auto-saved |
| Green counter | Within character limit |
| Red counter | Over character limit |
| 📎 icon | Upload file button |
| 📄 icon | File uploaded |

## 💡 Pro Tips

1. **Set reasonable character limits**: 
   - Short descriptions: 200-500 chars
   - Cover letters: 1000-2000 chars
   - Essays: 2000-5000 chars

2. **Use rich text for important questions**:
   - Allows better formatting
   - Makes answers more readable
   - Supports bullet points for clarity

3. **Make critical fields required**:
   - Contact information
   - Resume upload
   - Key qualification questions

4. **Trust auto-save**:
   - Wait for the "Auto-saved" message
   - No need to manually save repeatedly
   - Changes are preserved automatically

5. **File uploads work best for**:
   - Resumes (PDF, DOCX)
   - Portfolio samples
   - Certifications
   - Reference letters

## 🔍 Troubleshooting

**Q: File upload says "too large"?**  
A: Maximum file size is 10MB. Compress or split large files.

**Q: Character counter is red?**  
A: You've exceeded the limit. Edit text to reduce character count.

**Q: Required field error won't go away?**  
A: Make sure the field has content:
- Text: Must have at least one character
- Checkboxes: At least one option selected
- File: A file must be uploaded

**Q: Rich text formatting not showing?**  
A: Rich text is only available for "Form Group" question type.

**Q: Auto-save not working?**  
A: It saves after 1 second of inactivity. Keep typing and wait for the banner.

## 📱 Browser Compatibility

✅ Chrome 90+  
✅ Firefox 88+  
✅ Safari 14+  
✅ Edge 90+

## 🌍 Language Support

All features support both:
- 🇬🇧 English
- 🇹🇷 Turkish

Language switches automatically based on your settings.

---

**Ready to start?** Create your first question with the new features! 🎉
