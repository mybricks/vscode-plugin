import * as vscode from "vscode";
import EditorType, { LANGUAGES } from "./editor-type";

const triggers = ["'"];

let provideCompletionItemsHolder: any;

export const completionProvider = () => {
	provideCompletionItemsHolder = vscode.languages.registerCompletionItemProvider(
		LANGUAGES,
		{
			provideCompletionItems(
				document: vscode.TextDocument,
				position: vscode.Position,
				token: vscode.CancellationToken,
				context: vscode.CompletionContext
			) {
				const range = new vscode.Range(
					new vscode.Position(position.line, 0),
					position
				);
				const text = document.getText(range);

				if (text.trim().startsWith("t")) {
					return EditorType.map((item, idx) => ({
						label: `type: '${item}',`,
					}));
				}

				return EditorType.filter((item) => item.startsWith(text.trim())).map(
					(item) => ({ label: `${item}` })
				);
			},
		},
		...triggers
	);
	return provideCompletionItemsHolder;
};

export const dispose = () => {
	provideCompletionItemsHolder?.dispose();
};
