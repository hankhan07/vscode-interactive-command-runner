# Interactive Command Batcher

I created this extension to wrap some commands with interactive inputs of vscode in an area to make use of my development env more GUI style and faster.

The example config file below should explain you how it works. Just update it for your needs. Requires restart after changes

## Features
Example config:
```yaml
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
        "command": "&& git merge --no-ff {targetBranch}",
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
```

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

Only possible input types for now 

`multipleSelector,textInput`

For example:

This extension contributes the following settings:

## Known Issues

Config file change requires restart.

## Release Notes
### 0.0.3
Readme file written
### 0.0.4
Readme fixes

---

## Following extension guidelines

<!-- * [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines) -->

## For more information

 If you want to contribute:(GitHub)[https://github.com/hankhan07/vscode-interactive-command-runner]

<!-- * [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown) -->
<!-- * [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/) -->

**Enjoy!**
