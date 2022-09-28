import { registerCommand } from "../utils";
import { COMMANDS } from "../constants";

import start from './start';
import stop from './stop';

export default [
  registerCommand(COMMANDS.START, start),
  registerCommand(COMMANDS.STOP, stop),
];