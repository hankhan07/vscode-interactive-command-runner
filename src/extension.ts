import * as vscode from 'vscode';
import * as cp from 'child_process';
import path = require('path');
import * as fs from 'fs';

const rootPath = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : null;
class CategoryTreeItem extends vscode.TreeItem {
    children?: vscode.TreeItem[];
}
class GitCommandProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: CategoryTreeItem): Promise<vscode.TreeItem[]> {
        if (!element) {
            const configPath = path.join(rootPath || '', '.vscode', 'interactiveCommands.json');
            if (!fs.existsSync(configPath)) {
                const defaultConfig = [
                    {
                        category: 'Run',
                        label: 'Run API',
                        command: '/app/sh/api_debug.sh',
                    },
                    {
                        category: 'Run',
                        label: 'Run UI',
                        command: '/app/sh/start/ui_debug.sh',
                    },
                    {
                        category: 'DOTNET',
                        label: 'Add Nuget Package',
                        command: 'cd {targetPath} && dotnet add package {packageName}',
                        args: [
                            {
                                name: 'targetPath',
                                type: 'multipleSelector',
                                sourceCommand: 'find . -name "*.csproj" -exec dirname {} \\; | uniq',
                                placeHolder: 'Select Target To Install Package:',
                            },
                            {
                                name: 'packageName',
                                type: 'textInput',
                                placeHolder: 'Package to Add:',
                            },
                        ],
                    },
                    {
                        category: 'GIT',
                        label: 'Merge From',
                        command: 'git merge --no-ff {targetBranch}',
                        args: [
                            {
                                name: 'targetBranch',
                                type: 'multipleSelector',
                                sourceCommand: 'git fetch && git branch -r',
                                placeHolder: 'Select Branch To Merge From:',
                            },
                        ],
                    },
                ];
                fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 4));
            }

            const configContent = fs.readFileSync(configPath, 'utf-8');
            const configs: GitBatcherConfig[] = JSON.parse(configContent);

            const categories: { [key: string]: vscode.TreeItem[] } = {};
            for (const config of configs) {
                const categoryKey = config.category ?? 'DEFAULT';
                if (!categories[categoryKey]) {
                    categories[categoryKey] = [];
                }

                const commandTag = 'gitbatcher.executeCommand.' + config.label.replace(/\s+/g, '_');
                const row = new vscode.TreeItem(config.label, vscode.TreeItemCollapsibleState.None);
                row.command = {
                    command: commandTag,
                    title: config.label,
                    arguments: [{ label: commandTag, data: config }],
                };
                categories[categoryKey].push(row);
                this.context.subscriptions.push(
                    vscode.commands.registerCommand(commandTag, async (selectedCommand: GitBatcherConfig) => {
                        await executeCommandFromConfig(selectedCommand);
                    })
                );
            }

            return Object.keys(categories).map((categoryName) => {
                const categoryItem = new CategoryTreeItem(categoryName, vscode.TreeItemCollapsibleState.Collapsed);
                categoryItem.children = categories[categoryName];

                categoryItem.children = categories[categoryName];
                return categoryItem;
            });
        } else if (element.children) {
            return Promise.resolve(element.children);
        }
        return Promise.resolve([]);
    }
}

class GitBatcherConfig extends vscode.TreeItem {
    label!: string;
    category!: string;
    args!: { [key: string]: ArgumentDetails };
    children?: vscode.TreeItem[];
}

class ArgumentDetails {
    type!: ArgumentType;
    prompt?: string;
}

enum ArgumentType {
    branchSelector = 'branchSelector',
    yesNoDialog = 'yesNoDialog',
    textInput = 'textInput',
}

export function activate(context: vscode.ExtensionContext) {
    const treeDataProvider = new GitCommandProvider(context);
    vscode.window.registerTreeDataProvider('gitCustomCommands', treeDataProvider);
}

async function executeCommandFromConfig(data: any) {
    const config = data.data;
    let command = config.command;
    if (config.args) {
        for (const arg of config.args) {
            let value = '';

            switch (arg.type) {
                case 'multipleSelector':
                    const options = await executeSourceCommand(arg.sourceCommand);
                    if (options.length > 0) {
                        const selectedOption = await showMultipleSelect(options, arg.placeHolder);
                        if (selectedOption) {
                            value = selectedOption;
                        } else {
                            throw new Error(`Argument: ${arg.name} not selected`);
                        }
                    } else {
                        throw new Error(`Source is empty for Argument: ${arg.name}`);
                    }
                    break;
                case 'textInput':
                    value = await textInput(arg.placeHolder || 'Please enter text:');
                    break;
                default:
                    throw new Error(`Unknown argument type: ${arg.type}`);
            }
            if (value && value.toString().trim() === '') {
                throw new Error(`Error: ${arg.name} Not Provided!`);
            }
            command = command.replace(`{${arg.name}}`, value.toString());
        }
    }

    console.log(`Executing: ${command}`);
    const terminal = vscode.window.createTerminal(config.label);
    terminal.show();
    terminal.sendText(command);
}

function branchSelector(placeHolder: string, mode = '-r'): Promise<string> {
    return new Promise((resolve, reject) => {
        if (rootPath) {
            cp.exec('git branch ' + mode, { cwd: rootPath }, (err, stdout, stderr) => {
                if (err) {
                    vscode.window.showErrorMessage(`Failed to retrieve branches. Error: ${stderr}`);
                    reject(stderr);
                    return;
                }

                const branches = stdout
                    .split('\n')
                    .filter((b) => b)
                    .map((b) => b.trim());

                vscode.window
                    .showQuickPick(branches, {
                        placeHolder: placeHolder,
                    })
                    .then((selected) => {
                        if (selected) {
                            resolve(selected);
                        } else {
                            reject('No branch selected');
                        }
                    });
            });
        } else {
            vscode.window.showErrorMessage('No workspace detected.');
        }
    });
}
async function executeSourceCommand(command: string): Promise<Array<string>> {
    return new Promise((resolve, reject) => {
        if (rootPath) {
            cp.exec(command, { cwd: rootPath }, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }

                const options = stdout.split('\n').filter((option) => option.trim() !== '');
                resolve(options);
            });
        } else {
            vscode.window.showErrorMessage('No workspace detected.');
        }
    });
}

async function showMultipleSelect(items: Array<string>, placeholder: string) {
    return await vscode.window.showQuickPick(items, {
        canPickMany: false,
        placeHolder: placeholder,
    });
}

async function textInput(prompt: string): Promise<string> {
    return (await vscode.window.showInputBox({ prompt: prompt })) ?? '';
}
