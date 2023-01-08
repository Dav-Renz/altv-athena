import path from 'path';
import fs from 'fs-extra';
import glob from 'glob';

const viablePluginDisablers = ['disable.plugin', 'disabled.plugin', 'disable', 'disabled'];

export function sanitizePath(p) {
    return p.replace(/\\/g, '/');
}

export function getEnabledPlugins() {
    const pluginsFolder = sanitizePath(path.join(process.cwd(), 'src/core/plugins'));
    const plugins = fs.readdirSync(pluginsFolder);

    return plugins.filter((plugin) => {
        for (const disabler of viablePluginDisablers) {
            const filePath = sanitizePath(path.join(pluginsFolder, plugin, disabler));
            if (fs.existsSync(filePath)) {
                return false;
            }
        }

        return true;
    });
}

export function movePluginFilesToWebview(folderName, extensions, isSrc = false) {
    const normalizedName = `${folderName}`.replace('webview/', '');

    // First Perform Extension & Sub Directory Cleanup
    let oldFiles;

    if (!isSrc) {
        oldFiles = glob.sync(
            sanitizePath(path.join(`src-webviews/public/plugins/${normalizedName}/**/*.+(${extensions.join('|')})`)),
        );
    } else {
        oldFiles = glob.sync(
            sanitizePath(path.join(`src-webviews/src/plugins/${normalizedName}/**/*.+(${extensions.join('|')})`)),
        );
    }

    for (let oldFile of oldFiles) {
        if (fs.existsSync(oldFile)) {
            fs.rmSync(oldFile, { force: true });
        }

        const directory = sanitizePath(path.dirname(oldFile));
        if (fs.existsSync(directory)) {
            const files = fs.readdirSync(directory);
            if (files.length <= 0) {
                fs.rmdirSync(directory);
            }
        }
    }

    // Next Scan Available Plugins
    const enabledPlugins = getEnabledPlugins();

    let amountCopied = 0;
    for (const pluginName of enabledPlugins) {
        const pluginFolder = sanitizePath(path.join(process.cwd(), `src/core/plugins/`, pluginName));
        if (!fs.existsSync(sanitizePath(path.join(pluginFolder, folderName)))) {
            continue;
        }

        const allFiles = glob.sync(
            sanitizePath(path.join(pluginFolder, `${folderName}/**/*.+(${extensions.join('|')})`)),
        );
        for (let i = 0; i < allFiles.length; i++) {
            const filePath = allFiles[i];
            const regExp = new RegExp(`.*\/${folderName}\/`);
            let finalPath;

            if (!isSrc) {
                finalPath = sanitizePath(
                    filePath.replace(regExp, `src-webviews/public/plugins/${normalizedName}/${pluginName}/`),
                );
            } else {
                finalPath = sanitizePath(
                    filePath.replace(regExp, `src-webviews/src/plugins/${normalizedName}/${pluginName}/`),
                );
            }

            if (fs.existsSync(filePath)) {
                const folderPath = sanitizePath(path.dirname(finalPath));
                if (!fs.existsSync(folderPath)) {
                    fs.mkdirSync(folderPath, { recursive: true });
                }

                console.log(finalPath);
                fs.copyFileSync(filePath, finalPath);
                amountCopied += 1;
            }
        }
    }

    console.log(`${folderName} - ${amountCopied} Files Added to WebView Plugins - (${extensions.join('|')})`);
}

export function copyModFilesToOwnResource() {
    // First Perform Cleanup

    let oldFiles = glob.sync(sanitizePath(path.join(`resources/mods/autocopied-mods/**/*.*`)));

    for (let oldFile of oldFiles) {
        //console.log('Old file path: ' + oldFile);
        if (fs.existsSync(oldFile)) {
            fs.rmSync(oldFile, { force: true });
        }

        const directory = sanitizePath(path.dirname(oldFile));
        if (fs.existsSync(directory)) {
            const files = fs.readdirSync(directory);
            if (files.length <= 0) {
                fs.rmdirSync(directory);
            }
        }
    }

    // Next Scan Available Plugins

    const enabledPlugins = getEnabledPlugins();

    // Set available Mod Types
    const modTypes = ['maps', 'vehicles', 'cloths'];

    let amountCopied = 0;
    // Go trough each plugin
    for (const pluginName of enabledPlugins) {
        const pluginFolder = sanitizePath(path.join(process.cwd(), `src/core/plugins/`, pluginName));

        // Check if the plugin folder exists and if it has a 'mods' folder
        if (!fs.existsSync(sanitizePath(pluginFolder))) {
            continue;
        }
        if (!fs.existsSync(sanitizePath(path.join(pluginFolder, '/mods')))) {
            continue;
        }

        //go through each existing Mod Type folder
        let modsExist = false;
        for (const modType of modTypes) {
            if (!fs.existsSync(sanitizePath(path.join(pluginFolder, `/mods/${modType}`)))) {
                continue;
            }
            modsExist = true;

            const regExp = new RegExp(`.*\/mods\/${modType}\/`);

            const allModTypeFiles = glob.sync(
                sanitizePath(path.join(pluginFolder, `/mods/${modType}/**`).replace(/\\/g, '/')),
                {
                    nodir: true,
                },
            );

            for (const file of allModTypeFiles) {
                const targetPath = file.replace(regExp, `resources/mods/autocopied-mods/${modType}/${pluginName}/`);

                console.log(targetPath);
                fs.copy(file, targetPath, { overwrite: true });
                amountCopied += 1;
            }
        }
        if (!modsExist) {
            console.log(`No mod-subfolders found in ${pluginName}`);
        }
    }
    console.log(`ModMover - ${amountCopied} Files copied to mods folder`);
}
