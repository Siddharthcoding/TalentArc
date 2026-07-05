const PHONE_RE = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;

const parsePhoneNumber = (text) => {
    const match = text.match(PHONE_RE);
    return match ? match[0] : "";
};

export { parsePhoneNumber };
