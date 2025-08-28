/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
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

import { SettingsTab, wrapTab } from "@components/settings/tabs";
import definePlugin from "@utils/types";

import { injectTab, unInjectTab } from "./util";

const StoreTab = () => {
    return <SettingsTab title={TAB_NAME}>

    </SettingsTab>;
};

function createStoreTab(ID: Record<string, unknown>) {
    return {
        section: "VencordBDStore", // workaround
        label: TAB_NAME,
        element: wrapTab(StoreTab, TAB_NAME),
        className: "bv-store-view",
    };
}

export default definePlugin({
    name: PLUGIN_NAME,
    authors: [
        { id: 0n, name: "Davil" },
    ],
    description: "Adds a tab for compat layer plugins",
    start() {
        injectTab(createStoreTab);
    },
    stop() {
        unInjectTab(createStoreTab);
    }
});
