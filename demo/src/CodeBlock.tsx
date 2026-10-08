import { Fragment, type ReactNode } from "react";

const tokenPattern =
  /(<\/?[A-Za-z][A-Za-z0-9./-]*)|([a-zA-Z][a-zA-Z0-9]*=)|"([^"]*)"|\{(true|false)\}|\{(\d+)\}/g;

function renderLine(line: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of line.matchAll(tokenPattern)) {
    const [fullMatch, tagToken, propToken, stringToken, boolToken, numToken] =
      match;
    const start = match.index ?? 0;

    if (start > lastIndex) {
      parts.push(line.slice(lastIndex, start));
    }

    if (tagToken) {
      const prefix = tagToken.startsWith("</") ? "</" : "<";
      const tagName = tagToken.slice(prefix.length);
      parts.push(prefix);
      parts.push(
        <span key={`${start}-tag`} className="token-tag">
          {tagName}
        </span>
      );
    } else if (propToken) {
      parts.push(
        <span key={`${start}-prop`} className="token-prop">
          {propToken.slice(0, -1)}
        </span>
      );
      parts.push("=");
    } else if (stringToken != null) {
      parts.push('"');
      parts.push(
        <span key={`${start}-str`} className="token-str">
          {stringToken}
        </span>
      );
      parts.push('"');
    } else if (boolToken) {
      parts.push("{");
      parts.push(
        <span key={`${start}-bool`} className="token-bool">
          {boolToken}
        </span>
      );
      parts.push("}");
    } else if (numToken) {
      parts.push("{");
      parts.push(
        <span key={`${start}-num`} className="token-num">
          {numToken}
        </span>
      );
      parts.push("}");
    }

    lastIndex = start + fullMatch.length;
  }

  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex));
  }

  return parts;
}

export function CodeBlock({ code }: { code: string }) {
  const lines = code.split("\n");

  return (
    <div className="demo-code">
      {lines.map((line, index) => (
        <Fragment key={index}>
          {renderLine(line)}
          {index < lines.length - 1 ? "\n" : null}
        </Fragment>
      ))}
    </div>
  );
}

export function ValueDisplay({
  label = "Selected value",
  value,
}: {
  label?: string;
  value: string;
}) {
  return (
    <div>
      <div className="demo-value-label">{label}</div>
      <div className="demo-value">{value || "null"}</div>
    </div>
  );
}
