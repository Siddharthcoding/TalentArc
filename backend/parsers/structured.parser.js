import parseContact from "./sections/contact.parser.js";
import parseSummary from "./sections/summary.parser.js";
import parseEducation from "./sections/education.parser.js";
import parseExperience from "./sections/experience.parser.js";
import parseProjects from "./sections/projects.parser.js";
import parseSkills from "./sections/skills.parser.js";
import parseAchievements from "./sections/achievements.parser.js";

const SECTION_PATTERNS = [
    { name: "summary", patterns: [/^(summary|professional\s*summary|profile|about\s*me)\s*$/i] },
    { name: "education", patterns: [/^(education|academic\s*background|academic\s*qualifications)\s*$/i] },
    { name: "experience", patterns: [/^(experience|work\s*experience|employment|work\s*history|professional\s*experience)\s*$/i] },
    { name: "projects", patterns: [/^(projects|personal\s*projects|academic\s*projects|key\s*projects)\s*$/i] },
    { name: "skills", patterns: [/^(skills|technical\s*skills|skills\s*&\s*expertise|core\s*competencies|technologies)\s*$/i] },
    { name: "achievements", patterns: [/^(achievements|awards|honors|certifications|certificates|accomplishments)\s*$/i] },
    { name: "coursework", patterns: [/^(coursework|relevant\s*coursework|courses|relevant\s*courses)\s*$/i] },
];

const splitIntoSections = (text) => {
    const sections = { preamble: "" };
    const lines = text.split("\n");
    let currentSection = "preamble";
    let currentLines = [];

    for (const line of lines) {
        const trimmed = line.trim();

        let matched = null;
        for (const sec of SECTION_PATTERNS) {
            for (const pattern of sec.patterns) {
                if (pattern.test(trimmed)) {
                    matched = sec.name;
                    break;
                }
            }
            if (matched) break;
        }

        if (matched) {
            sections[currentSection] = currentLines.join("\n").trim();
            currentSection = matched;
            currentLines = [];
        } else {
            currentLines.push(line);
        }
    }

    sections[currentSection] = currentLines.join("\n").trim();

    return sections;
};

const parseStructured = (normalizedText) => {
    const sections = splitIntoSections(normalizedText);

    const contact = parseContact(sections.preamble);
    const summary = sections.summary || "";

    return {
        summary: parseSummary(summary),
        contact,
        education: parseEducation(sections.education || ""),
        experience: parseExperience(sections.experience || ""),
        projects: parseProjects(sections.projects || ""),
        skills: parseSkills(sections.skills || ""),
        achievements: parseAchievements(sections.achievements || ""),
    };
};

export default parseStructured;
