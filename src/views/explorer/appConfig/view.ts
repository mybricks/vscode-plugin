import * as vscode from 'vscode';

export class View {
	constructor(context: vscode.ExtensionContext, tree) {
		const view = vscode.window.createTreeView('mybricks_appConfigPanel', { treeDataProvider: aNodeWithIdTreeDataProvider(tree) });
		context.subscriptions.push(view);

		context.subscriptions.push(
			vscode.commands.registerCommand('mybricks_appConfigPanel.openFile', async (resourceUri: vscode.Uri) => {
				await vscode.window.showTextDocument(resourceUri);
			})
	);
	}
}

function aNodeWithIdTreeDataProvider(tree): vscode.TreeDataProvider<{ key: string }> {
	return {
		getChildren: (): { key: string }[] => {
			return Object.keys(tree).map((key) => new Key(key));
		},
		getTreeItem(element: { key: string }): vscode.TreeItem {
			const { key } = element;

			const treeItem = new vscode.TreeItem(
				key
			);

			treeItem.id = key;
			treeItem.label = key;
			treeItem.resourceUri = tree[key].path;
			treeItem.iconPath = vscode.ThemeIcon.File;
			treeItem.command = {
					command: 'mybricks_appConfigPanel.openFile',
					title: '打开文件',
					arguments: [tree[key].path]
			};

			return treeItem;
		},
	};
}

class Key {
	constructor(readonly key: string) { }
}