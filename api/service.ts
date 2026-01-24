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

import { HttpClient } from "./http";
import {
    ApiPlugin,
    PluginSearchParams
} from "./models";
import { API_BASE, HOME_BASE } from "../constants";

export class PluginStoreService {
    private api_http: HttpClient;
    // private http: HttpClient;
    private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

    constructor() {
        this.api_http = new HttpClient(API_BASE);
        // this.http = new HttpClient(HOME_BASE, true);
        // this.http = new HttpClient(HOME_BASE);
    }

    async getPlugins(params: PluginSearchParams = {}) {
        const cacheKey = this.buildCacheKey('plugins', params);
        const cached = this.getCachedData<ApiPlugin[]>(cacheKey);

        if (cached) {
            return cached;
        }

        try {
            const queryParams = new URLSearchParams();

            if (params.query) queryParams.append('query', params.query);
            if (params.author) queryParams.append('author', params.author);
            if (params.limit) queryParams.append('limit', params.limit.toString());
            if (params.offset) queryParams.append('offset', params.offset.toString());
            if (params.sortBy) queryParams.append('sortBy', params.sortBy);
            if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

            if (params.tags && params.tags.length > 0) {
                queryParams.append('tags', params.tags.join(','));
            }

            const endpoint = `/store/plugins?${queryParams.toString()}`;
            const response = await this.api_http.get<ApiPlugin[]>(endpoint);

            if (!response.ok) {
                throw new Error(`Failed to fetch plugins: ${response.status} ${response.statusText}`);
            }

            const plugins = (response.ok && response.data) ? response.data : [];
            this.setCachedData(cacheKey, plugins, 5 * 60 * 1000);

            return plugins;
        } catch (error) {
            console.error('Error fetching plugins:', error);
            throw error;
        }
    }

    async searchPlugins(query: string, limit: number = 20) {
        return this.getPlugins({ query, limit });
    }

    async getPluginsByAuthor(author: string, limit: number = 20) {
        return this.getPlugins({ author, limit });
    }

    async getPopularPlugins(limit: number = 20) {
        return this.getPlugins({
            limit,
            sortBy: 'downloads',
            sortOrder: 'desc'
        });
    }

    async getRecentlyUpdatedPlugins(limit: number = 20) {
        return this.getPlugins({
            limit,
            sortBy: 'updated',
            sortOrder: 'desc'
        });
    }

    async getPluginsByTags(tags: string[], limit: number = 20) {
        return this.getPlugins({ tags, limit });
    }

    async getPluginFile(plugin: ApiPlugin) {
        try {
            // const response = await this.http.get<string>(`/gh-redirect?id=${plugin.id}`, {
            const response = await fetch(`${HOME_BASE}/gh-redirect?id=${plugin.id}`, {
                method: 'GET',
                // headers: {
                //     'X-Store-Download': plugin.name,
                //     'Cache-Control': 'no-cache',
                //     'Pragma': 'no-cache'
                // }
            });

            if (!response.ok) {
                throw new Error(`Failed to download plugin: ${response.status} ${response.statusText}`);
            }

            return await response.text();
        } catch (error) {
            console.error(`Error downloading plugin ${plugin.name}:`, error);
            throw error;
        }
    }

    clearCache() {
        this.cache.clear();
    }

    private buildCacheKey(operation: string, params: any) {
        const sortedParams = Object.keys(params)
            .sort()
            .map(key => `${key}:${params[key]}`)
            .join('|');

        return `${operation}|${sortedParams}`;
    }

    private getCachedData<T>(key: string) {
        const entry = this.cache.get(key);
        if (entry && Date.now() - entry.timestamp < entry.ttl) {
            return entry.data as T;
        }
        if (entry) {
            this.cache.delete(key);
        }
        return null;
    }

    private setCachedData<T>(key: string, data: T, ttl: number) {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
    }
}

export const pluginStoreService = new PluginStoreService();
