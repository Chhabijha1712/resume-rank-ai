const UI = (() => {
  function showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container');
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span class="toast-message">${message}</span><button class="toast-close" onclick="this.parentElement.remove()">✕</button>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(40px)'; toast.style.transition = 'all 0.3s ease'; setTimeout(() => toast.remove(), 300); }, duration);
  }

  function renderFileItem(file, index, onRemove, status = 'parsing') {
    const sizeKB = (file.size / 1024).toFixed(1);
    const ext = file.name.split('.').pop().toUpperCase();
    const div = document.createElement('div');
    div.className = 'file-item'; div.id = `file-item-${index}`;
    div.innerHTML = `<div class="file-icon">📄</div><div class="file-info"><div class="file-name">${file.name}</div><div class="file-size">${sizeKB} KB · ${ext}</div></div><span class="file-status ${status}" id="file-status-${index}">${status === 'parsing' ? '⏳ Parsing...' : '✓ Parsed'}</span><button class="file-remove" data-index="${index}" title="Remove">✕</button>`;
    div.querySelector('.file-remove').addEventListener('click', () => onRemove(index));
    return div;
  }

  function updateFileStatus(index, status) {
    const el = document.getElementById(`file-status-${index}`);
    if (el) { el.className = `file-status ${status}`; el.textContent = status === 'parsed' ? '✓ Parsed' : '⏳ Parsing...'; }
  }

  function renderCompanySelector(container, onSelect) {
    container.innerHTML = '';
    for (const [key, company] of Object.entries(CompanyProfiles)) {
      const card = document.createElement('div');
      card.className = 'company-card'; card.dataset.company = key;
      card.innerHTML = `<div class="company-logo" style="background:${company.color}">${company.icon}</div><div class="company-info"><h4>${company.name}</h4><p>${company.tagline}</p></div>`;
      card.addEventListener('click', () => {
        container.querySelectorAll('.company-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        onSelect(key, company);
      });
      container.appendChild(card);
    }
  }

  function renderParsedResults(candidates, requirements) {
    const container = document.getElementById('results-content');
    if (candidates.length === 0) { container.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><h3>No resumes parsed yet</h3><p>Upload resumes above to see extracted information here</p></div>`; return; }
    const grid = document.createElement('div');
    grid.className = 'results-grid';
    candidates.forEach((candidate, i) => {
      const card = document.createElement('div');
      card.className = 'glass-card resume-card'; card.style.animationDelay = `${i * 0.1}s`;
      const initials = candidate.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
      const reqSkills = requirements ? requirements.requiredSkills.map(s => s.toLowerCase()) : [];
      const skillChips = candidate.skillsList.slice(0, 12).map(s => {
        const matched = reqSkills.includes(s.toLowerCase()) ? 'matched' : '';
        return `<span class="resume-skill-chip ${matched}">${s}</span>`;
      }).join('');
      card.innerHTML = `
        <div class="resume-card-header"><div class="resume-avatar">${initials}</div><div><div class="resume-name">${candidate.name}</div><div class="resume-title">${candidate.experience.titles?.[0] || 'Candidate'} · ${candidate.fileName}</div></div></div>
        ${candidate.summary ? `<div class="resume-section"><div class="resume-section-title">Summary</div><p style="font-size:0.82rem;color:var(--text-secondary)">${candidate.summary.substring(0, 160)}${candidate.summary.length > 160 ? '...' : ''}</p></div>` : ''}
        <div class="resume-section"><div class="resume-section-title">Skills (${candidate.skillsList.length} found)</div><div class="resume-skills">${skillChips}${candidate.skillsList.length > 12 ? `<span class="resume-skill-chip">+${candidate.skillsList.length - 12} more</span>` : ''}</div></div>
        <div class="resume-section"><div class="resume-section-title">Details</div>
          ${candidate.experience.years ? `<div class="resume-detail">💼 ${candidate.experience.years} years experience</div>` : ''}
          ${candidate.education.degrees.length > 0 ? `<div class="resume-detail">🎓 ${candidate.education.degrees[0]}</div>` : `<div class="resume-detail">🎓 Education: ${candidate.education.level}</div>`}
          ${candidate.contact.email ? `<div class="resume-detail">📧 ${candidate.contact.email}</div>` : ''}
          ${candidate.contact.phone ? `<div class="resume-detail">📱 ${candidate.contact.phone}</div>` : ''}
          ${candidate.certifications.length > 0 ? `<div class="resume-detail">🏅 ${candidate.certifications.slice(0, 2).join(', ')}</div>` : ''}
        </div>`;
      grid.appendChild(card);
    });
    container.innerHTML = '';
    container.appendChild(grid);
  }

  function renderRankings(rankings) {
    const container = document.getElementById('rankings-content');
    if (rankings.length === 0) { container.innerHTML = `<div class="empty-state"><div class="empty-icon">📊</div><h3>No rankings yet</h3><p>Upload resumes and set job requirements to generate rankings</p></div>`; return; }
    container.innerHTML = `
      <div class="glass-card" style="padding:0;overflow:hidden;">
        <div class="ranking-table-wrapper"><table class="ranking-table">
          <thead><tr><th>Rank</th><th>Candidate</th><th>Overall Score</th><th>Skills Match</th><th>Relevance</th><th>Experience</th><th>Education</th><th>Key Skills</th></tr></thead>
          <tbody>${rankings.map(r => {
            const rankClass = r.rank <= 3 ? `rank-${r.rank}` : 'rank-other';
            const scoreClass = r.compositeScore >= 70 ? 'high' : r.compositeScore >= 40 ? 'medium' : 'low';
            const initials = r.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
            const matchedBadges = r.skillDetails.requiredMatched.slice(0, 3).map(s => `<span class="match-badge matched">${s}</span>`).join('');
            const missingBadges = r.skillDetails.requiredMissing.slice(0, 2).map(s => `<span class="match-badge missing">${s}</span>`).join('');
            return `<tr>
              <td><span class="rank-badge ${rankClass}">${r.rank}</span></td>
              <td><div class="candidate-cell"><div class="mini-avatar">${initials}</div><div><div class="candidate-name">${r.name}</div><div style="font-size:0.72rem;color:var(--text-muted)">${r.fileName}</div></div></div></td>
              <td><div class="score-bar"><div class="score-bar-track"><div class="score-bar-fill ${scoreClass}" style="width:${r.compositeScore}%"></div></div><span class="score-value ${scoreClass}">${r.compositeScore}</span></div></td>
              <td><span class="score-value ${r.skillScore >= 70 ? 'high' : r.skillScore >= 40 ? 'medium' : 'low'}">${r.skillScore}%</span></td>
              <td><span class="score-value ${r.tfidfScore >= 70 ? 'high' : r.tfidfScore >= 40 ? 'medium' : 'low'}">${r.tfidfScore}%</span></td>
              <td><span class="score-value ${r.experienceScore >= 70 ? 'high' : r.experienceScore >= 40 ? 'medium' : 'low'}">${r.experienceScore}%</span></td>
              <td><span class="score-value ${r.educationScore >= 70 ? 'high' : r.educationScore >= 40 ? 'medium' : 'low'}">${r.educationScore}%</span></td>
              <td><div class="skill-match-badges">${matchedBadges}${missingBadges}</div></td>
            </tr>`;
          }).join('')}</tbody>
        </table></div>
      </div>`;
  }

  function updateStats(resumeCount) {
    const el = document.getElementById('stat-resumes');
    if (el) { const from = parseInt(el.textContent) || 0; const start = performance.now(); (function step(ts) { const p = Math.min((ts - start) / 500, 1); el.textContent = Math.round(from + (resumeCount - from) * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); })(performance.now()); }
  }

  return { showToast, renderFileItem, updateFileStatus, renderCompanySelector, renderParsedResults, renderRankings, updateStats };
})();
