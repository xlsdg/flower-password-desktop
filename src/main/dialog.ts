import { dialog, MessageBoxOptions, MessageBoxReturnValue } from 'electron';
import * as path from 'node:path';

import { ASSETS_PATH } from '../shared/constants';

/**
 * Show message box with default app icon
 * Automatically adds the app icon to the dialog
 *
 * @param options - Message box options (icon will be auto-added)
 * @returns Promise resolving to user's response
 */
export async function showMessageBox(options: MessageBoxOptions): Promise<MessageBoxReturnValue> {
  const iconPath = path.join(__dirname, ASSETS_PATH.DIALOG_ICON);

  return dialog.showMessageBox({
    ...options,
    icon: iconPath,
  });
}
