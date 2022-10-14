// import * as vscode from "vscode";
// import Provider from "./provider";

// class Welcome {
//   context: vscode.ExtensionContext | undefined;

//   constructor () {}

//   init (context: vscode.ExtensionContext) {
//     this.context = context;

//     const { subscriptions } = context;
//     const welcomePanel = new Provider(context.extensionUri);

//     subscriptions.push(
//       vscode.window.registerWebviewViewProvider("mybricks_welcome", welcomePanel, {
//         webviewOptions: {
//           retainContextWhenHidden: true
//         }
//       })
//     );
//   }
// }

// export const welcomeMybricks = new Welcome();

import * as vscode from "vscode";

import Provider from "./provider";

class Welcome {
  private _context: vscode.ExtensionContext | undefined;

  constructor () {}

  init (context: vscode.ExtensionContext) {
    this._context = context;

    const { subscriptions } = context;
    const welcomePanel = new Provider(context);

    subscriptions.push(
      vscode.window.registerWebviewViewProvider("mybricks_welcome", welcomePanel, {
        webviewOptions: {
          retainContextWhenHidden: true
        }
      })
    );
  }
}

export const welcomeMybricks = new Welcome();
