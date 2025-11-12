import { visit } from 'unist-util-visit';
import { h } from 'hastscript';

/**
 * Custom directive handler using remark-directive infrastructure
 * This plugin converts container directives into styled admonition divs
 */
export function remarkCustomDirectives() {
    return (tree) => {
        visit(tree, (node) => {
            if (node.type === 'containerDirective') {
                const type = node.name || 'note';
                const data = node.data || (node.data = {});
                const attributes = node.attributes || {};
                const title = attributes.title || getDefaultTitle(type);

                // Ensure both base and type-specific classes are included
                const className = `admonition admonition-${type}`;

                data.hName = 'div';
                data.hProperties = h('div', {
                    class: className,
                    'data-title': title
                }).properties;

                // Debug logging (can be removed in production)
                if (process.env.NODE_ENV === 'development') {
                    console.log(`Admonition created: ${className} with title: ${title}`);
                }
            }
        });
    };
}

/**
 * Get default title for directive type
 */
function getDefaultTitle(type) {
    const defaultTitles = {
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
    return defaultTitles[type] || type.charAt(0).toUpperCase() + type.slice(1);
}