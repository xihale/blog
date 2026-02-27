import { visit } from 'unist-util-visit';
import { h } from 'hastscript';

/**
 * Custom directive handler using remark-directive infrastructure
 * This plugin converts container directives into styled admonition divs
 */

/** @type {Record<string, string>} */
const DEFAULT_TITLES = {
    note: 'Note',
    tip: 'Tip',
    warning: 'Warning',
    danger: 'Danger',
    info: 'Info',
    success: 'Success',
    question: 'Question',
    quote: 'Quote',
    future: 'Future',
    error: 'Error'
};

/** @type {Record<string, string>} */
const TYPE_ALIASES = {
    err: 'error',
    error: 'error',
    warn: 'warning',
    warning: 'warning',
    danger: 'danger',
    info: 'info',
    note: 'note',
    tip: 'tip',
    tips: 'tip',
    ok: 'success',
    success: 'success',
    question: 'question',
    q: 'question',
    quote: 'quote',
    future: 'future',
    todo: 'future'
};

const ALERT_TYPES = new Set(['warning', 'danger', 'error']);

function normalizeType(rawType) {
    const key = rawType.toLowerCase();
    return TYPE_ALIASES[key] ?? key;
}

/**
 * Get default title for directive type
 * @param {string} type
 * @returns {string}
 */
function getDefaultTitle(type) {
    return DEFAULT_TITLES[type] ?? type.charAt(0).toUpperCase() + type.slice(1);
}

export function remarkCustomDirectives() {
    return (tree) => {
        visit(tree, (node) => {
            if (node.type === 'containerDirective') {
                const type = normalizeType(node.name || 'note');
                const data = node.data ?? {};
                node.data = data;
                const attributes = node.attributes || {};
                const hasExplicitTitle = Object.prototype.hasOwnProperty.call(attributes, 'title');
                const titleSource = hasExplicitTitle
                    ? attributes.title
                    : (typeof node.label === 'string' ? node.label : undefined);

                const title = typeof titleSource === 'string'
                    ? titleSource.trim()
                    : getDefaultTitle(type);

                const properties = {
                    class: `admonition admonition-${type}`,
                    role: ALERT_TYPES.has(type) ? 'alert' : 'note',
                    'data-admonition': type
                };

                if (title) {
                    properties['data-title'] = title;
                }

                data.hName = 'div';
                data.hProperties = h('div', properties).properties;
            }
        });
    };
}
