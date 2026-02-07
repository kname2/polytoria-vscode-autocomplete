import * as vscode from 'vscode';

export async function getValidVars(
    document: vscode.TextDocument,
    pos: vscode.Position,
) {
    const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
        'vscode.executeDocumentSymbolProvider',
        document.uri
    )

    if (!symbols) return [];

    let validVars: vscode.DocumentSymbol[] = []

    for (const symb of symbols) {
        if (symb.range.contains(pos)) {
            if (symb.kind === vscode.SymbolKind.Variable || symb.kind === vscode.SymbolKind.Constant) {
                validVars.push(symb)
            }
        }
    }
    return validVars;
}

export async function getVarValue(
    document: vscode.TextDocument,
    variable: vscode.DocumentSymbol
) {
    
}

export async function getVarType(
    document: vscode.TextDocument,
    variable: vscode.DocumentSymbol
) {    
    const line = document.lineAt(variable.range.start.line).text.trim()

    //separate constructors and typings
    const suffix = line.substring(line.indexOf(variable.name)+variable.name.length).trim().toLowerCase()
    if (suffix.indexOf(':') < 2) {
        //type
        const validTypes: string[] = [
        'color', 'colorrange', 'event', 'netmessage', 'numberrange',
        'number', 'rayresult', 'vector2', 'vector3', 'signal'
        ] 
        for (const type of validTypes) {
            if (suffix.indexOf(type) < 5) {
                return type
            }
        }
    }
    if (suffix.indexOf('=') < 2) {
        //constructor
        const validConstructors: string[] = [
            'color', 'colorrange', 'netmessage', 'numberrange',
            'vector2', 'vector3'
        ]
        for (const constructor of validConstructors) {
            if (suffix.indexOf(constructor) < 5) {
                return constructor
            }
        }
    }
}