const NLPEngine = (() => {
  const skillDictionary = {
    programming_languages: ["javascript","python","java","c++","c#","ruby","go","rust","swift","kotlin","typescript","php","scala","perl","r","matlab","dart","lua","haskell","elixir","clojure","objective-c","groovy","julia","f#","shell scripting","bash","powershell","sql","plsql"],
    web_technologies: ["html","css","sass","less","tailwind","bootstrap","react","angular","vue","svelte","next.js","nuxt.js","gatsby","express","node.js","django","flask","spring boot","asp.net","ruby on rails","laravel","fastapi","graphql","rest api","websockets","webpack","vite","babel","jquery","redux","mobx","zustand","three.js","d3.js","webgl","pwa","web components"],
    databases: ["mysql","postgresql","mongodb","redis","elasticsearch","cassandra","dynamodb","oracle","sql server","sqlite","mariadb","couchdb","neo4j","firebase","supabase","cockroachdb","influxdb","memcached"],
    cloud_devops: ["aws","azure","gcp","google cloud","docker","kubernetes","terraform","ansible","jenkins","github actions","gitlab ci","circleci","nginx","apache","linux","ci/cd","devops","microservices","serverless","lambda","cloudformation","helm","istio","prometheus","grafana","datadog","new relic","splunk"],
    data_science_ai: ["machine learning","deep learning","nlp","natural language processing","computer vision","tensorflow","pytorch","keras","scikit-learn","pandas","numpy","scipy","matplotlib","seaborn","jupyter","data analysis","data visualization","big data","hadoop","spark","kafka","airflow","data engineering","data pipeline","etl","power bi","tableau","reinforcement learning","generative ai","llm","transformers","hugging face","opencv","neural networks","regression","classification","clustering"],
    mobile: ["react native","flutter","ios","android","xamarin","ionic","swiftui","jetpack compose","kotlin multiplatform","expo"],
    tools_practices: ["git","github","gitlab","bitbucket","jira","confluence","agile","scrum","kanban","tdd","bdd","unit testing","integration testing","e2e testing","jest","mocha","cypress","selenium","playwright","postman","swagger","figma","sketch","storybook","design patterns","solid principles","oop","functional programming","system design","api design"],
    soft_skills: ["leadership","communication","teamwork","problem solving","critical thinking","time management","project management","mentoring","collaboration","presentation","negotiation","adaptability","decision making","strategic thinking","stakeholder management","cross-functional"],
    security: ["cybersecurity","penetration testing","owasp","encryption","ssl/tls","oauth","jwt","sso","identity management","firewall","vulnerability assessment","security audit"],
    certifications: ["aws certified","azure certified","gcp certified","pmp","scrum master","cissp","ceh","comptia","ccna","ccnp","oracle certified","google certified","salesforce certified","itil","six sigma","togaf","cka","ckad"]
  };

  async function loadSkills() { return skillDictionary; }

  function extractContact(text) {
    const contact = {};
    const emails = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g);
    if (emails) contact.email = emails[0];
    const phones = text.match(/(?:\+?\d{1,3}[\s\-.]?)?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}/g);
    if (phones) contact.phone = phones[0].trim();
    const linkedin = text.match(/(?:linkedin\.com\/in\/|linkedin:\s*)([a-zA-Z0-9\-]+)/i);
    if (linkedin) contact.linkedin = linkedin[1];
    const github = text.match(/(?:github\.com\/|github:\s*)([a-zA-Z0-9\-]+)/i);
    if (github) contact.github = github[1];
    return contact;
  }

  function extractName(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      if (/^(resume|curriculum|cv|objective|summary|profile|experience|education|skills|contact)/i.test(line)) continue;
      if (/@/.test(line) || /\d{3}/.test(line) || /http/i.test(line)) continue;
      const words = line.split(/\s+/);
      if (words.length >= 2 && words.length <= 5) {
        if (words.every(w => /^[A-Z]/.test(w) || /^[A-Z]+$/.test(w))) return line;
      }
    }
    if (lines.length > 0 && lines[0].length < 60 && lines[0].length > 2) return lines[0];
    return 'Unknown Candidate';
  }

  async function extractSkills(text) {
    const dict = await loadSkills();
    const normalizedText = text.toLowerCase();
    const found = {};
    for (const [category, skills] of Object.entries(dict)) {
      for (const skill of skills) {
        const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = skill.length <= 3
          ? new RegExp(`\\b${escaped}\\b`, 'i')
          : new RegExp(`(?:^|[\\s,;|/\\(])${escaped}(?:[\\s,;|/\\)]|$)`, 'i');
        if (regex.test(normalizedText)) {
          if (!found[category]) found[category] = [];
          if (!found[category].includes(skill)) found[category].push(skill);
        }
      }
    }
    return found;
  }

  function flattenSkills(skillsObj) {
    const all = [];
    for (const arr of Object.values(skillsObj)) all.push(...arr);
    return all;
  }

  function extractEducation(text) {
    const education = [];
    const degreePatterns = [
      /(?:ph\.?d|doctor(?:ate)?)\s*(?:of|in)?\s*[^,.\n]{0,80}/gi,
      /(?:m\.?s\.?|master(?:'?s)?)\s*(?:of|in)?\s*[^,.\n]{0,80}/gi,
      /(?:m\.?b\.?a\.?)\s*[^,.\n]{0,60}/gi,
      /(?:b\.?s\.?|b\.?tech|b\.?e\.?|bachelor(?:'?s)?)\s*(?:of|in)?\s*[^,.\n]{0,80}/gi,
      /(?:b\.?c\.?a|m\.?c\.?a)\s*[^,.\n]{0,60}/gi,
    ];
    const seen = new Set();
    for (const pattern of degreePatterns) {
      for (const m of text.matchAll(pattern)) {
        const deg = m[0].trim().substring(0, 100);
        const key = deg.toLowerCase().replace(/\s+/g, ' ');
        if (!seen.has(key)) { seen.add(key); education.push(deg); }
      }
    }
    const textLower = text.toLowerCase();
    let level = 'unknown';
    if (/ph\.?d|doctor/i.test(textLower)) level = 'phd';
    else if (/master|m\.?s\.|m\.?b\.?a|m\.?tech/i.test(textLower)) level = 'masters';
    else if (/bachelor|b\.?s\.|b\.?tech|b\.?e\.|b\.?c\.?a/i.test(textLower)) level = 'bachelors';
    else if (/associate|diploma/i.test(textLower)) level = 'associate';
    return { degrees: education.slice(0, 5), level };
  }

  function extractExperience(text) {
    const experience = {};
    const yearsPatterns = [
      /(\d{1,2})\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)/i,
      /(?:experience|exp)\s*(?:of)?\s*(\d{1,2})\+?\s*(?:years?|yrs?)/i,
      /over\s*(\d{1,2})\s*(?:years?|yrs?)/i,
    ];
    for (const pattern of yearsPatterns) {
      const match = text.match(pattern);
      if (match) { experience.years = parseInt(match[1], 10); break; }
    }
    if (!experience.years) {
      let totalYears = 0;
      for (const m of text.matchAll(/(\d{4})\s*[-–—to]+\s*(\d{4}|present|current)/gi)) {
        const start = parseInt(m[1], 10);
        const end = m[2].toLowerCase() === 'present' || m[2].toLowerCase() === 'current' ? new Date().getFullYear() : parseInt(m[2], 10);
        if (start >= 1980 && end >= start) totalYears += (end - start);
      }
      if (totalYears > 0) experience.years = totalYears;
    }
    const titles = new Set();
    for (const m of text.matchAll(/(?:^|\n)\s*((?:senior|junior|lead|principal|staff|chief|head)\s+)?(?:software|frontend|backend|full[\s-]?stack|mobile|web|data|ml|ai|devops|cloud|security|qa|test|platform|infrastructure|site reliability|product|project|program|engineering|technical)\s*(?:engineer|developer|architect|analyst|scientist|manager|lead|consultant|specialist|administrator|designer|tester|director|vp)/gim)) {
      titles.add(m[0].trim());
    }
    experience.titles = [...titles].slice(0, 5);
    return experience;
  }

  function extractCertifications(text) {
    const certPatterns = [/aws\s+certified\s+[^,.\n]{0,50}/gi, /azure\s+(?:certified|fundamentals|administrator|developer|architect)\s*[^,.\n]{0,40}/gi, /google\s+(?:certified|cloud)\s*[^,.\n]{0,40}/gi, /pmp(?:\s+certified)?/gi, /certified\s+scrum\s+master|csm/gi, /cissp/gi, /ceh\b/gi, /comptia\s+[a-z+]+/gi, /ccna|ccnp/gi, /oracle\s+certified\s*[^,.\n]{0,40}/gi, /itil\s*(?:v\d)?(?:\s+foundation)?/gi, /six\s+sigma\s*(?:green|black|yellow)?\s*(?:belt)?/gi, /togaf/gi, /cka\b|ckad\b/gi, /salesforce\s+certified\s*[^,.\n]{0,40}/gi];
    const certs = new Set();
    for (const pattern of certPatterns) for (const m of text.matchAll(pattern)) certs.add(m[0].trim());
    return [...certs].slice(0, 10);
  }

  function extractSummary(text) {
    const match = text.match(/(?:summary|profile|objective|about\s*me|professional\s*summary)[:\s\-]*\n?([\s\S]{20,300}?)(?:\n\s*\n|(?=\n\s*(?:experience|education|skills|work|project|certification)))/i);
    if (match) return match[1].trim().replace(/\s+/g, ' ');
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 50);
    if (paragraphs.length > 0) return paragraphs[0].trim().replace(/\s+/g, ' ').substring(0, 250);
    return '';
  }

  async function extractAll(text) {
    const skills = await extractSkills(text);
    return {
      name: extractName(text), contact: extractContact(text), skills,
      skillsList: flattenSkills(skills), education: extractEducation(text),
      experience: extractExperience(text), certifications: extractCertifications(text),
      summary: extractSummary(text), rawText: text,
    };
  }

  return { extractAll, loadSkills, flattenSkills };
})();
