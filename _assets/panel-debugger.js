// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    const vscode = acquireVsCodeApi();

    setup();

    document.querySelector(`[data-type='dev']`)?.addEventListener('click', () => {
        vscode.postMessage({ action: 'build' });
        updateButtonStatus('build');
    });

    document.querySelector(`[data-type='build']`)?.addEventListener('click', () => {
        // noop
    });

    document.querySelector(`[data-type='debug']`)?.addEventListener('click', () => {
        vscode.postMessage({ action: 'dev' });
        updateButtonStatus('debug');
    });

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.action) {
            case 'dev': {
                updateButtonStatus("dev");
                break;
            }
            case 'build': {
                updateButtonStatus("build");
                break;
            }
            case 'debug': {
                updateButtonStatus("debug");
                break;
            }
        }
    });


    function setup() {
        updateButtonStatus("dev");
    }

    function updateButtonStatus(status) {
        switch (status) {
            case "dev":
                document.querySelector(`[data-type='dev']`).style.display = 'block';
                document.querySelector(`[data-type='build']`).style.display = 'none';
                document.querySelector(`[data-type='debug']`).style.display = 'none';
                break;

            case "build":
                document.querySelector(`[data-type='dev']`).style.display = 'none';
                document.querySelector(`[data-type='build']`).style.display = 'block';
                document.querySelector(`[data-type='debug']`).style.display = 'none';
                break;

            case "debug":
                document.querySelector(`[data-type='dev']`).style.display = 'none';
                document.querySelector(`[data-type='build']`).style.display = 'none';
                document.querySelector(`[data-type='debug']`).style.display = 'block';
                break;
        }
    }

}());


