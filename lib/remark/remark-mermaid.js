import { visit } from 'unist-util-visit';

export function remarkMermaid() {
	return (tree) => {
		visit(tree, 'code', (node) => {
			if (node.lang !== 'mermaid') return;
			if (!node.data) node.data = {};
			const data = node.data;
			data.hName = 'pre';
			data.hProperties = { class: 'mermaid' };
		});
	};
}
