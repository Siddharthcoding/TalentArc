const PHONE_CLEAN_RE = /[^\d]/g;
const EMAIL_RE = /^[\w.-]+@[\w.-]+\.\w+$/;

const analyzeContact = (contact) => {
    const flags = [];
    const details = {};
    let deductions = 0;

    if (!contact.name || contact.name.trim().length < 2) {
        flags.push("Candidate name not found or too short");
        deductions += 2.5;
    } else {
        details.name = contact.name;
    }

    const email = contact.email || "";
    if (!email || !EMAIL_RE.test(email)) {
        flags.push("Valid email address not found");
        deductions += 2;
    } else {
        details.email = email;
    }

    const phone = contact.phone || "";
    const phoneDigits = phone.replace(PHONE_CLEAN_RE, "");
    if (!phone || phoneDigits.length < 7) {
        flags.push("Valid phone number not found");
        deductions += 2;
    } else {
        details.phone = phone;
    }

    const linkedin = contact.links?.linkedin || "";
    if (!linkedin) {
        flags.push("LinkedIn profile URL not found");
        deductions += 1.5;
    } else {
        details.linkedin = linkedin;
    }

    const github = contact.links?.github || "";
    const portfolio = contact.links?.portfolio || "";

    if (!github && !portfolio) {
        flags.push("No professional portfolio or GitHub URL found");
        deductions += 1;
    } else {
        details.professionalUrls = [];
        if (github) details.professionalUrls.push("GitHub: " + github);
        if (portfolio) details.professionalUrls.push("Portfolio: " + portfolio);
    }

    const totalUrls = [linkedin, github, portfolio].filter(Boolean).length;
    if (totalUrls === 0) {
        flags.push("No professional URLs found — consider adding LinkedIn and GitHub");
        deductions += 1;
    }

    const score = Math.max(0, 10 - deductions);
    return {
        score: Math.round(score * 10) / 10,
        maxScore: 10,
        flags,
        details,
    };
};

export default analyzeContact;
