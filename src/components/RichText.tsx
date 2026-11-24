import type { ReactNode } from 'react';

/** Minimal, safe markdown-ish renderer: **bold**, *italic*, `code`, "- " bullets, line breaks. */
function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('**')) out.push(<b key={keyBase + k++}>{tok.slice(2, -2)}</b>);
    else if (tok.startsWith('`')) out.push(<code key={keyBase + k++} className="kbd">{tok.slice(1, -1)}</code>);
    else out.push(<i key={keyBase + k++}>{tok.slice(1, -1)}</i>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function RichText({ text }: { text: string }) {
  const lines = text.split('\n');
  const blocks: ReactNode[] = [];
  let list: ReactNode[] = [];
  const flush = (i: number) => {
    if (list.length) {
      blocks.push(<ul key={'ul' + i} style={{ margin: '6px 0', paddingLeft: 20 }}>{list}</ul>);
      list = [];
    }
  };
  lines.forEach((raw, i) => {
    const line = raw.replace(/^#{1,6}\s+/, '');
    const bullet = /^\s*([-•*]|\d+\.)\s+(.*)$/.exec(line);
    if (bullet) {
      list.push(<li key={i} style={{ margin: '3px 0' }}>{inline(bullet[2], 'l' + i)}</li>);
      return;
    }
    flush(i);
    if (!line.trim()) blocks.push(<div key={i} style={{ height: 8 }} />);
    else blocks.push(<div key={i}>{inline(line, 'p' + i)}</div>);
  });
  flush(lines.length);
  return <div style={{ whiteSpace: 'normal' }}>{blocks}</div>;
}
