import * as vscode from "vscode";

import * as path from 'path'
import * as fse from 'fs-extra';

import { WelcomePanelProvider } from "./panels/welcome";
import { DebuggerPanelProvider } from "./panels/debugger";


export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "mybricks" is now active!');

  let disposable = vscode.commands.registerCommand(
    "mybricks.helloWorld",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage("Hello World from Mybricks!");
    }
  );

  context.subscriptions.push(disposable);

  const welcomePanel = new WelcomePanelProvider(context.extensionUri);
  const debuggerPanel = new DebuggerPanelProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("mybricks_welcome", welcomePanel)
  );

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "mybricks_debugger",
      debuggerPanel
    )
  );


  const wsFolders = vscode.workspace.workspaceFolders;

  if(wsFolders){
	const wsPath = wsFolders[0].uri.path ;
	const wsFsPath = wsFolders[0].uri.fsPath ; 
	const mybricksFilePath = path.join(wsFsPath,'/mybricks.json')
	if(fse.existsSync(mybricksFilePath)){
	  vscode.commands.executeCommand('setContext', 'mybricks.showDebugger', true);
	}
  }

}

// this method is called when your extension is deactivated
export function deactivate() {}
