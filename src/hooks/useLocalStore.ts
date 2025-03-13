import localforage from "localforage";
import { SettingOnStore } from "@/types/SettingOnStore.ts";
import CryptoJS from "crypto-js";

const KEY_SETTING = "setting";

// ------ Setting API ------
export async function getSetting(): Promise<SettingOnStore> {
    let setting = await localforage.getItem<SettingOnStore>(KEY_SETTING);

    if (setting) {
        console.log("🔍 Retrieved existing settings:", setting);
        return setting;
    }

    console.warn("⚠️ No settings found. Initializing default settings...");

    const defaultSetting: SettingOnStore = {
        username: "walrus",
        password: "password", // Default password before hashing
        aggregator: "https://aggregator.walrus-testnet.walrus.space",
        publisher: "https://publisher.walrus-testnet.walrus.space",
        salt: Math.random().toString(36).substring(2, 12),
        walrusHash: Math.random().toString(36).substring(2, 12),
        walrusSalt: Math.random().toString(36).substring(2, 10),
    };

    // Hash the default password before storing
    defaultSetting.password = `${defaultSetting.salt}:${CryptoJS.SHA1(defaultSetting.password + defaultSetting.salt).toString()}`;

    await localforage.setItem(KEY_SETTING, defaultSetting);

    console.log("✅ Default settings initialized:", defaultSetting);
    return defaultSetting;
}

export async function setSettings(updatedSetting: Partial<SettingOnStore>) {
    let existingSetting = await localforage.getItem<SettingOnStore>(KEY_SETTING);

    if (!existingSetting) {
        console.warn("⚠️ No existing settings found. Fetching defaults...");
        existingSetting = await getSetting();
    }

    // Merge existing settings with new values
    const newSetting = { ...existingSetting, ...updatedSetting };

    // Handle password update correctly
    if (updatedSetting.password && updatedSetting.password.trim() !== "") {
        newSetting.salt = existingSetting.salt || Math.random().toString(36).substring(2, 12);
        newSetting.password = `${newSetting.salt}:${CryptoJS.SHA1(updatedSetting.password + newSetting.salt).toString()}`;
    } else {
        newSetting.password = existingSetting.password; // Keep old password if none provided
    }

    await localforage.setItem(KEY_SETTING, newSetting);

    console.log("✅ Updated settings saved:", newSetting);
}

