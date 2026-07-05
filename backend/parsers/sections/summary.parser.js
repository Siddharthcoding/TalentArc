const parseSummary = (text) => {
    if (!text) return "";
    return text.replace(/\s+/g, " ").trim();
};

export default parseSummary;
