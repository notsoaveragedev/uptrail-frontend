import { jsonTokens, TOKEN_TEXT } from "@/lib/jsonTokens";

export function JsonCode({ code, className = "" }: { code: string; className?: string }) {
  return (
    <pre className={`m-0 overflow-x-auto font-mono text-xs ${className}`}>
      {code.split("\n").map((line, index) => (
        <div key={index}>
          {jsonTokens(line).map((token, tokenIndex) => (
            <span key={tokenIndex} className={TOKEN_TEXT[token.kind]}>
              {token.text}
            </span>
          ))}
        </div>
      ))}
    </pre>
  );
}
