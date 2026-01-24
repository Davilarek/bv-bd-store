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

// import { fetchWithCorsProxyFallback } from "../../../plugins/bdCompatLayer/fakeStuff";
import { PLUGIN_NAME } from "@plugins/bdCompatLayer/constants";
import { fetchWithCorsProxyFallback } from "@plugins/bdCompatLayer/fakeStuff";

interface RequestOptions {
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    headers?: Record<string, string>;
    body?: string | FormData;
    timeout?: number;
}

interface ApiResponse<T = any> {
    ok: boolean;
    status: number;
    statusText: string;
    data: T;
}

export class HttpClient {
    private baseUrl: string;
    private alwaysUseCorsProxy: boolean;

    constructor(baseUrl: string, alwaysUseCorsProxy: boolean = false) {
        this.baseUrl = baseUrl;
        this.alwaysUseCorsProxy = alwaysUseCorsProxy;
    }

    async get<T = any>(endpoint: string, options: RequestOptions = {}) {
        return this.makeRequest<T>(endpoint, { ...options, method: "GET" });
    }

    private async makeRequest<T = any>(endpoint: string, options: RequestOptions = {}) {
        const corsProxy = Vencord.Settings.plugins[PLUGIN_NAME].corsProxyUrl;
        const url = (this.alwaysUseCorsProxy ? corsProxy : "") + this.baseUrl + endpoint;

        const headers = {
            "Content-Type": "application/json",
            ...options.headers
        };

        const requestOptions = {
            method: options.method || "GET",
            headers,
            body: options.body
        };

        try {
            const response = await fetchWithCorsProxyFallback(url, requestOptions, this.alwaysUseCorsProxy ? "" : corsProxy);

            const status = response.status;
            const statusText = response.statusText;
            const ok = response.ok;

            let data: T;
            try {
                data = await response.json();
            } catch (e) {
                data = await response.text() as any;
            }

            return {
                ok,
                status,
                statusText,
                data
            } as ApiResponse<T>;
        } catch (error) {
            console.error(`API request failed: ${url}`, error);
            throw error;
        }
    }
}
