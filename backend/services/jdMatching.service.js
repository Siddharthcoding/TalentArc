import matchSkills from "../matchers/skill.matcher.js";
import matchKeywords from "../matchers/keyword.matcher.js";
import matchExperience from "../matchers/experience.matcher.js";
import matchEducation from "../matchers/education.matcher.js";
import matchSemantic from "../matchers/semantic.matcher.js";
import suggestRewrites from "../matchers/rewrite.matcher.js";

const runJDMatching = (jd, resume, normalizedText) => {
    const skill = matchSkills(jd, resume);
    const keyword = matchKeywords(jd, resume, normalizedText);
    const experience = matchExperience(jd, resume);
    const education = matchEducation(jd, resume);

    return { skill, keyword, experience, education };
};

const runAsyncMatching = async (jd, resume, normalizedText, syncResults) => {
    const semantic = await matchSemantic(jd, resume, normalizedText);
    const rewrite = await suggestRewrites(jd, resume, syncResults);

    return { semantic, rewrite };
};

export { runJDMatching, runAsyncMatching };
