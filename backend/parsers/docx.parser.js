import mammoth from "mammoth";

const parseDOCX = async (filePath) => {
    const data = await mammoth.extractRawText({ path: filePath });
    return data.value;
}

export default parseDOCX;