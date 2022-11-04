import * as vscode from "vscode";
import EditorType, { LANGUAGES } from "./editor-type";
import { MybricksSuggestion, RuntimeSuggestion, EditorSuggestion } from './suggestion'

const triggers = ["'"];

let provideCompletionItemsHolder: any;

const isEditorFile = (path: string) => {
	return path.includes('editor')
}

const isMybricksJson = (path: string) => {
	const filename = path.split('/').pop()
	return filename === 'mybricks.json'
}

const isRuntime = (path: string) => {
	return path.includes('runtime')
}

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
				if (isRuntime(document.fileName)) {
					return RuntimeSuggestion
				}
				if (isMybricksJson(document.fileName)) {
					return MybricksSuggestion
				}

				if (isEditorFile(document.fileName)) {
					return EditorSuggestion
				}


				// if (text.trim().startsWith("type")) {
				// 	return EditorType.map((item, idx) => ({
				// 		label: `type: '${item}',`,
				// 	}));
				// }

				return EditorType.filter((item) => item.startsWith(text.trim())).map(
					(item) => ({ label: `${item}`, insertText: item })
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
