//@ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    const vscode = acquireVsCodeApi();

    const oldState = vscode.getState() || { colors: [] };

    /** @type {Array<{ value: string }>} */
    let colors = oldState.colors;

    document.querySelector(`[data-type='dev']`)?.addEventListener('click', () => {
        vscode.postMessage({ type: 'debug' });
    });

    document.querySelector(`[data-type='complie']`)?.addEventListener('click', () => {
        vscode.postMessage({ type: 'complie' });
    });

    document.querySelector(`[data-type='debug']`)?.addEventListener('click', () => {
        vscode.postMessage({ type: 'dev' });
    });


    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
            case 'debug': {
                document.querySelector(`[data-type='dev']`).style.display = 'block';
                document.querySelector(`[data-type='complie']`).style.display = 'none';
                document.querySelector(`[data-type='debug']`).style.display = 'none';
                break;
            }
            case 'complie': {
                document.querySelector(`[data-type='dev']`).style.display = 'none';
                document.querySelector(`[data-type='complie']`).style.display = 'block';
                document.querySelector(`[data-type='debug']`).style.display = 'none';
                break;
            }
            case 'dev': {
                document.querySelector(`[data-type='dev']`).style.display = 'none';
                document.querySelector(`[data-type='complie']`).style.display = 'none';
                document.querySelector(`[data-type='debug']`).style.display = 'block';
                break;
            }
        }
    });

}());


