// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getValidVars, getVarType, getVarValue } from './variableFuncs'
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const activators: string[] = [];
	let provider = vscode.languages.registerCompletionItemProvider('lua', {
		provideCompletionItems(document, position, token, context) {
			let completionItems = undefined;
			let prefix = document.lineAt(position).text.substring(0,position.character);

			// VARIABLE RECOGNITION
			const validVars: vscode.DocumentSymbol[] = getValidVars(document, position);

			let matchedVar = undefined
			let varType = undefined
			for (const variable of validVars) {
				if (prefix.endsWith(variable.name+'.') || prefix.endsWith(variable.name+':') || prefix.endsWith(variable.name+'[')) {
					if (prefix.indexOf('local '+variable.name) == -1) {
						matchedVar = variable
						const varValue: string = getVarValue(document,variable)
						let endPos = prefix.indexOf(' '+variable.name)
						if (endPos === -1) {
							endPos = prefix.indexOf('\t'+variable.name)
						}
						prefix = prefix.substring(0, endPos)+varValue
						varType = getVarType(document, variable)
					}
				}
			}
			// variables refered to inside variables are not translated.    todo: program large limited depth
			

			// MAIN CLASSES, STATIC CLASSES, AND CONSTRUCTORS
			const polyStaticsAndClasses: string[] = [
				"Achievements", "Chat", "CoreUI", "Datastore", "game",
				"Http", "Input", "Insert", "Json", "Tween"
			];
			const polyConstructors: string[] = [
				"Color", "ColorRange", "NetMessage", "NumberRange",
				"Vector2", "Vector3"
			];

			if (prefix.trim().length === 1) {
				let alliterativeList: string[] = [];
				for (const pClass of polyStaticsAndClasses) {
					if (prefix.trim().toLowerCase === pClass.substring(0,0).toLowerCase) {
						alliterativeList.push(pClass);
					}
				}
				if (alliterativeList.length !== 0) {
					completionItems = [];

					for (const pClass of alliterativeList) {
						const startPosition = new vscode.Position(position.line, position.character - 1);
						const repRange = new vscode.Range(startPosition, position);

						let item = new vscode.CompletionItem(pClass, vscode.CompletionItemKind.Class);
						item.range = repRange;

						completionItems.push(item);
					}

				}
				
				return completionItems;
				
			}

			// PROPERTIES
			if (prefix.endsWith('game.') || prefix.endsWith('game[')) {
				const startPosition = new vscode.Position(position.line, position.character - 1);
				const repRange = new vscode.Range(startPosition, position);

				const completionClasses: string[] = [
					"", "Enviroment", "Lighting", "Players", "ScriptService",
					"Hidden", "ServerHidden", "PlayerDefaults","PlayerGui"
				];
				const completionProperties: string[] = [
					"GameId", "Rendered", "InstanceCount", "LocalInstanceCount", "PlayersConnected"
				];

				completionItems = [];
				
				for (const compTxt of completionClasses) {
					let item = new vscode.CompletionItem(compTxt, vscode.CompletionItemKind.Class);
					item.insertText = '["'+compTxt+'"]';
					if (compTxt === "") {
						item = new vscode.CompletionItem('[""]', vscode.CompletionItemKind.Class);
						item.insertText = new vscode.SnippetString('["${1}"]');
					};
					item.range = repRange;
					
					completionItems.push(item);
				};

				for (const compTxt of completionProperties) {
					let item = new vscode.CompletionItem(compTxt, vscode.CompletionItemKind.Property);

					completionItems.push(item);
				}

				return completionItems;
			};
			if (prefix.endsWith('["Eviroment"].') || prefix.endsWith('["Eviroment"][')) {
				
			}

			// EVENTS
			const polyEvents: string[] = [
				'Loaded', "... todo"
			];
			for (const pEvent of polyEvents) {
				if (prefix.endsWith('.'+pEvent+'.') || prefix.endsWith('.'+pEvent+':')) {
					const startPosition = new vscode.Position(position.line, position.character - 1);
					const repRange = new vscode.Range(startPosition, position);

					let connectItem = new vscode.CompletionItem(':Connect()', vscode.CompletionItemKind.Function);
					connectItem.insertText = new vscode.SnippetString(':Connect(${1})');
					connectItem.range = repRange;

					let disconnectItem = new vscode.CompletionItem(':Disconnect()', vscode.CompletionItemKind.Function);
					disconnectItem.insertText = new vscode.SnippetString(':Disconnect(${1})');
					disconnectItem.range = repRange;
				};
			};

			// UNVIERSAL OCCUROANCES
				
			const polyMethods: string[] = [
				"Play", "Pause", "... todo"
			];

			if (prefix.endsWith('.')) {
				for (const pEvent of polyEvents) {
				
				};
			};
			
			return completionItems;
		},
	}, '.', '[', ':', 'c','C', 'g', 'G', 'n', 'N', );

	context.subscriptions.push(provider);
}

// This method is called when your extension is deactivated
export function deactivate() {}