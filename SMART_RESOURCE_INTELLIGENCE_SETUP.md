# Smart Resource Intelligence - Setup & Testing Guide

## Quick Start

### Prerequisites
- ✅ MongoDB running
- ✅ Node.js 18+ installed
- ✅ Groq API key (from console.groq.com)

### Installation

**1. Install Backend Dependencies**
```bash
cd server
npm install pdf-parse mammoth
```

**2. Configure Environment**

Edit `server/.env` and add:
```bash
GROQ_API_KEY=your_groq_api_key_here
```

> **Note:** The dependencies were already installed during implementation. If you get any errors, run `npm install` again.

**3. Restart Server**
```bash
# If server is running, stop it (Ctrl+C) then:
npm run dev
```

You should see:
```
✅ Groq AI initialized with model: llama-3.3-70b-versatile
🚀 Server running on port 5000
```

---

## Testing the Feature

### Method 1: Using the Web Interface

**Step-by-Step:**

1. **Start the application:**
   ```bash
   # Terminal 1: Backend
   cd server && npm run dev
   
   # Terminal 2: Frontend  
   cd client && npm start
   ```

2. **Login** to Study Sphere  

3. **Navigate** to Resources section

4. **Upload a PDF:**
   - Click "Upload Resource"
   - Select a PDF file (study notes, lab manual, etc.)
   - Fill in title, subject, type
   - Click Submit

5. **View Resource Details:**
   - Click on the uploaded resource
   - You should see the resource detail page

6. **Trigger Analysis:**
   - Look for "Analyze with AI" or "AI Analysis" button
   - Click it
   - Wait ~5-10 seconds

7. **View Insights:**
   - The AI Analysis tab should now show insights
   - Explore all 5 tabs:
     - Overview (summary, subtopics, prerequisites)
     - Flashcards (flip cards)
     - Exam Prep (expected questions)
     - Concepts (key concepts)
     - Study Guide (recommendations, tools, related topics)

---

### Method 2: Using API Directly

**Get an Auth Token:**
```bash
# Login and save token
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}' \
  | jq -r '.token')

echo $TOKEN
```

**Upload Test Resource:**
```bash
# Upload a file
RESOURCE_ID=$(curl -X POST http://localhost:5000/api/resources \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/test.pdf" \
  -F "title=Test Document" \
  -F "subject=Computer Science" \
  -F "type=Notes" \
  | jq -r '.data._id')

echo "Resource ID: $RESOURCE_ID"
```

**Trigger Analysis:**
```bash
curl -X POST http://localhost:5000/api/resources/$RESOURCE_ID/analyze \
  -H "Authorization: Bearer $TOKEN" \
  | jq
```

Expected response:
```json
{
  "success": true,
  "message": "Analysis started. Check back in a moment.",
  "data": {
    "resourceId": "65f...",
    "status": "analyzing"
  }
}
```

**Check Analysis Status:**
```bash
# Wait 10 seconds
sleep 10

# Get insights
curl http://localhost:5000/api/resources/$RESOURCE_ID/insights \
  -H "Authorization: Bearer $TOKEN" \
  | jq
```

---

## Expected Results

### Console Logs (Backend)

When analysis starts, you should see:
```
🔍 Analyzing resource: Test Document
📄 Extracting text from document...
  - Extracted 2547 characters
📊 Sending document to Groq for analysis...
✅ Document analysis completed
  - Confidence: 0.92
  - Difficulty: 7/10
  - Flashcards: 8
✅ Analysis completed for resource: Test Document
```

### Browser Network Tab

When clicking "Analyze with AI":
```
POST /api/resources/65f.../analyze → 202 Accepted
GET /api/resources/65f.../insights → 202 (analyzing)
GET /api/resources/65f.../insights → 200 OK (completed)
```

### UI Display

You should see:
- ✅ Summary box with subject chip and main topic
- ✅ Difficulty rating (1-10 stars)
- ✅ Tabbed interface with 5 sections
- ✅ Flashcards with flip animation
- ✅ Expected questions list (numbered)
- ✅ Concept nodes as chips
- ✅ Related topics section
- ✅ Recommended tools grid
- ✅ Study group type alert box
- ✅ Confidence score with star rating

---

## Test Data Examples

### Sample PDF Content

Create a test PDF with this content:
```
Introduction to Data Structures

This document covers fundamental data structures including:
- Arrays and Linked Lists
- Stacks and Queues  
- Trees (Binary Trees, BST)
- Graphs and Traversal

Prerequisites: Basic programming knowledge

Key Concepts:
1. Time Complexity: O(1), O(n), O(log n)
2. Space Complexity
3. Big O Notation

Practice Questions:
- Implement a binary search tree
- Explain DFS vs BFS
- What is the time complexity of quicksort?
```

### Expected Analysis Output

```json
{
  "subject": "Computer Science",
  "main_topic": "Data Structures and Algorithms",
  "subtopics": [
    "Arrays and Linked Lists",
    "Stacks and Queues",
    "Trees and Binary Search Trees",
    "Graphs and Traversal Algorithms"
  ],
  "prerequisites": [
    "Basic Programming Knowledge",
    "Understanding of Variables and Functions",
    "Problem Solving Skills"
  ],
  "summary": "Comprehensive introduction to fundamental data structures...",
  "flashcards": [
    {
      "q": "What is the time complexity of accessing an element in an array?",
      "a": "O(1) - constant time"
    },
    {
      "q": "Define a Binary Search Tree",
      "a": "A tree where left children ≤ parent ≤ right children"
    }
  ],
  "expected_questions": [
    "Implement a binary search tree with insert and search functions",
    "Explain the difference between DFS and BFS traversal",
    "Compare time complexities of different sorting algorithms"
  ],
  "concept_nodes": [
    "Arrays", "Linked Lists", "Stacks", "Queues",
    "Trees", "Graphs", "Time Complexity", "Space Complexity"
  ],
  "related_topics": [
    "Algorithm Analysis",
    "Sorting Algorithms",
    "Complexity Theory"
  ],
  "ideal_study_group_type": "Technical Problem Solving",
  "recommended_tools": [
    "LeetCode",
    "Visualgo",
    "GeeksforGeeks",
    "HackerRank"
  ],
  "difficulty": 6,
  "confidence_score": 0.88
}
```

---

## Troubleshooting

### Issue: "Groq API not configured"

**Solution:**
```bash
# Check if API key is set
cd server
cat .env | grep GROQ_API_KEY

# If empty, add it:
echo "GROQ_API_KEY=your_key_here" >> .env

# Restart server
npm run dev
```

---

### Issue: "Failed to extract text from PDF"

**Possible Causes:**
- File path incorrect
- File is image-based PDF (scanned document)
- Corrupted PDF

**Solution:**
```bash
# Test extraction manually
cd server
node -e "
const { extractText } = require('./services/resourceAnalysisService');
const path = require('path');
const fs = require('fs');

// Check if file exists
const filePath = path.join(__dirname, 'uploads/test.pdf');
if (!fs.existsSync(filePath)) {
  console.log('File not found');
} else {
  extractText(filePath, 'pdf')
    .then(text => console.log('Success! Length:', text.length))
    .catch(err => console.error('Error:', err.message));
}
"
```

---

### Issue: Analysis stuck in "analyzing" state

**Check server logs:**
```bash
# Look for error messages
# Should see: "✅ Analysis completed for resource: ..."
# If not, analysis crashed

# Fix: Re-trigger analysis
curl -X POST http://localhost:5000/api/resources/$RESOURCE_ID/analyze \
  -H "Authorization: Bearer $TOKEN"
```

---

### Issue: Flashcards not displaying

**Check browser console:**
```javascript
// Should show flashcards array
console.log(insights.flashcards);

// If empty array, analysis didn't generate flashcards
// Re-run analysis or check LLM response
```

---

## Verification Checklist

### Backend ✅
- [ ] Dependencies installed (`pdf-parse`, `mammoth`)
- [ ] Groq API key configured
- [ ] Server starts without errors
- [ ] POST `/api/resources/:id/analyze` returns 202
- [ ] GET `/api/resources/:id/insights` returns data
- [ ] Console shows analysis logs
- [ ] Database updated with aiAnalysis field

### Frontend ✅
- [ ] Resource detail page loads
- [ ] "Analyze with AI" button visible
- [ ] Loading state displays during analysis
- [ ] Insights tab appears after completion
- [ ] All 5 tabs accessible
- [ ] Flashcards flip on click
- [ ] New fields display correctly:
  - [ ] Related topics
  - [ ] Recommended tools
  - [ ] Study group type
  - [ ] Confidence score

### Integration ✅
- [ ] Can upload PDF resource
- [ ] Can trigger analysis
- [ ] Can view insights
- [ ] No errors in browser console
- [ ] No breaking changes to existing features

---

## Performance Benchmarks

| Metric | Expected Time |
|--------|---------------|
| PDF text extraction | 1-2 seconds |
| LLM API call | 3-8 seconds |
| Total analysis time | 5-10 seconds |
| UI response time | < 100ms |

---

## Next Steps

1. **Test with Real Documents**
   - Upload actual study notes
   - Verify analysis quality
   - Check flashcard relevance

2. **Gather Feedback**
   - Test with students
   - Collect usability feedback
   - Identify improvements

3. **Monitor Usage**
   - Track analysis success rate
   - Monitor API quota usage
   - Check error rates

4. **Iterate**
   - Improve prompts based on results
   - Add more recommended tools
   - Enhance UI based on feedback

---

## Support

If you encounter issues:

1. **Check server logs** for detailed error messages
2. **Verify environment variables** are set correctly
3. **Test with sample PDF** first
4. **Check Groq API status** at console.groq.com

**Common Solutions:**
- Restart backend server
- Clear browser cache
- Re-run analysis
- Check file permissions
