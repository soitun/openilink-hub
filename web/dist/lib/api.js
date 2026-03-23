async function request(url, options) {
    const res = await fetch(url, {
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", ...options?.headers },
        ...options,
    });
    if (res.status === 401) {
        window.location.href = "/login";
        throw new Error("unauthorized");
    }
    const data = await res.json();
    if (!res.ok)
        throw new Error(data.error || `HTTP ${res.status}`);
    return data;
}
export const api = {
    // Auth
    register: (username, password) => request("/api/auth/register", { method: "POST", body: JSON.stringify({ username, password }) }),
    login: (username, password) => request("/api/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),
    logout: () => request("/api/auth/logout", { method: "POST" }),
    oauthProviders: () => request("/api/auth/oauth/providers"),
    me: () => request("/api/me"),
    info: () => request("/api/info"),
    // My plugins
    myPlugins: () => request("/api/me/plugins"),
    // Passkeys
    listPasskeys: () => request("/api/me/passkeys"),
    passkeyBindBegin: () => request("/api/me/passkeys/register/begin", { method: "POST" }),
    passkeyBindFinishRaw: (body) => fetch("/api/me/passkeys/register/finish", {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json" }, body,
    }).then(async (r) => { if (!r.ok)
        throw new Error((await r.json()).error); }),
    deletePasskey: (id) => request(`/api/me/passkeys/${id}`, { method: "DELETE" }),
    // Profile
    updateProfile: (data) => request("/api/me/profile", { method: "PUT", body: JSON.stringify(data) }),
    changePassword: (data) => request("/api/me/password", { method: "PUT", body: JSON.stringify(data) }),
    // Bots
    listBots: () => request("/api/bots"),
    bindStart: () => request("/api/bots/bind/start", { method: "POST" }),
    reconnectBot: (id) => request(`/api/bots/${id}/reconnect`, { method: "POST" }),
    deleteBot: (id) => request(`/api/bots/${id}`, { method: "DELETE" }),
    updateBot: (id, data) => request(`/api/bots/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    botContacts: (id) => request(`/api/bots/${id}/contacts`),
    // Channels (under bots)
    listChannels: (botId) => request(`/api/bots/${botId}/channels`),
    createChannel: (botId, name, handle) => request(`/api/bots/${botId}/channels`, { method: "POST", body: JSON.stringify({ name, handle: handle || "" }) }),
    updateChannel: (botId, id, data) => request(`/api/bots/${botId}/channels/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteChannel: (botId, id) => request(`/api/bots/${botId}/channels/${id}`, { method: "DELETE" }),
    rotateKey: (botId, id) => request(`/api/bots/${botId}/channels/${id}/rotate_key`, { method: "POST" }),
    // OAuth accounts
    oauthAccounts: () => request("/api/me/linked-accounts"),
    unlinkOAuth: (provider) => request(`/api/me/linked-accounts/${provider}`, { method: "DELETE" }),
    // Stats
    stats: () => request("/api/bots/stats"),
    // Messages (under bots)
    messages: (botId, limit = 30, cursor) => request(`/api/bots/${botId}/messages?limit=${limit}${cursor ? "&cursor=" + cursor : ""}`),
    // Admin: system config
    getOAuthConfig: () => request("/api/admin/config/oauth"),
    setOAuthConfig: (provider, data) => request(`/api/admin/config/oauth/${provider}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteOAuthConfig: (provider) => request(`/api/admin/config/oauth/${provider}`, { method: "DELETE" }),
    // Admin: AI config
    getAIConfig: () => request("/api/admin/config/ai"),
    setAIConfig: (data) => request("/api/admin/config/ai", { method: "PUT", body: JSON.stringify(data) }),
    deleteAIConfig: () => request("/api/admin/config/ai", { method: "DELETE" }),
    // Plugins
    listPlugins: (status) => request(`/api/webhook-plugins${status ? `?status=${status}` : ""}`),
    getPlugin: (id) => request(`/api/webhook-plugins/${id}`),
    submitPlugin: (data) => request("/api/webhook-plugins/submit", { method: "POST", body: JSON.stringify(data) }),
    installPlugin: (id) => request(`/api/webhook-plugins/${id}/install`, { method: "POST" }),
    pluginVersions: (id) => request(`/api/webhook-plugins/${id}/versions`),
    debugRequest: (data) => request("/api/webhook-plugins/debug/request", { method: "POST", body: JSON.stringify(data) }),
    debugResponse: (data) => request("/api/webhook-plugins/debug/response", { method: "POST", body: JSON.stringify(data) }),
    installPluginToChannel: (id, botId, channelId) => request(`/api/webhook-plugins/${id}/install-to-channel`, { method: "POST", body: JSON.stringify({ bot_id: botId, channel_id: channelId }) }),
    reviewPlugin: (id, status, reason) => request(`/api/admin/webhook-plugins/${id}/review`, { method: "PUT", body: JSON.stringify({ status, reason: reason || "" }) }),
    deletePlugin: (id) => request(`/api/admin/webhook-plugins/${id}`, { method: "DELETE" }),
    // Webhook logs
    webhookLogs: (botId, channelId, limit = 50) => request(`/api/bots/${botId}/webhook-logs?limit=${limit}${channelId ? "&channel_id=" + channelId : ""}`),
    // Admin: Dashboard
    adminStats: () => request("/api/admin/stats"),
    // Admin: Users
    listUsers: () => request("/api/admin/users"),
    createUser: (data) => request("/api/admin/users", { method: "POST", body: JSON.stringify(data) }),
    updateUserRole: (id, role) => request(`/api/admin/users/${id}/role`, { method: "PUT", body: JSON.stringify({ role }) }),
    updateUserStatus: (id, status) => request(`/api/admin/users/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
    resetUserPassword: (id) => request(`/api/admin/users/${id}/password`, { method: "PUT" }),
    deleteUser: (id) => request(`/api/admin/users/${id}`, { method: "DELETE" }),
};
