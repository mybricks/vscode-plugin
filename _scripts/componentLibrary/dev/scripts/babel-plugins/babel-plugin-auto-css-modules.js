// 引用自 https://juejin.cn/post/6844904083321520142

const { extname } = require('path');

const CSS_EXT_NAMES = ['.css', '.less', '.sass', '.scss', '.stylus', '.styl'];

module.exports = (babel) => {
	const t = babel.types;
	return {
		visitor: {
			ImportDeclaration(path) {
				const { specifiers, source, source: { value } } = path.node;
				if (specifiers.length && CSS_EXT_NAMES.includes(extname(value))) {
					source.value = `${value}?modules}`;
				}
			},
			// e.g.
			// const styles = await import('./index.less');
			VariableDeclarator(
				path,
				{ opts },
			) {
				const { node } = path;
				if (
					t.isAwaitExpression(node.init) &&
          t.isCallExpression(node.init.argument) &&
          t.isImport(node.init.argument.callee) &&
          node.init.argument.arguments.length === 1 &&
          t.isStringLiteral(node.init.argument.arguments[0]) &&
          CSS_EXT_NAMES.includes(extname(node.init.argument.arguments[0].value))
				) {
					node.init.argument.arguments[0].value = `${
						node.init.argument.arguments[0].value
					}?modules`;
				}
			}
		}
	};
};