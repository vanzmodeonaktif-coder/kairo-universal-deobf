require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs' } });

let editorInput, editorOutput;

require(['vs/editor/editor.main'], function () {
    // Setup Monaco Editor
    monaco.editor.defineTheme('kairoDark', {
        base: 'vs-dark',
        inherit: true,
        rules: [{ token: 'comment', foreground: '6b7280', fontStyle: 'italic' }],
        colors: { 'editor.background': '#12121a', 'editor.foreground': '#e0e0e0' }
    });

    editorInput = monaco.editor.create(document.getElementById('editor-input'), {
        value: '-- Paste obfuscated Lua code here...',
        language: 'lua',
        theme: 'kairoDark',
        minimap: { enabled: false },
        fontSize: 14
    });

    editorOutput = monaco.editor.create(document.getElementById('editor-output'), {
        value: '-- Clean code will appear here...',
        language: 'lua',
        theme: 'kairoDark',
        readOnly: true,
        minimap: { enabled: false },
        fontSize: 14
    });

    window.addEventListener('resize', () => {
        editorInput.layout();
        editorOutput.layout();
    });
});

document.getElementById('btn-deobf').addEventListener('click', async () => {
    const code = editorInput.getValue();
    const logOutput = document.getElementById('log-output');
    
    logOutput.textContent = '> Initializing pipeline...\n';
    
    const options = {
        decryptStrings: document.getElementById('opt-strings').checked,
        reconstructCFF: document.getElementById('opt-cff').checked,
        removeJunk: document.getElementById('opt-junk').checked,
        beautify: document.getElementById('opt-beautify').checked
    };

    try {
        const response = await fetch('/api/deobf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, options })
        });

        const data = await response.json();

        if (data.success) {
            editorOutput.setValue(data.code);
            logOutput.textContent += `> Pipeline executed. Stages: ${data.stats.stagesRun}\n`;
            logOutput.textContent += `> Size: ${data.stats.originalSize} -> ${data.stats.finalSize} bytes\n`;
            logOutput.textContent += '--- LOGS ---\n' + data.logs.join('\n');
        } else {
            logOutput.textContent += `> ERROR: ${data.error}\n`;
        }
    } catch (e) {
        logOutput.textContent += `> FATAL: ${e.message}\n`;
    }
});
