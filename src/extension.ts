import * as vscode from 'vscode';

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

            log(message, type = 'info') {
                const timestamp = new Date().toISOString();
                const prefix = '[AutoAccept]';
                const fullMessage = \`\${prefix} \${timestamp} - \${message}\`;
                
                try {
                    window.postMessage({ type: 'log', message: fullMessage }, '*');
                    console.debug(fullMessage);
                    if (type === 'error') {
                        console.trace(fullMessage);
                    } else {
                        console.debug(fullMessage);
                    }
                } catch (e) {
                    console.log(fullMessage);
                }
            }

            start() {
                if (this.isRunning) {
                    this.log('Auto accept is already running');
                    return false;
                }

                this.checkAndAccept();
                this.monitorInterval = setInterval(() => this.checkAndAccept(), this.interval);
                this.isRunning = true;
                this.log(\`Auto accept started, checking every \${this.interval/1000} seconds\`);
                return true;
            }

            stop() {
                if (!this.isRunning) {
                    this.log('Auto accept is not running');
                    return false;
                }
                clearInterval(this.monitorInterval);
                this.monitorInterval = null;
                this.isRunning = false;
                this.log('Auto accept stopped');
                return true;
            }

            textIncludes(text, target) {
                return text.toLowerCase().includes(target.toLowerCase());
            }

            getCurrentStatus(content) {
                if (this.textIncludes(content, 'generating')) {
                    return 'generating';
                }
                if (this.textIncludes(content, 'completed')) {
                    return 'completed';
                }
                return 'unknown';
            }

            checkStatus(element) {
                try {
                    if (!element) return;
                    
                    const content = element.textContent || '';
                    const currentStatus = this.getCurrentStatus(content);
                    
                    if (this.lastStatus !== currentStatus && currentStatus !== 'completed') {
                        this.hasAlertedComplete = false;
                        this.log(\`Status changed from \${this.lastStatus} to \${currentStatus}, resetting complete alert\`);
                    }

                    this.lastStatus = currentStatus;

                    switch (currentStatus) {
                        case 'generating':
                            this.log('Current status: generating');
                            break;
                        case 'completed':
                            if (!this.hasAlertedComplete) {
                                this.log('Current status: completed', 'info');
                                alert('Task completed');
                                this.hasAlertedComplete = true;
                            }
                            break;
                        case 'unknown':
                            this.log('Current status: unknown');
                            break;
                    }

                    return currentStatus;
                } catch (error) {
                    this.log(\`Error checking status: \${error.message}\`, 'error');
                    return 'error';
                }
            }

            triggerClick(element) {
                const rect = element.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                const mousedownEvent = new MouseEvent('mousedown', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    button: 0,
                    buttons: 1,
                    clientX: centerX,
                    clientY: centerY,
                    screenX: centerX,
                    screenY: centerY,
                    detail: 1,
                    isTrusted: true
                });

                element.dispatchEvent(mousedownEvent);
                this.log(\`Triggered accept event: \${element.textContent.trim()}\`);
            }

            checkAndAccept() {
                try {
                    const inputBox = document.querySelector('div.full-input-box');
                    if (!inputBox) {
                        this.log('Input box not found');
                        return;
                    }

                    let previousSibling = inputBox.previousElementSibling;
                    if (!previousSibling) {
                        this.log('Previous sibling not found');
                        return;
                    }

                    const status = this.checkStatus(previousSibling);
                    if (status === 'completed') return;

                    const buttons = previousSibling.querySelectorAll('div.cursor-button-primary');
                    if (!buttons || buttons.length === 0) {
                        this.log('No buttons found');
                        return;
                    }

                    buttons.forEach(button => {
                        const buttonText = button.textContent.trim();
                        if (this.textIncludes(buttonText, 'Run command') || 
                            this.textIncludes(buttonText, 'Accept')) {
                            window.targetButton = button;
                            this.log(\`Found button: \${buttonText}\`);
                            this.triggerClick(button);
                        }
                    });
                } catch (error) {
                    this.log(\`Error executing: \${error.message}\`, 'error');
                }
            }

            getStatus() {
                const status = {
                    isRunning: this.isRunning,
                    interval: this.interval,
                    intervalSeconds: this.interval / 1000,
                    lastStatus: this.lastStatus,
                    hasAlertedComplete: this.hasAlertedComplete
                };
                this.log(\`Current status: \${JSON.stringify(status)}\`);
                return status;
            }

            setInterval(newInterval) {
                if (typeof newInterval !== 'number' || newInterval < 1000) {
                    this.log('Interval must be a number greater than or equal to 1000 milliseconds', 'error');
                    return false;
                }

                this.interval = newInterval;
                if (this.isRunning) {
                    this.stop();
                    this.start();
                }
                this.log(\`Check interval updated to \${newInterval/1000} seconds\`);
                return true;
            }
        }
        globalThis.AutoAccept = AutoAccept;
    }

    if (!globalThis.autoAccept) {
        globalThis.autoAccept = new globalThis.AutoAccept(5000);
        globalThis.autoAccept.start();
    }
})();
`;

const stopAutoAcceptCode = `
// Stop AutoAccept
if (globalThis.autoAccept) {
    globalThis.autoAccept.stop();
    console.log('AutoAccept stopped');
}
`;

export function activate(context: vscode.ExtensionContext) {
    console.log('Auto Accept Extension is now active!');

    // Check DevTools status function
    async function isDevToolsOpen() {
        try {
            const commands = await vscode.commands.getCommands(true);
            console.log('Checking available DevTools commands:', commands.filter(cmd => cmd.toLowerCase().includes('devtools')));
            return false;
        } catch (e) {
            console.log('Failed to check DevTools status:', e);
            return false;
        }
    }

    // Register start command
    let startDisposable = vscode.commands.registerCommand('extension.startAutoAccept', async () => {
        try {
            console.log('Attempting to open DevTools...');
            
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
            
            await vscode.env.clipboard.writeText(autoAcceptCode);
            vscode.window.showInformationMessage(
                'Start code copied to clipboard. Please paste and run it in the DevTools Console to start auto accept.',
                { modal: true }
            );
        } catch (error: any) {
            console.error('Error preparing start code:', error);
            vscode.window.showErrorMessage('Failed to open DevTools or prepare code: ' + error.message);
        }
    });

    // Register stop command
    let stopDisposable = vscode.commands.registerCommand('extension.stopAutoAccept', async () => {
        try {
            console.log('Attempting to open DevTools...');
            
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
            
            await vscode.env.clipboard.writeText(stopAutoAcceptCode);
            vscode.window.showInformationMessage(
                'Stop code copied to clipboard. Please paste and run it in the DevTools Console to stop auto accept.',
                { modal: true }
            );
        } catch (error: any) {
            console.error('Error preparing stop code:', error);
            vscode.window.showErrorMessage('Failed to open DevTools or prepare code: ' + error.message);
        }
    });

    context.subscriptions.push(startDisposable, stopDisposable);
}

export function deactivate() {
    console.log('Auto Accept Extension is now deactivated');
}