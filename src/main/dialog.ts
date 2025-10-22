import * as path from 'node:path';

import { dialog, nativeImage, type MessageBoxOptions, type MessageBoxReturnValue } from 'electron';

import { ASSET_PATHS } from '../shared/constants';

export async function showMessageBox(options: MessageBoxOptions): Promise<MessageBoxReturnValue> {
  const iconPath = path.join(__dirname, ASSET_PATHS.DIALOG_ICON);
  const icon = nativeImage.createFromPath(iconPath);

  return dialog.showMessageBox({
    ...options,
    icon: icon.isEmpty() ? undefined : icon,
  });
}
