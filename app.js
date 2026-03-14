(function () {
  'use strict';

  const state = { files: [], candidates: [], selectedCompany: null, requirements: null, rankings: [], skillTags: [] };

  const uploadZone = document.getElementById('upload-zone');
  const fileInput = document.getElementById('file-input');
  const browseBtn = document.getElementById('browse-btn');
  const fileList = document.getElementById('file-list');
  const companySelector = document.getElementById('company-selector');
  const jobTitle = document.getElementById('job-title');
  const jobDescription = document.getElementById('job-description');
  const skillTagsContainer = document.getElementById('skill-tags-container');
  const skillTagsInput = document.getElementById('skill-tags-input');
  const minExperience = document.getElementById('min-experience');
  const educationLevel = document.getElementById('education-level');
  const rankBtn = document.getElementById('rank-btn');
  const navbar = document.getElementById('navbar');

  function init() {
    NLPEngine.loadSkills();
    setupUpload(); setupCompanySelector(); setupSkillTags(); setupRankButton(); setupNavbar(); setupSmoothScroll();
    // Check if CDN libraries loaded
    setTimeout(() => {
      const pdfOk = typeof pdfjsLib !== 'undefined';
      const mammothOk = typeof mammoth !== 'undefined';
      if (!pdfOk || !mammothOk) {
        const warning = document.getElementById('lib-warning');
        if (warning) warning.style.display = 'block';
        if (!pdfOk && !mammothOk) {
          document.getElementById('file-input').setAttribute('accept', '.txt');
          document.getElementById('upload-formats').innerHTML = '<span class="format-badge" style="border-color:rgba(245,158,11,0.3);color:#fbbf24">.TXT only (offline mode)</span>';
        }
      }
    }, 1000);
  }

  function setupNavbar() {
    window.addEventListener('scroll', () => { navbar.classList.toggle('scrolled', window.scrollY > 50); });
  }

  function setupSmoothScroll() {
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active')); link.classList.add('active'); }
      });
    });
  }

  function setupUpload() {
    browseBtn.addEventListener('click', e => { e.stopPropagation(); fileInput.click(); });
    uploadZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', e => { handleFiles(Array.from(e.target.files)); fileInput.value = ''; });
    uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
    uploadZone.addEventListener('drop', e => {
      e.preventDefault(); uploadZone.classList.remove('drag-over');
      const files = Array.from(e.dataTransfer.files).filter(f => f.name.match(/\.(pdf|docx|txt)$/i));
      if (files.length === 0) { UI.showToast('Please upload PDF, DOCX, or TXT files', 'error'); return; }
      handleFiles(files);
    });
  }

  async function handleFiles(newFiles) {
    for (const file of newFiles) {
      if (state.files.some(f => f.name === file.name && f.size === file.size)) { UI.showToast(`${file.name} is already uploaded`, 'info'); continue; }
      const index = state.files.length;
      state.files.push(file);
      fileList.appendChild(UI.renderFileItem(file, index, removeFile, 'parsing'));
      try {
        const extracted = await ResumeParser.parseAndExtract(file);
        state.candidates.push(extracted);
        UI.updateFileStatus(index, 'parsed');
        UI.showToast(`Parsed: ${file.name} — ${extracted.skillsList.length} skills found`, 'success');
      } catch (err) {
        UI.updateFileStatus(index, 'error');
        UI.showToast(`Failed to parse ${file.name}: ${err.message}`, 'error');
      }
    }
    UI.updateStats(state.candidates.length);
    UI.renderParsedResults(state.candidates, state.requirements);
    updateRankButtonState();
  }

  function removeFile(index) {
    const el = document.getElementById(`file-item-${index}`);
    if (el) { el.style.opacity = '0'; el.style.transform = 'translateX(-20px)'; el.style.transition = 'all 0.3s ease'; setTimeout(() => el.remove(), 300); }
    const fileName = state.files[index]?.name;
    state.files[index] = null;
    state.candidates = state.candidates.filter(c => c.fileName !== fileName);
    UI.updateStats(state.candidates.length);
    UI.renderParsedResults(state.candidates, state.requirements);
    updateRankButtonState();
  }

  function setupCompanySelector() {
    UI.renderCompanySelector(companySelector, (key, company) => {
      state.selectedCompany = key;
      if (key === 'custom') { jobTitle.value = ''; jobDescription.value = ''; state.skillTags = []; renderSkillTags(); minExperience.value = 0; educationLevel.value = 'any'; }
      else { jobTitle.value = company.jobTitle; jobDescription.value = company.description; state.skillTags = [...company.requiredSkills]; renderSkillTags(); minExperience.value = company.minExperience; educationLevel.value = company.educationLevel; }
      updateRankButtonState();
      UI.showToast(`Selected: ${company.name}`, 'info');
    });
  }

  function setupSkillTags() {
    skillTagsInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); const val = skillTagsInput.value.trim().toLowerCase(); if (val && !state.skillTags.includes(val)) { state.skillTags.push(val); renderSkillTags(); updateRankButtonState(); } skillTagsInput.value = ''; }
      else if (e.key === 'Backspace' && !skillTagsInput.value && state.skillTags.length > 0) { state.skillTags.pop(); renderSkillTags(); }
    });
    skillTagsContainer.addEventListener('click', () => skillTagsInput.focus());
  }

  function renderSkillTags() {
    skillTagsContainer.querySelectorAll('.skill-tag').forEach(t => t.remove());
    state.skillTags.forEach((skill, i) => {
      const tag = document.createElement('span'); tag.className = 'skill-tag';
      tag.innerHTML = `${skill}<span class="remove-tag" data-index="${i}">✕</span>`;
      tag.querySelector('.remove-tag').addEventListener('click', e => { e.stopPropagation(); state.skillTags.splice(i, 1); renderSkillTags(); updateRankButtonState(); });
      skillTagsContainer.insertBefore(tag, skillTagsInput);
    });
  }

  function setupRankButton() { rankBtn.addEventListener('click', performRanking); }

  function updateRankButtonState() {
    rankBtn.disabled = !(state.candidates.length > 0 && (state.skillTags.length > 0 || jobDescription.value.trim().length > 0));
  }

  function performRanking() {
    const company = state.selectedCompany ? CompanyProfiles[state.selectedCompany] : null;
    state.requirements = {
      jobTitle: jobTitle.value || 'General', description: jobDescription.value,
      requiredSkills: [...state.skillTags], preferredSkills: company?.preferredSkills || [],
      minExperience: parseInt(minExperience.value, 10) || 0, educationLevel: educationLevel.value,
    };
    state.rankings = CandidateRanker.rankCandidates(state.candidates, state.requirements);
    UI.renderParsedResults(state.candidates, state.requirements);
    UI.renderRankings(state.rankings);
    document.getElementById('rankings').scrollIntoView({ behavior: 'smooth', block: 'start' });
    UI.showToast(`Ranked ${state.rankings.length} candidates! 🏆`, 'success');
    if (state.rankings.length > 0 && state.rankings[0].compositeScore >= 50) launchConfetti();
  }

  function launchConfetti() {
    const colors = ['#6366f1','#8b5cf6','#a78bfa','#34d399','#fbbf24','#f87171','#06b6d4'];
    const container = document.getElementById('rankings');
    for (let i = 0; i < 40; i++) {
      const c = document.createElement('div');
      c.style.cssText = `position:absolute;width:${Math.random()*8+4}px;height:${Math.random()*8+4}px;background:${colors[Math.floor(Math.random()*colors.length)]};border-radius:${Math.random()>0.5?'50%':'2px'};top:0;left:${Math.random()*100}%;z-index:100;pointer-events:none;animation:confetti ${Math.random()+1}s ease-out forwards;animation-delay:${Math.random()*0.3}s;`;
      container.style.position = 'relative'; container.appendChild(c);
      setTimeout(() => c.remove(), 2500);
    }
  }

  jobDescription.addEventListener('input', updateRankButtonState);
  jobTitle.addEventListener('input', updateRankButtonState);

  document.addEventListener('DOMContentLoaded', () => {
    init();
    const observer = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; } }); }, { threshold: 0.1 });
    document.querySelectorAll('.glass-card, .section-header').forEach(el => { el.style.opacity = '0'; el.style.transform = 'translateY(20px)'; el.style.transition = 'all 0.6s ease-out'; observer.observe(el); });
  });
})();
