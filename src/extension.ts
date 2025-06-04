import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
    console.log("[env-example-generator] activated");

    const disposable = vscode.commands.registerCommand(
        "env-example-generator.generateEnvExample",
        () => {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) return;

            const rootPath = workspaceFolders[0].uri.fsPath;
            const inputFiles = [".env", ".env.local"];
            const seenKeys = new Set<string>();
            const outputLines: string[] = [];

            inputFiles.forEach((filename) => {
                const inputPath = path.join(rootPath, filename);
                if (!fs.existsSync(inputPath)) return;

                const lines = fs.readFileSync(inputPath, "utf-8").split("\n");
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed === "") continue;
                    if (trimmed.startsWith("#")) continue;

                    const equalIndex = line.indexOf("=");
                    if (equalIndex <= 0) continue;

                    const key = line.substring(0, equalIndex).trim();
                    if (key === "") continue;

                    if (!seenKeys.has(key)) {
                        seenKeys.add(key);
                        outputLines.push(`${key}=`);
                    }
                }
            });

            const outputPath = path.join(rootPath, ".env.example");
            fs.writeFileSync(outputPath, outputLines.join("\n"), "utf-8");

            vscode.window.showInformationMessage(
                ".env.example generated from .env & .env.local!"
            );
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}
