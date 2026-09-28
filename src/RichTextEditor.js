import React, { useEffect, useRef, useState } from 'react';
import './RichTextEditor.css';

const ALLOWED_TAGS = new Set(['A','B','BR','DIV','EM','I','LI','OL','P','SPAN','STRONG','U','UL']);
const ALLOWED_STYLE = new Set(['color','font-weight','font-style','text-decoration','text-align']);

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#039;');

export const sanitizeHtml = (html) => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(String(html), 'text/html');
  const cleanNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.nodeValue || '');
    if (node.nodeType !== Node.ELEMENT_NODE) return document.createDocumentFragment();
    const tag = node.tagName.toUpperCase();
    if (!ALLOWED_TAGS.has(tag)) {
      const fragment = document.createDocumentFragment();
      Array.from(node.childNodes).forEach(child => fragment.appendChild(cleanNode(child)));
      return fragment;
    }
    const el = document.createElement(tag.toLowerCase());
    if (tag === 'A') {
      const href = node.getAttribute('href') || '';
      if (/^(https?:|mailto:|tel:)/i.test(href)) {
        el.setAttribute('href', href);
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noreferrer noopener');
      }
    }
    const style = node.getAttribute('style') || '';
    const safeStyles = style.split(';').map(part => part.trim()).filter(Boolean).map(part => {
      const index = part.indexOf(':');
      if (index < 0) return null;
      const property = part.slice(0, index).trim().toLowerCase();
      const value = part.slice(index + 1).trim();
      if (!ALLOWED_STYLE.has(property) || /url\s*\(|expression\s*\(|javascript:/i.test(value)) return null;
      return property + ':' + value;
    }).filter(Boolean).join(';');
    if (safeStyles) el.setAttribute('style', safeStyles);
    Array.from(node.childNodes).forEach(child => el.appendChild(cleanNode(child)));
    return el;
  };
  const wrapper = document.createElement('div');
  Array.from(doc.body.childNodes).forEach(child => wrapper.appendChild(cleanNode(child)));
  return wrapper.innerHTML;
};

export const toRichHtml = (value) => {
  const raw = String(value ?? '');
  if (!raw.trim()) return '';
  if (/<[a-z][\s\S]*>/i.test(raw)) return sanitizeHtml(raw);
  return raw.split(/\n{2,}/).map(block => '<p>' + escapeHtml(block).replace(/\n/g, '<br>') + '</p>').join('');
};

export default function RichTextEditor({ label, value, onChange, placeholder }) {
  const editorRef = useRef(null);
  const savedRange = useRef(null);
  const [html, setHtml] = useState(() => toRichHtml(value));

  useEffect(() => {
    const next = toRichHtml(value);
    setHtml(next);
    if (editorRef.current && document.activeElement !== editorRef.current && editorRef.current.innerHTML !== next) {
      editorRef.current.innerHTML = next;
    }
  }, [value]);

  const saveSelection = () => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount || !editorRef.current) return;
    const range = selection.getRangeAt(0);
    if (editorRef.current.contains(range.commonAncestorContainer)) savedRange.current = range.cloneRange();
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    if (!selection || !savedRange.current) return;
    selection.removeAllRanges();
    selection.addRange(savedRange.current);
  };

  const command = (name, valueArg = null) => {
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand(name, false, valueArg);
    const next = sanitizeHtml(editorRef.current?.innerHTML || '');
    setHtml(next);
    onChange(next);
    saveSelection();
  };

  const handleInput = () => {
    const next = sanitizeHtml(editorRef.current?.innerHTML || '');
    setHtml(next);
    onChange(next);
  };

  const addLink = () => {
    saveSelection();
    const url = window.prompt('Enter URL');
    if (url) command('createLink', url.trim());
  };

  const applyColor = (event) => {
    restoreSelection();
    command('foreColor', event.target.value);
  };

  const toolbar = [
    ['bold','B','Bold'], ['italic','I','Italic'], ['underline','U','Underline'],
    ['insertUnorderedList','• List','Bullet list'], ['insertOrderedList','1. List','Numbered list'],
    ['justifyLeft','Left','Align left'], ['justifyCenter','Center','Align center'], ['justifyRight','Right','Align right'],
  ];

  return <div className="rich-editor-field">
    <div className="rich-editor-label">{label}</div>
    <div className="rich-editor" onMouseDown={saveSelection}>
      <div className="rich-editor-toolbar">
        {toolbar.map(([cmd, text, title]) => <button key={cmd} type="button" title={title} onMouseDown={e=>e.preventDefault()} onClick={()=>command(cmd)}>{text}</button>)}
        <button type="button" title="Add link" onMouseDown={e=>e.preventDefault()} onClick={addLink}>Link</button>
        <label className="rich-color" title="Text color" onMouseDown={saveSelection}>A<input type="color" defaultValue="#67e8f9" onChange={applyColor} /></label>
        <button type="button" title="Clear formatting" onMouseDown={e=>e.preventDefault()} onClick={()=>command('removeFormat')}>Clear</button>
        <span className="rich-toolbar-spacer" />
        <button type="button" title="Undo" onMouseDown={e=>e.preventDefault()} onClick={()=>command('undo')}>↶</button>
        <button type="button" title="Redo" onMouseDown={e=>e.preventDefault()} onClick={()=>command('redo')}>↷</button>
      </div>
      <div ref={editorRef} className="rich-editor-content" contentEditable suppressContentEditableWarning data-placeholder={placeholder || 'Write your content…'} dangerouslySetInnerHTML={{__html: html}} onInput={handleInput} onBlur={saveSelection} />
    </div>
    <small className="rich-editor-help">Select any words, then use <b>B</b>, <i>I</i>, <u>U</u> or the color picker.</small>
  </div>;
}
