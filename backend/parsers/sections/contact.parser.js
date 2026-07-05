const EMAIL_RE = /[\w.-]+@[\w.-]+\.\w+/i;
const PHONE_RE = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
const LINKEDIN_RE = /linkedin\.com\/[^\s,;)\]]+/i;
const GITHUB_RE = /github\.com\/[^\s,;)\]]+/i;
const GITHUB_HANDLE = /[§#]\s*([A-Za-z][\w-]+)\b/g;
const URL_RE = /https?:\/\/[^\s,;)\]>]+/gi;

const isNameLine = (line) => {
    const clean = line.trim();
    if (!clean) return false;
    if (EMAIL_RE.test(clean)) return false;
    if (PHONE_RE.test(clean)) return false;
    if (/^https?:\/\//i.test(clean)) return false;
    if (/^[0-9\s\-+()]+$/.test(clean)) return false;
    if (clean.length > 60) return false;
    const words = clean.split(/\s+/);
    if (words.length < 2 || words.length > 6) return false;
    if (!/^[A-Z][a-z]/.test(words[0])) return false;
    return true;
};

const parseContact = (text) => {
    const result = {
        name: "",
        email: "",
        phone: "",
        links: {
            linkedin: "",
            github: "",
            portfolio: "",
        },
    };

    if (!text) return result;

    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

    for (const line of lines) {
        if (!result.name && isNameLine(line)) {
            result.name = line;
        }

        const emailMatch = line.match(EMAIL_RE);
        if (emailMatch && !result.email) {
            result.email = emailMatch[0].toLowerCase();
        }

        const phoneMatch = line.match(PHONE_RE);
        if (phoneMatch && !result.phone) {
            result.phone = phoneMatch[0];
        }

        const linkedinMatch = line.match(LINKEDIN_RE);
        if (linkedinMatch && !result.links.linkedin) {
            result.links.linkedin = `https://${linkedinMatch[0]}`;
        }

        const githubMatch = line.match(GITHUB_RE);
        if (githubMatch && !result.links.github) {
            result.links.github = `https://${githubMatch[0]}`;
        }
    }

    const allUrls = text.match(URL_RE) || [];
    for (const url of allUrls) {
        if (url.includes("linkedin.com") && !result.links.linkedin) {
            result.links.linkedin = url;
        } else if (url.includes("github.com") && !result.links.github) {
            result.links.github = url;
        } else if (
            !url.includes("linkedin.com") &&
            !url.includes("github.com") &&
            !result.links.portfolio
        ) {
            result.links.portfolio = url;
        }
    }

    if (!result.links.github) {
        for (const line of lines) {
            GITHUB_HANDLE.lastIndex = 0;
            const allHandles = [];
            let m;
            while ((m = GITHUB_HANDLE.exec(line)) !== null) {
                allHandles.push(m);
            }
            for (const match of allHandles) {
                const handle = match[1];
                const afterHandleIdx = match.index + match[0].length;
                const nextChar = line[afterHandleIdx];
                if (nextChar === "@") continue;
                const prefix = line.slice(Math.max(0, match.index - 3), match.index);
                if (/@/.test(prefix)) continue;
                if (handle.length > 2 && !/^\d+$/.test(handle)) {
                    result.links.github = `https://github.com/${handle}`;
                    break;
                }
            }
            if (result.links.github) break;
        }
    }

    return result;
};

export default parseContact;
