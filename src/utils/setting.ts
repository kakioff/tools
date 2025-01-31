import { Store } from '@tauri-apps/plugin-store';

export const settingFilePath = 'config.json';

/**
 * Get a setting value. If the setting does not exist, it will return null.
 * @param key
 * @returns 
 */
export async function getSetting<T>(key: keyof SettingType): Promise<T | null> {
    
    const store = await Store.load(settingFilePath);

    try {
        const value = await store.get(key) as T;
        return value;
    } catch (error) {
        console.error(`Failed to get setting for key "${key}":`, error);
        return null;
    }
}

/**
 * Set a setting value.
 * @param key 
 * @param value 
 */
export async function setSetting(key: keyof SettingType, value: SettingType[keyof SettingType]): Promise<void> {
    const store = await Store.load(settingFilePath);

    try {
        console.log(value);
        
        await store.set(key, value);
    } catch (error) {
        console.error(`Failed to set setting for key "${key}":`, error);
    }

}

