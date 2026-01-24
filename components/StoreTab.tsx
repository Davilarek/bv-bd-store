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

import { SettingsTab } from "@components/settings/tabs";
import { ApiPlugin } from "../api/models";
import { React } from "@webpack/common";
import { BaseText } from "@components/BaseText";

type InstallStatus = {
    installed: boolean;
    shadow: null | string; // shadow as in for example GameActivityToggle from Vencord exists so a plugin with the same name will be named GameActivityToggle-BD
    version: null | string;
}

interface PluginCardProps {
    plugin: ApiPlugin;
    onInstall: (plugin: ApiPlugin) => void;
    isInstalled: (plugin: ApiPlugin) => InstallStatus;
}
import { ComponentPropsWithoutRef } from "react";
import { Button } from "@components/Button";
type MutedBaseTextProps = ComponentPropsWithoutRef<typeof BaseText>;

const MutedBaseText = ({ children, ...rest }: MutedBaseTextProps) => {
    return (
        <BaseText
            {...rest}
            style={{ color: "var(--text-muted)" }}
        >
            {children}
        </BaseText>
    );
}; // TODO: move to bdCompat util or something

function PluginCard({ plugin, onInstall, isInstalled }: PluginCardProps) {
    const [isInstalling, setIsInstalling] = React.useState(false);

    const handleInstall = async () => {
        if (isInstalling) return;

        setIsInstalling(true);
        try {
            await onInstall(plugin);
        } finally {
            setIsInstalling(false);
        }
    };
    const installedStatus = isInstalled(plugin);

    return (
        <div style={{
            padding: "1em",
            marginBottom: "1em",
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <BaseText style={{ margin: "0 0 0.5em 0" }} size="md">{plugin.name}</BaseText>
                    <MutedBaseText style={{ margin: "0 0 0.5em 0" }}>
                        by {plugin.author.display_name} - {plugin.downloads.toLocaleString()} downloads - {plugin.likes.toLocaleString()} likes
                    </MutedBaseText>
                    <BaseText style={{ margin: "0 0 0.75em 0" }}>
                        {plugin.description}
                    </BaseText>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25em", marginBottom: "0.75em" }}>
                        {plugin.tags.slice(0, 3).map(tag => (
                            <MutedBaseText
                                key={tag}
                                style={{
                                    padding: "0.2em 0.8em",
                                    display: "inline-block"
                                }}
                                size="sm"
                            >
                                {tag}
                            </MutedBaseText>
                        ))}
                    </div>
                </div>
                <Button onClick={handleInstall} disabled={isInstalling || installedStatus.installed}>
                    {installedStatus.installed ? "Installed" + (installedStatus.shadow ? ` (as ${installedStatus.shadow}, with version ${installedStatus.version})` : ` (with version ${installedStatus.version})`) : isInstalling ? "Installing..." : "Install"}
                </Button>
            </div>
            <MutedBaseText style={{ marginTop: "0.75em" }} size="sm">
                Version: {plugin.version} - Updated: {new Date(plugin.latest_release_date).toLocaleDateString()}
            </MutedBaseText>
        </div>
    );
}

interface StoreTabProps {
    plugins: ApiPlugin[];
    loading: boolean;
    onLoadMore: () => void;
    hasMore: boolean;
    onInstall: (plugin: ApiPlugin) => void;
    isInstalled: (plugin: ApiPlugin) => InstallStatus;
}

function StoreTabContent({
    plugins,
    loading,
    onLoadMore,
    hasMore,
    onInstall,
    isInstalled
}: StoreTabProps) {
    return (
        <SettingsTab>
            <div style={{ padding: "1em" }}>
                {loading && plugins.length === 0 ? (
                    <MutedBaseText style={{ textAlign: "center", padding: "2.5em 0", display: "block" }}>
                        Loading plugins...
                    </MutedBaseText>
                ) : (
                    <>
                        {plugins.map(plugin => (
                            <PluginCard
                                key={plugin.id}
                                plugin={plugin}
                                onInstall={onInstall}
                                isInstalled={isInstalled}
                            />
                        ))}

                        {hasMore && (
                            <div style={{ textAlign: "center", marginTop: "1.25em" }}>
                                <Button onClick={onLoadMore} disabled={loading}>
                                    {loading ? "Loading more..." : "Load More"}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </SettingsTab>
    );
}

export default StoreTabContent;
