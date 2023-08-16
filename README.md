# Interactive Command Batcher

I created this extension to wrap some commands with interactive inputs of vscode in an area to make use of my development env more GUI style and faster.

The example config file below should explain you how it works. Just update it for your needs. Requires restart after changes

## Features

[
    {
        "category": "Run",
        "label": "Run API",
        "command": "/app/sh/api_debug.sh"
    },
    {
        "category": "Run",
        "label": "Run UI",
        "command": "/app/sh/start/ui_debug.sh"
    },
    {
        "category": "DOTNET",
        "label": "Add Nuget Package",
        "command": "cd {targetPath} && dotnet add package {packageName}",
        "args": [
            {
                "name": "targetPath",
                "type": "multipleSelector",
                "sourceCommand": "find . -name \"*.csproj\" -exec dirname {} \\; | uniq",
                "placeHolder": "Select Branch To Merge From:"
            },
            {
                "name": "packageName",
                "type": "textInput",
                "placeHolder": "Package to Add:"
            }
        ]
    },    
    {
        "category": "GIT",
        "label": "Merge From",
        "command": "git fetch && git merge --no-ff {targetBranch}",
        "args": [
            {
                "name": "targetBranch",
                "type": "multipleSelector",
                "sourceCommand": "git fetch && git branch -r",
                "placeHolder": "Select Branch To Merge From:"
            }
        ]
    }
]

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
