import * as vscode from 'vscode';

export async function getValidVars(
    document: vscode.TextDocument,
    pos: vscode.Position,
) {
    const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
        'vscode.executeDocumentSymbolProvider',
        document.uri
    );

    if (!symbols) {return [];}

    let validVars: vscode.DocumentSymbol[] = [];

    for (const symb of symbols) {
        if (symb.range.contains(pos)) {
            if (symb.kind === vscode.SymbolKind.Variable || symb.kind === vscode.SymbolKind.Constant) {
                validVars.push(symb);
            }
        }
    }
    return validVars;
}

export async function getVarValue(
    document: vscode.TextDocument,
    variable: vscode.DocumentSymbol
) {
    const pos = new vscode.Position(variable.range.start.line, document.lineAt(variable.range.start.line).text.indexOf(variable.name));
    const definitions = await vscode.commands.executeCommand<vscode.Location[]>(
        'vscode.executeDefinitionProvider',
        document.uri,
        pos
    );
    if (definitions && definitions.length > 0) {
        const def = definitions[0];
        const document = await vscode.workspace.openTextDocument(def.uri);
        const rawText = document.getText(def.range);

        // single lineifier
        const normDef = rawText
            .replace(/[\r\n]+/g, ' ') 
            .replace(/\s\s+/g, ' ')   
            .trim();

        return normDef
    }
    return undefined
}

export async function getVarType(
    document: vscode.TextDocument,
    variable: vscode.DocumentSymbol
) {    
    const line = document.lineAt(variable.range.start.line).text.trim();

    //separate constructors and typings
    const suffix = line.substring(line.indexOf(variable.name)+variable.name.length).trim().toLowerCase();
    if (suffix.indexOf(':') < 2) {
        //type
        const validTypes: string[] = [
        'color', 'colorrange', 'event', 'netmessage', 'numberrange',
        'number', 'rayresult', 'vector2', 'vector3', 'signal'
        ];
        for (const type of validTypes) {
            if (suffix.indexOf(type) < 5) {
                return type;
            }
        }
    }
    if (suffix.indexOf('=') < 2) {
        //constructor
        const validConstructors: string[] = [
            'color', 'colorrange', 'netmessage', 'numberrange',
            'vector2', 'vector3'
        ];
        for (const constructor of validConstructors) {
            if (suffix.indexOf(constructor) < 5) {
                return constructor;
            }
        }

        const numbers: string[] = [
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
        ]
        for (const num of numbers) {
            if (suffix.indexOf(num) < 5) {
                return 'number';
            }
        }
    }
    return undefined
}