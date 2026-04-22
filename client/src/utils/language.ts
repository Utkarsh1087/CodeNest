export const extensionToLanguage: { [key: string]: string } = {
    js: "Javascript",
    jsx: "Javascript",
    ts: "Typescript",
    tsx: "Typescript",
    py: "Python",
    java: "Java",
    c: "C",
    cpp: "C++",
    h: "C++",
    hpp: "C++",
    cs: "C#",
    go: "Go",
    rs: "Rust",
    rb: "Ruby",
    php: "PHP",
    html: "HTML",
    css: "CSS",
    json: "JSON",
    md: "Markdown",
    txt: "Plaintext",
}

export const getLanguageByExtension = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase() || ""
    return extensionToLanguage[ext] || "Plaintext"
}
