const LANGUAGE_IDS = { // https://ce.judge0.com/languages
    "c": 50,
    "cpp": 54,
    "go": 95,
    "java": 91,
    "javascript": 93,
    "python": 92,
    "ruby": 72
};

const LANGUAGE_ALIASES = {
    "c++": "cpp",
    "golang": "go",
    "js": "javascript"
}

function getLanguageId(language) {
    let l = language.toLowerCase();
    return LANGUAGE_IDS[LANGUAGE_ALIASES[l] || l] || 0;
}

function encode(str) {
    return btoa(unescape(encodeURIComponent(str || "")));
}

function decode(bytes) {
    var escaped = escape(atob(bytes || ""));
    try {
        return decodeURIComponent(escaped);
    } catch {
        return unescape(escaped);
    }
}

async function code_execution(params, userSettings) {
    const { source_code, language } = params;
    const { rapidApiKey } = userSettings;

    const languageId = getLanguageId(language);
    if (languageId == 0) {
        return `Unsupported language ${language}`;
    }

    const requestHeaders = new Headers();
    requestHeaders.append("x-rapidapi-key", rapidApiKey);
    requestHeaders.append("Content-Type", "application/json");

    const requestData = {
        "language_id": languageId,
        "source_code": encode(source_code),
        "redirect_stderr_to_stdout": true
    };

    let response = await fetch("https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true", {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify(requestData)
    });

    if (!response.ok) {
        return "Network error";
    }

    let responseData = await response.json();
    return [decode(responseData["compile_output"]), decode(responseData["stdout"])].join("\n").trim();
}
