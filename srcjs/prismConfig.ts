import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/prism";
import rLang from "refractor/r";
import pythonLang from "refractor/python";
import javascriptLang from "refractor/javascript";
import typescriptLang from "refractor/typescript";
import bashLang from "refractor/bash";
import sqlLang from "refractor/sql";
import jsonLang from "refractor/json";
import markupLang from "refractor/markup";
import cssLang from "refractor/css";
import jsxLang from "refractor/jsx";
import tsxLang from "refractor/tsx";
import yamlLang from "refractor/yaml";

SyntaxHighlighter.registerLanguage("r",          rLang);
SyntaxHighlighter.registerLanguage("R",          rLang);
SyntaxHighlighter.registerLanguage("python",     pythonLang);
SyntaxHighlighter.registerLanguage("py",         pythonLang);
SyntaxHighlighter.registerLanguage("javascript", javascriptLang);
SyntaxHighlighter.registerLanguage("js",         javascriptLang);
SyntaxHighlighter.registerLanguage("typescript", typescriptLang);
SyntaxHighlighter.registerLanguage("ts",         typescriptLang);
SyntaxHighlighter.registerLanguage("bash",       bashLang);
SyntaxHighlighter.registerLanguage("shell",      bashLang);
SyntaxHighlighter.registerLanguage("sh",         bashLang);
SyntaxHighlighter.registerLanguage("sql",        sqlLang);
SyntaxHighlighter.registerLanguage("json",       jsonLang);
SyntaxHighlighter.registerLanguage("html",       markupLang);
SyntaxHighlighter.registerLanguage("xml",        markupLang);
SyntaxHighlighter.registerLanguage("css",        cssLang);
SyntaxHighlighter.registerLanguage("jsx",        jsxLang);
SyntaxHighlighter.registerLanguage("tsx",        tsxLang);
SyntaxHighlighter.registerLanguage("yaml",       yamlLang);
SyntaxHighlighter.registerLanguage("yml",        yamlLang);

export { SyntaxHighlighter };

export const SUPPORTED_LANGS = new Set([
  "r", "python", "py", "javascript", "js", "typescript", "ts",
  "bash", "shell", "sh", "sql", "json", "html", "xml", "css",
  "jsx", "tsx", "yaml", "yml",
]);

export const codeTheme = {
  ...nightOwl,
  'pre[class*="language-"]': {
    ...(nightOwl as any)['pre[class*="language-"]'],
    margin: 0,
    borderRadius: 0,
    fontSize: 13,
    lineHeight: 1.6,
  },
  // R: TRUE/FALSE/NA/NULL map to boolean token which is red in nightOwl — remap to orange
  'boolean': { color: 'rgb(247, 140, 108)' },
};

export const CODE_TAG_PROPS = { style: { background: "transparent", color: "inherit" } };
