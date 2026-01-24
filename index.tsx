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

import { wrapTab } from "@components/settings/tabs";
import definePlugin from "@utils/types";
import { React } from "@webpack/common";

import { PLUGIN_NAME, TAB_NAME } from "./constants";
import { injectTab, unInjectTab } from "./util";
import { PluginsIcon } from "@components/Icons";
import StoreTabContent from "./components/StoreTab";
import { pluginStoreService } from "./api/service";
import { ApiPlugin } from "./api/models";
import { PluginsHolder } from "@plugins/bdCompatLayer/fakeBdApi";
import { queueLoad } from "@plugins/bdCompatLayer/pluginConstructor";
import { getDeferred } from "@plugins/bdCompatLayer/utils";

function usePluginStore() {
    const [plugins, setPlugins] = React.useState<ApiPlugin[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [offset, setOffset] = React.useState(0);
    const [hasMore, setHasMore] = React.useState(true);
    const limit = 20;

    const isInstalled = (plugin: ApiPlugin) => {
        const result = PluginsHolder.get(plugin.name);
        if (result) {
            if (result.name !== plugin.name) {
                return { installed: true, shadow: result.name, version: result.version };
            }
            return { installed: true, shadow: null, version: result.version };
        }
        return { installed: false, shadow: null, version: null };
    };

    const loadPlugins = async (reset = false) => {
        if (reset) {
            setLoading(true);
            setOffset(0);
        } else if (loading) {
            return;
        }

        try {
            const newPlugins = await pluginStoreService.getPlugins({
                limit, // I have no idea if betterdiscord api supports pagination but if it does this should work
                offset: reset ? 0 : offset,
                sortBy: 'downloads',
                sortOrder: 'desc'
            });

            setPlugins(prev => reset ? newPlugins : [...prev, ...newPlugins]);
            setHasMore(newPlugins.length >= limit);
            if (!reset) setOffset(prev => prev + limit);
        } catch (error) {
            console.error('Error loading plugins:', error);
        } finally {
            if (reset) setLoading(false);
        }
    };

    const installPlugin = async (plugin: ApiPlugin) => {
        try {
            const pluginContent = await pluginStoreService.getPluginFile(plugin);
            const fs = window.require("fs");
            const path = window.require("path");
            const pluginsDir = PluginsHolder.folder;
            const pluginPath = path.join(pluginsDir, plugin.file_name);

            fs.writeFileSync(pluginPath, pluginContent, "utf-8");
            const deferredReady = getDeferred<void>();
            queueLoad(pluginPath, deferredReady);
            await deferredReady.promise;
        } catch (error) {
            console.error(`Error installing plugin ${plugin.name}:`, error);
        }
    };

    React.useEffect(() => {
        loadPlugins(true);
    }, []);

    return {
        plugins,
        loading,
        hasMore,
        onLoadMore: () => loadPlugins(false),
        onInstall: installPlugin,
        isInstalled
    };
}

function StoreTab() {
    const pluginStore = usePluginStore();

    return (
        <StoreTabContent
            plugins={pluginStore.plugins}
            loading={pluginStore.loading}
            onLoadMore={pluginStore.onLoadMore}
            hasMore={pluginStore.hasMore}
            onInstall={pluginStore.onInstall}
            isInstalled={pluginStore.isInstalled}
        />
    );
}

function createStoreTab() {
    return {
        title: TAB_NAME,
        Component: wrapTab(StoreTab, TAB_NAME),
        key: `${typeof (Vencord.Util as any).isEquicordGuild === "undefined" ? "vencord" : "equicord"}_bd_store`,
        Icon: PluginsIcon,
    };
}

export default definePlugin({
    name: PLUGIN_NAME,
    authors: [
        { id: 0n, name: "Davil" },
    ],
    description: "Adds a tab for compat layer plugins.",
    start() {
        injectTab(createStoreTab);
    },
    stop() {
        unInjectTab(createStoreTab);
    }
});
