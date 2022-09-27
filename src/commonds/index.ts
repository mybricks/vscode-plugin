import { registerCommand } from "../utils";
import { COMMANDS } from "../constants";

import startDebug from './start_debug';
import stopDebug from './stop_debug';

export default [
  registerCommand(COMMANDS.START_DEBUG, startDebug),
  registerCommand(COMMANDS.STOP_DEBUG, stopDebug),
];