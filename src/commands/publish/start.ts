import * as vscode from "vscode";
import { window, Disposable, QuickInput, QuickPickItem, QuickInputButton, QuickInputButtons } from "vscode";
import { readJsonSync } from 'fs-extra';
import * as path from "path";

import { getWorkspaceFsPath, checkIsMybricksProject } from "../../utils";

export default async function start () {
  return await start2();
}

async function start2() {

  // 可选的配置文件
  const mybricksJsonFiles = checkIsMybricksProject();
  const docPath = getWorkspaceFsPath();

  if (!docPath || !mybricksJsonFiles) {
    vscode.window.showInformationMessage(!docPath ? "未打开工程目录" : "缺失*mybricks.json配置文件");
    return false;
  }

  interface MyQuickPickItem extends QuickPickItem {
    value: string;
  }

  interface State {
		title: string;
		step: number;
		totalSteps: number;
		// resourceGroup: QuickPickItem | string;
    mybricksJsonFile: MyQuickPickItem; // 配置文件
    materialType: MyQuickPickItem; // 发布类型 单组件、组件库
    publishType: MyQuickPickItem; // 发布至本地、物料中心
    
		name: string;
		runtime: QuickPickItem;
	}

  async function collectInputs() {
		const state = {} as Partial<State>;
		await MultiStepInput.run(input => pickMybricksJsonFile(input, state));
		return state as State;
	}

  const title = '物料发布';

  const mybricksJsonFileItems: MyQuickPickItem[] = mybricksJsonFiles
		.map(label => ({ label, value: label }));

  async function pickMybricksJsonFile(input: MultiStepInput, state: Partial<State>) {
		const pick = await input.showQuickPick<MyQuickPickItem, QuickPickParameters<MyQuickPickItem>>({
			title,
			step: 1,
			totalSteps: 2,
			placeholder: '请选择配置文件',
			items: mybricksJsonFileItems,
			activeItem: typeof state.mybricksJsonFile !== 'string' ? state.mybricksJsonFile : undefined,
			// buttons: [createResourceGroupButton],
			shouldResume: shouldResume
		});
    // 点击按钮
		// if (pick instanceof MyButton) {
		// 	return (input: MultiStepInput) => inputResourceGroupName(input, state);
		// }
		state.mybricksJsonFile = pick;
		return (input: MultiStepInput) => pickPublishType(input, state);
	}

  const materialTypeItems = [{ label: '组件库', value: 'com_lib' }, { label: '单组件', value: 'component' }];

  async function pickMaterialType(input: MultiStepInput, state: Partial<State>) {
    state.materialType = await input.showQuickPick<MyQuickPickItem, QuickPickParameters<MyQuickPickItem>>({
			title,
			step: 2,
			totalSteps: 3,
			placeholder: '请选择发布类型',
			items: materialTypeItems,
      activeItem: typeof state.materialType !== 'string' ? state.materialType : undefined,
			shouldResume: shouldResume
		});

    return (input: MultiStepInput) => pickPublishType(input, state);
  }

  const publishTypeitems = [
    {label: "组件库产物保存至本地dist文件夹内", value: "dist"},
    {label: "发布至物料中心，需在配置文件内正确配置平台地址（domain）", value: "material"},
    {label: "发布至npm（使用当前本地npm账号发布）", value: "npm"}
  ];

  if ((vscode.workspace.getConfiguration("mybricks").get("components.publishConfig") as any).toCentral === "08edac515e841c3222ba352fe8e32403b258316b0c10ae6e45f754d5bb5b5034") {
    publishTypeitems.push({label: "发布至中心化服务（内部使用，非必要不外传）", value: "central"});
  }
  
  async function pickPublishType(input: MultiStepInput, state: Partial<State>) {
    const libCfg = readJsonSync(path.join(docPath, state.mybricksJsonFile.value));
    state.publishType = await input.showQuickPick<MyQuickPickItem, QuickPickParameters<MyQuickPickItem>>({ // TODO:类型是否合适
			title,
			step: 2,
			totalSteps: 2,
			placeholder: '请选择发布方式',
			items: libCfg?.componentType === 'MP' ? publishTypeitems.slice(0, 2) : publishTypeitems,
			// activeItem: state.publishType.value,
			shouldResume: shouldResume
		});
  }

  function shouldResume() {
		// Could show a notification with the option to resume.
		return new Promise<boolean>((resolve, reject) => {
			// noop
		});
	}

  const state = await collectInputs();

  return {
    docPath,
    publishType: state.publishType.value,
    configName: state.mybricksJsonFile.value,
    // materialType: state.materialType.value
    materialType: 'com_lib'
  };
	// window.showInformationMessage(`Creating Application Service '${state.name}'`);
}

class InputFlowAction {
	static back = new InputFlowAction();
	static cancel = new InputFlowAction();
	static resume = new InputFlowAction();
}

type InputStep = (input: MultiStepInput) => Thenable<InputStep | void>;

interface QuickPickParameters<T extends QuickPickItem> {
	title: string;
	step: number;
	totalSteps: number;
	items: T[];
	activeItem?: T;
	ignoreFocusOut?: boolean;
	placeholder: string;
	buttons?: QuickInputButton[];
	shouldResume: () => Thenable<boolean>;
}

class MultiStepInput {

  static async run<T>(start: InputStep) {
    const input = new MultiStepInput();
		return input.stepThrough(start);
  }

  private current?: QuickInput;
	private steps: InputStep[] = [];

  private async stepThrough<T>(start: InputStep) {
    let step: InputStep | void = start;
    while (step) {
      this.steps.push(step);
      if (this.current) {
        this.current.enabled = false;
        this.current.busy = true;
      }
      try {
        step = await step(this);
      } catch (err) {
        if (err === InputFlowAction.back) {
          this.steps.pop();
          step = this.steps.pop();
        } else if (err === InputFlowAction.resume) {
					step = this.steps.pop();
				} else if (err === InputFlowAction.cancel) {
					step = undefined;
				} else {
					throw err;
				}
      }
    }
    if (this.current) {
      this.current.dispose();
    }
  }

	async showQuickPick<T extends QuickPickItem, P extends QuickPickParameters<T>>({ title, step, totalSteps, items, activeItem, ignoreFocusOut, placeholder, buttons, shouldResume }: P) {
		const disposables: Disposable[] = [];
		try {
			return await new Promise<T | (P extends { buttons: (infer I)[] } ? I : never)>((resolve, reject) => {
        const input = window.createQuickPick<T>();
        input.title = title;
        input.step = step;
        input.totalSteps = totalSteps;
        input.ignoreFocusOut = ignoreFocusOut || false;
        input.placeholder = placeholder;
        input.items = items;
        if (activeItem) {
          input.activeItems = [activeItem];
        }
        input.buttons = [
          ...(this.steps.length > 1 ? [QuickInputButtons.Back] : [])
        ];
        disposables.push(
          input.onDidTriggerButton(item => {
            if (item === QuickInputButtons.Back) {
              reject(InputFlowAction.back);
            } else {
              resolve(<any>item);
            }
          }),
          input.onDidChangeSelection(items => resolve(items[0])),
          input.onDidHide(() => {
            (async () => {
              reject(shouldResume && await shouldResume() ? InputFlowAction.resume : InputFlowAction.cancel);
            })()
              .catch(reject);
          })
        );
        if (this.current) {
          this.current.dispose();
        }
        this.current = input;
        this.current.show();
      });
    } finally {
      disposables.forEach(d => d.dispose());
    }
  }
}
