/*
 * BDStore Plugin for BetterVencordPatchset
 * Copyright (c) 2026 Davilarek and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { Plugin } from "@utils/types";

type LegacySettingsEntry = {
    section: string;
    label: string;
    element: React.FunctionComponent<any>;
    className: string;
};

/* function createFilesSystemViewTabV2() {
    return {
        title: TabName,
        Component: wrapTab(makeTab, TabName),
        key: `${typeof Vencord.Util.isEquicordGuild === "undefined" ? "vencord" : "equicord"}_bv_fs_view`,
        Icon: FolderIcon,
    };
} */
type SettingsTabV2 = {
    title: string;
    Component: React.FunctionComponent<any>;
    key: string;
    Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
};

type SettingsPlugin = Plugin & {
    customSections: ((ID: Record<string, unknown>) => LegacySettingsEntry)[];
    customEntries: SettingsTabV2[];
};

export function injectTab(builder: () => SettingsTabV2) {
    const settingsPlugin = Vencord.Plugins.plugins.Settings as SettingsPlugin;
    const { customEntries } = settingsPlugin;
    customEntries.push(builder());
}

export function unInjectTab(builder: () => SettingsTabV2) {
    const settingsPlugin = Vencord.Plugins.plugins.Settings as SettingsPlugin;
    const { customEntries } = settingsPlugin;
    customEntries.splice(customEntries.findIndex(x => x.key === builder().key), 1);
}

export function injectTabLegacy(builder: (ID: Record<string, unknown>) => LegacySettingsEntry) {
    const settingsPlugin = Vencord.Plugins.plugins.Settings as SettingsPlugin;
    const { customSections } = settingsPlugin;
    customSections.push(builder);
}

export function unInjectTabLegacy(builder: (ID: Record<string, unknown>) => LegacySettingsEntry) {
    const settingsPlugin = Vencord.Plugins.plugins.Settings as SettingsPlugin;
    const { customSections } = settingsPlugin;
    customSections.splice(customSections.findIndex(x => x({}).className === builder({}).className), 1);
}
