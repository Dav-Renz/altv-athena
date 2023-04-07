import {
    moveAssetsToWebview,
    movePluginFilesToWebview,
    clearPluginsWebViewFolder,
    moveAssetsToMods,
} from './shared.js';

function run() {
    clearPluginsWebViewFolder();
    movePluginFilesToWebview('icons', ['png']);
    movePluginFilesToWebview('webview/images', ['jpg', 'png', 'svg', 'jpeg', 'gif']);
    movePluginFilesToWebview('webview/videos', ['webm', 'avi']);
    movePluginFilesToWebview('sounds', ['ogg']);
    moveAssetsToWebview('webview/assets', [
        'jpg',
        'png',
        'svg',
        'jpeg',
        'gif',
        'webm',
        'webp',
        'avi',
        'ogg',
        'wav',
        'css',
        'html',
        'js',
        'ico',
        'otf',
        'ttf',
    ]);
    moveAssetsToMods('map');
    moveAssetsToMods('vehicle');
}

run();
