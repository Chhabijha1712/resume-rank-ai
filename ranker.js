const CandidateRanker = (() => {
  function tokenize(text) {
    return text.toLowerCase().replace(/[^a-z0-9#+.\-]/g, ' ').split(/\s+/).filter(t => t.length > 1);
  }

  function termFrequency(tokens) {
    const tf = {};
    for (const token of tokens) tf[token] = (tf[token] || 0) + 1;
    const max = Math.max(...Object.values(tf), 1);
    for (const key in tf) tf[key] = tf[key] / max;
    return tf;
  }

  function inverseDocumentFrequency(documents) {
    const n = documents.length;
    const docFreq = {};
    for (const doc of documents) {
      const unique = new Set(doc);
      for (const token of unique) docFreq[token] = (docFreq[token] || 0) + 1;
    }
    const idf = {};
    for (const term in docFreq) idf[term] = Math.log((n + 1) / (docFreq[term] + 1)) + 1;
    return idf;
  }

  function cosineSimilarity(vecA, vecB) {
    let dot = 0, normA = 0, normB = 0;
    const allKeys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
    for (const key of allKeys) {
      const a = vecA[key] || 0, b = vecB[key] || 0;
      dot += a * b; normA += a * a; normB += b * b;
    }
    return (normA === 0 || normB === 0) ? 0 : dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  function tfidfVector(tokens, idf) {
    const tf = termFrequency(tokens);
    const vec = {};
    for (const term in tf) vec[term] = tf[term] * (idf[term] || 1);
    return vec;
  }

  function skillMatchScore(candidateSkills, requiredSkills, preferredSkills = []) {
    const lower = candidateSkills.map(s => s.toLowerCase());
    const reqMatched = requiredSkills.filter(s => lower.includes(s.toLowerCase()));
    const prefMatched = preferredSkills.filter(s => lower.includes(s.toLowerCase()));
    const reqScore = requiredSkills.length > 0 ? reqMatched.length / requiredSkills.length : 0;
    const prefScore = preferredSkills.length > 0 ? prefMatched.length / preferredSkills.length : 0;
    return {
      score: reqScore * 0.8 + prefScore * 0.2,
      requiredMatched: reqMatched,
      requiredMissing: requiredSkills.filter(s => !lower.includes(s.toLowerCase())),
      preferredMatched: prefMatched,
    };
  }

  function experienceScore(candidateYears, requiredYears) {
    if (!candidateYears || !requiredYears) return 0.5;
    if (candidateYears >= requiredYears) return Math.min(1, 0.7 + 0.3 * Math.min((candidateYears - requiredYears) / 5, 1));
    return Math.max(0, candidateYears / requiredYears * 0.7);
  }

  function educationScore(candidateLevel, requiredLevel) {
    const levels = { 'unknown': 0, 'associate': 1, 'bachelors': 2, 'masters': 3, 'phd': 4, 'any': 0 };
    const candLvl = levels[candidateLevel] || 0, reqLvl = levels[requiredLevel] || 0;
    if (reqLvl === 0) return 0.5;
    if (candLvl >= reqLvl) return 1;
    if (candLvl === reqLvl - 1) return 0.6;
    return 0.3;
  }

  function rankCandidates(candidates, requirements) {
    if (candidates.length === 0) return [];
    const jobText = `${requirements.jobTitle} ${requirements.description} ${requirements.requiredSkills.join(' ')} ${(requirements.preferredSkills || []).join(' ')}`;
    const jobTokens = tokenize(jobText);
    const allDocs = [jobTokens, ...candidates.map(c => tokenize(c.rawText))];
    const idf = inverseDocumentFrequency(allDocs);
    const jobVector = tfidfVector(jobTokens, idf);

    const ranked = candidates.map(candidate => {
      const candidateVector = tfidfVector(tokenize(candidate.rawText), idf);
      const tfidf = cosineSimilarity(jobVector, candidateVector);
      const skillResult = skillMatchScore(candidate.skillsList, requirements.requiredSkills, requirements.preferredSkills || []);
      const exp = experienceScore(candidate.experience.years, requirements.minExperience);
      const edu = educationScore(candidate.education.level, requirements.educationLevel);
      const composite = (skillResult.score * 0.40 + tfidf * 0.25 + exp * 0.20 + edu * 0.15) * 100;
      return {
        name: candidate.name, fileName: candidate.fileName,
        compositeScore: Math.round(composite * 10) / 10,
        skillScore: Math.round(skillResult.score * 100),
        tfidfScore: Math.round(tfidf * 100),
        experienceScore: Math.round(exp * 100),
        educationScore: Math.round(edu * 100),
        skillDetails: skillResult, experience: candidate.experience,
        education: candidate.education, contact: candidate.contact, skillsList: candidate.skillsList,
      };
    });
    ranked.sort((a, b) => b.compositeScore - a.compositeScore);
    ranked.forEach((r, i) => { r.rank = i + 1; });
    return ranked;
  }

  return { rankCandidates, cosineSimilarity, tokenize };
})();
