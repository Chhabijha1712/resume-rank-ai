# 🚀 ResumeRank AI — Smart Resume Parser & Candidate Ranker
Upload resumes (PDF, DOCX, TXT) and instantly parse candidate data — skills, experience, education, contact info — using NLP. Rank candidates against company job requirements with TF-IDF scoring.

## Features

- **Resume Parsing** — Extracts structured data from PDF, DOCX, and TXT files
- **NLP Extraction** — Detects 200+ skills, experience, education, certifications
- **Company Profiles** — Built-in requirements for Google, Microsoft, Amazon, Meta, Apple
- **Smart Ranking** — TF-IDF cosine similarity + weighted scoring (skills, experience, education)
- **Client-Side** — All processing in-browser, no data sent to servers




---

## 🖥️ Live Demo

> Upload your resume → Select a company → Get ranked instantly!

---

## 🎯 What This Project Does

**ResumeRank AI** solves the challenge of screening resumes at scale. Instead of manually reading through each resume, this tool:

1. **Parses** uploaded resumes and extracts raw text from PDF, DOCX, or TXT files
2. **Extracts** structured information using NLP — including name, contact details, skills, work experience, education, and certifications
3. **Matches** candidate skills against a curated dictionary of 200+ technical and soft skills
4. **Ranks** all candidates against a specific job requirement using a composite scoring algorithm that combines:
   - **TF-IDF Cosine Similarity** (25%) — measures how relevant the resume content is to the job description
   - **Skill Match Score** (40%) — percentage of required/preferred skills found in the resume
   - **Experience Fit** (20%) — how well the candidate's years of experience match the requirement
   - **Education Level** (15%) — alignment with the required education level

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 📄 **Multi-Format Upload** | Supports PDF, DOCX, and TXT resume files via drag & drop or file browser |
| 🧠 **NLP Entity Extraction** | Extracts name, email, phone, LinkedIn, skills, experience, education, certifications |
| 🏢 **Company Profiles** | Pre-loaded job requirements for Google, Microsoft, Amazon, Meta, and Apple |
| ✏️ **Custom Requirements** | Define your own job title, description, required skills, and experience level |
| 📊 **TF-IDF Ranking** | Ranks candidates using cosine similarity + weighted composite scoring (0–100) |
| 🎨 **Premium Dark UI** | Glassmorphism design with smooth animations, responsive layout, and confetti effects |
| 🔒 **Privacy First** | All processing happens client-side — no data is sent to any server |

---

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **PDF Parsing**: [PDF.js](https://mozilla.github.io/pdf.js/) by Mozilla
- **DOCX Parsing**: [Mammoth.js](https://github.com/mwilliamson/mammoth.js)
- **NLP Engine**: Custom regex-based extraction with skill dictionary matching
- **Ranking Algorithm**: TF-IDF with cosine similarity and weighted composite scoring
- **Styling**: Custom CSS with glassmorphism, gradients, and micro-animations

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge)
- Python 3.x (for local server) or any static file server

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/resume-rank-ai.git

# 2. Navigate to the project folder
cd resume-rank-ai

# 3. Start a local server
python -m http.server 8080

# 4. Open in browser
# Visit http://localhost:8080
```

---

## 📁 Project Structure

```
resume-rank-ai/
├── index.html              # Main HTML page with all sections
├── styles.css              # Dark-mode glassmorphism design system
├── README.md               # Project documentation
├── .gitignore              # Git ignore rules
│
├── data/
│   └── skills.json         # Curated dictionary of 200+ skills by category
│
├── js/
│   ├── app.js              # Main application controller & event wiring
│   ├── parser.js           # PDF/DOCX/TXT file parser (PDF.js + Mammoth.js)
│   ├── nlp.js              # NLP entity extraction engine
│   ├── ranker.js           # TF-IDF ranking & composite scoring algorithm
│   ├── companies.js        # Pre-loaded company job profiles
│   └── ui.js               # DOM rendering, toasts, animations
│
└── samples/                # Sample resumes for testing
    ├── john_doe_resume.txt
    ├── sarah_chen_resume.txt
    └── raj_patel_resume.txt
```

---

## 📖 How to Use

1. **Upload Resumes** — Drag and drop or click to browse for PDF, DOCX, or TXT resume files
2. **View Parsed Data** — See extracted skills, experience, education, and contact info for each candidate
3. **Select Company** — Choose from Google, Microsoft, Amazon, Meta, Apple, or define custom requirements
4. **Set Requirements** — Adjust job title, description, required skills, experience, and education level
5. **Rank Candidates** — Click "Rank Candidates" to see a scored and sorted ranking table
6. **Analyze Results** — Review overall score, skill match %, relevance, experience fit, and matched/missing skills

---

## ⚙️ How the Ranking Algorithm Works

```
Composite Score = (Skill Match × 0.40) + (TF-IDF Similarity × 0.25) 
                + (Experience Fit × 0.20) + (Education Fit × 0.15)
```

- **Skill Match**: Compares candidate skills against required + preferred skills from the job profile
- **TF-IDF Similarity**: Tokenizes resume and job description, computes term frequency–inverse document frequency vectors, then measures cosine similarity
- **Experience Fit**: Scores based on how candidate's years of experience compare to the minimum requirement
- **Education Fit**: Scores based on education level alignment (PhD > Masters > Bachelors > Associate)

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

Made with ❤️ using NLP & JavaScript

---

⭐ **Star this repo** if you found it useful!
