"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.deactivate = exports.activate = void 0;
var vscode = require("vscode");
// Auto Accept code
const autoAcceptCode = `
// Create and start AutoAccept
(function() {
    if (typeof globalThis.AutoAccept === 'undefined') {
        class AutoAccept {
            constructor(interval = 10000) {
                this.interval = interval;
                this.monitorInterval = null;
                this.isRunning = false;
                this.lastStatus = null;
                this.hasAlertedComplete = false;
                this.log('AutoAccept initialized');
            }

            // ... rest of the code ...
        }
        globalThis.AutoAccept = AutoAccept;
    }

    if (!globalThis.autoAccept) {
        globalThis.autoAccept = new globalThis.AutoAccept(5000);
        globalThis.autoAccept.start();
    }
})();`;

// Register start command
let startDisposable = vscode.commands.registerCommand('extension.startAutoAccept', async () => {
    try {
        console.log('Attempting to open DevTools...');
        
        // Check DevTools status and open
        const devToolsOpen = await isDevToolsOpen();
        if (!devToolsOpen) {
            try {
                console.log('DevTools not open, attempting to open');
                await vscode.commands.executeCommand('workbench.action.toggleDevTools');
                console.log('Successfully opened DevTools');
            } catch (e) {
                console.log('Failed to open DevTools:', e);
            }
        } else {
            console.log('DevTools already open');
        }
        
        // Inject code to DevTools console
        await vscode.env.clipboard.writeText(autoAcceptCode);
        vscode.window.showInformationMessage(
            'Start code copied to clipboard. Please paste and run it in the DevTools Console to start auto accept.',
            { modal: true }
        );
    } catch (error) {
        console.error('Error preparing start code:', error);
        vscode.window.showErrorMessage('Failed to open DevTools or prepare code: ' + error.message);
    }
});

// Register stop command
let stopDisposable = vscode.commands.registerCommand('extension.stopAutoAccept', async () => {
    try {
        console.log('Attempting to open DevTools...');
        
        // Check DevTools status and open
        const devToolsOpen = await isDevToolsOpen();
        if (!devToolsOpen) {
            try {
                console.log('DevTools not open, attempting to open');
                await vscode.commands.executeCommand('workbench.action.toggleDevTools');
                console.log('Successfully opened DevTools');
            } catch (e) {
                console.log('Failed to open DevTools:', e);
            }
        } else {
            console.log('DevTools already open');
        }
        
        // Inject code to DevTools console
        await vscode.env.clipboard.writeText(stopAutoAcceptCode);
        vscode.window.showInformationMessage(
            'Stop code copied to clipboard. Please paste and run it in the DevTools Console to stop auto accept.',
            { modal: true }
        );
    } catch (error) {
        console.error('Error preparing stop code:', error);
        vscode.window.showErrorMessage('Failed to open DevTools or prepare code: ' + error.message);
    }
});

function activate(context) {
    var _this = this;
    console.log('Button Monitor Extension is now active!');
    // 注册开始监控命令
    var startDisposable = vscode.commands.registerCommand('extension.startButtonMonitor', function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Attempting to start button monitor...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    // 注入监控代码
                    return [4 /*yield*/, vscode.commands.executeCommand('workbench.action.webview.openDeveloperTools')];
                case 2:
                    // 注入监控代码
                    _a.sent();
                    console.log('Developer tools opened');
                    // 等待开发者工具打开
                    setTimeout(function () {
                        try {
                            // 注入代码到开发者工具的控制台
                            var devTools = vscode.window.createWebviewPanel('devTools', 'Developer Tools', vscode.ViewColumn.Two, {
                                enableScripts: true
                            });
                            devTools.webview.html = "\n                        <script>\n                            ".concat(buttonMonitorCode, "\n                            // \u542F\u52A8\u76D1\u63A7\n                            if (window.buttonMonitor) {\n                                window.buttonMonitor.start();\n                                console.log('Button monitor started successfully');\n                            } else {\n                                console.error('Failed to initialize button monitor');\n                            }\n                        </script>\n                    ");
                            vscode.window.showInformationMessage('Button Monitor has been started!');
                        }
                        catch (error) {
                            console.error('Error creating webview:', error);
                            vscode.window.showErrorMessage('Failed to start Button Monitor: ' + error.message);
                        }
                    }, 1000);
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error in start command:', error_1);
                    vscode.window.showErrorMessage('Error starting Button Monitor: ' + error_1.message);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    // 注册停止监控命令
    var stopDisposable = vscode.commands.registerCommand('extension.stopButtonMonitor', function () { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Attempting to stop button monitor...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, vscode.commands.executeCommand('workbench.action.webview.openDeveloperTools')];
                case 2:
                    _a.sent();
                    setTimeout(function () {
                        try {
                            var devTools = vscode.window.createWebviewPanel('devTools', 'Developer Tools', vscode.ViewColumn.Two, {
                                enableScripts: true
                            });
                            devTools.webview.html = "\n                        <script>\n                            if (window.buttonMonitor) {\n                                window.buttonMonitor.stop();\n                                console.log('Button monitor stopped successfully');\n                            } else {\n                                console.warn('Button monitor not found');\n                            }\n                        </script>\n                    ";
                            vscode.window.showInformationMessage('Button Monitor has been stopped!');
                        }
                        catch (error) {
                            console.error('Error creating webview:', error);
                            vscode.window.showErrorMessage('Failed to stop Button Monitor: ' + error.message);
                        }
                    }, 1000);
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('Error in stop command:', error_2);
                    vscode.window.showErrorMessage('Error stopping Button Monitor: ' + error_2.message);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    context.subscriptions.push(startDisposable, stopDisposable);
    console.log('Button Monitor commands registered successfully');
}
exports.activate = activate;
function deactivate() {
    console.log('Button Monitor Extension is now deactivated');
}
exports.deactivate = deactivate;
