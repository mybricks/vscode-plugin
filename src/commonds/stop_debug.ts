import * as vscode from "vscode";
import { updateStatusBar } from "../statusBar";
import { WORKSPACE_STATUS } from "../constants";
import webpack = require("webpack");

export default function () {
  vscode.window.showInformationMessage("stop!");

  ////////

  // await webpack();

  let url = "mybricks://app=pc-ms&debug=1&comlib-url=http://172.26.208.65:9999/bundle.js";
  vscode.env.openExternal( vscode.Uri.parse(url) );

  
  // vscode.Uri.call(url);

  // let row = [WORKSPACE_STATUS.DEV, WORKSPACE_STATUS.COMPILE, WORKSPACE_STATUS.ERROR, WORKSPACE_STATUS.DEBUG];
  // row = row.sort((a, b) => {
  //   return Math.random() - 0.5;
  // });

  // updateStatusBar(row[0]);

}