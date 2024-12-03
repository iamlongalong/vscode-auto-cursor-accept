class AutoAccept {
    constructor(interval = 10000) {
        this.interval = interval;
        this.monitorInterval = null;
        this.isRunning = false;
        this.lastStatus = null;
        this.hasAlertedComplete = false;
        this.log('AutoAccept initialized');
        this.start();
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = '[AutoAccept]';
        const fullMessage = `${prefix} ${timestamp} - ${message}`;
        
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
        this.log('Starting auto accept...');
        this.checkAndAccept();
        this.monitorInterval = setInterval(() => {
            this.checkAndAccept();
        }, this.interval);
        this.isRunning = true;
        this.log(`Auto accept started, checking every ${this.interval/1000} seconds`);
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
                this.log(`Status changed from ${this.lastStatus} to ${currentStatus}, resetting complete alert`);
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
            this.log(`Error checking status: ${error.message}`, 'error');
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
        this.log(`Triggered accept event: ${element.textContent.trim()}`);
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
                    this.log(`Found button: ${buttonText}`);
                    this.triggerClick(button);
                }
            });
        } catch (error) {
            this.log(`Error executing: ${error.message}`, 'error');
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
        this.log(`Current status: ${JSON.stringify(status)}`);
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
        this.log(`Check interval updated to ${newInterval/1000} seconds`);
        return true;
    }
}

// Create global instance for console use
window.autoAccept = new AutoAccept();
window.autoAccept.start(5000);

/*
Usage:
1. Restart auto accept (if needed):
   autoAccept.start()

2. Stop auto accept:
   autoAccept.stop()

3. Check status:
   autoAccept.getStatus()

4. Change check interval (in milliseconds):
   autoAccept.setInterval(5000) // Set to 5 seconds

5. Manually reset status:
   autoAccept.resetStatus()
*/ 