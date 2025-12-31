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

const ALERT_TYPES = new Set(['warning', 'danger', 'error']);

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
                const type = node.name || 'note';
                const data = node.data || (node.data = {});
                const attributes = node.attributes || {};
                const title = attributes.title || getDefaultTitle(type);

                data.hName = 'div';
                data.hProperties = h('div', {
                    class: `admonition admonition-${type}`,
                    'data-title': title,
                    role: ALERT_TYPES.has(type) ? 'alert' : 'note'
                }).properties;
            }
        });
    };
}