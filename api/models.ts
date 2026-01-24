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

export interface PluginAuthor {
    display_name: string;
}

export interface ApiPlugin {
    id: number;
    name: string;
    author: PluginAuthor;
    description: string;
    version: string;
    file_name: string;
    downloads: number;
    likes: number;
    tags: string[];
    initial_release_date: string;
    latest_release_date: string;
    latest_source_url?: string;
    thumbnail_url: string;
}

export interface PluginSearchParams {
    query?: string;
    tags?: string[];
    author?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'name' | 'downloads' | 'likes' | 'updated' | 'added';
    sortOrder?: 'asc' | 'desc';
}
