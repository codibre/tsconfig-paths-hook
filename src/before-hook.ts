/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as os from 'os';
import { dirname, posix } from 'path';
import * as ts from 'typescript';
import { TypeScriptBinaryLoader } from './typescript-loader';
import { createMatchPath, MatchPath } from 'tsconfig-paths';
import { tsConfig } from './ts-loader';

function getNotAliasedPath(
	sf: ts.SourceFile,
	matcher: MatchPath,
	text: string,
): string | undefined {
	let result = matcher(text, undefined, undefined, [
		'.ts',
		'.tsx',
		'.js',
		'.jsx',
	]);
	if (!result) {
		return;
	}
	if (os.platform() === 'win32') {
		result = result.replace(/\\/g, '/');
	}
	try {
		// Installed packages (node modules) should take precedence over root files with the same name.
		// Ref: https://github.com/nestjs/nest-cli/issues/838
		const packagePath = require.resolve(text);
		if (packagePath) {
			return text;
		}
	} catch {
		// ignore
	}

	const resolvedPath = posix.relative(dirname(sf.fileName), result) || './';
	return resolvedPath.startsWith('.') ? resolvedPath : './' + resolvedPath;
}

export function tsconfigPathsBeforeHookFactory() {
	const tsBinary = new TypeScriptBinaryLoader().load();
	const { paths = {}, baseUrl = './' } = tsConfig.options;
	const matcher = createMatchPath(baseUrl, paths, ['main']);

	return (ctx: ts.TransformationContext) => {
		return (sf: ts.SourceFile) => {
			const visitNode = (node: ts.Node): ts.Node => {
				if (
					tsBinary.isImportDeclaration(node) ||
					(tsBinary.isExportDeclaration(node) && node.moduleSpecifier)
				) {
					try {
						const importPathWithQuotes = node.moduleSpecifier?.getText();

						if (!importPathWithQuotes) {
							return node;
						}
						const text = importPathWithQuotes.substring(
							1,
							importPathWithQuotes.length - 1,
						);
						const result = getNotAliasedPath(sf, matcher, text);
						if (!result) {
							return node;
						}
						const moduleSpecifier =
							tsBinary.factory.createStringLiteral(result);
						(moduleSpecifier as any).parent = (
							node as any
						).moduleSpecifier.parent;

						if (tsBinary.isImportDeclaration(node)) {
							const updatedNode = tsBinary.factory.updateImportDeclaration(
								node,
								node.modifiers,
								node.importClause,
								moduleSpecifier,
								node.assertClause,
							);
							(updatedNode as any).flags = node.flags;
							return updatedNode;
						} else {
							const updatedNode = tsBinary.factory.updateExportDeclaration(
								node,
								node.modifiers,
								node.isTypeOnly,
								node.exportClause,
								moduleSpecifier,
								node.assertClause,
							);
							(updatedNode as any).flags = node.flags;
							return updatedNode;
						}
					} catch {
						return node;
					}
				}
				return tsBinary.visitEachChild(node, visitNode, ctx);
			};
			return tsBinary.visitNode(sf, visitNode);
		};
	};
}
