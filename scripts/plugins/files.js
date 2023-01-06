import { movePluginFilesToWebview, copyModFilesToOwnResource } from './shared.js';

function run() {
    movePluginFilesToWebview('icons', ['png']);
    movePluginFilesToWebview('webview/images', ['jpg', 'png', 'svg', 'jpeg', 'gif']);
    movePluginFilesToWebview('webview/videos', ['webm', 'avi']);
    movePluginFilesToWebview('sounds', ['ogg']);
    copyModFilesToOwnResource();
}

run();
