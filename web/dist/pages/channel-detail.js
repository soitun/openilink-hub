import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Check, Bot, Radio, Trash2, Puzzle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { api } from "../lib/api";
export function ChannelDetailPage() {
    const { id: botId, cid: channelId } = useParams();
    const navigate = useNavigate();
    const [channel, setChannel] = useState(null);
    const [bot, setBot] = useState(null);
    const [tab, setTab] = useState("overview");
    async function load() {
        const bots = await api.listBots();
        const b = (bots || []).find((b) => b.id === botId);
        setBot(b);
        const chs = await api.listChannels(botId);
        setChannel((chs || []).find((c) => c.id === channelId) || null);
    }
    useEffect(() => { load(); }, [botId, channelId]);
    async function handleDelete() {
        if (!confirm("删除此渠道？"))
            return;
        await api.deleteChannel(botId, channelId);
        navigate(`/dashboard/bot/${botId}`);
    }
    async function handleToggle() {
        await api.updateChannel(botId, channelId, { enabled: !channel.enabled });
        load();
    }
    if (!channel || !bot)
        return _jsx("p", { className: "text-sm text-muted-foreground p-8", children: "\u52A0\u8F7D\u4E2D..." });
    const tabs = [
        { key: "overview", label: "概览" },
        { key: "connect", label: "接入" },
        { key: "webhook", label: "Webhook" },
        { key: "ai", label: "AI" },
        { key: "filter", label: "过滤" },
        { key: "logs", label: "Webhook 日志" },
        { key: "live", label: "监控" },
    ];
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-3 pb-4 border-b", children: [_jsx(Link, { to: `/dashboard/bot/${botId}`, className: "text-muted-foreground hover:text-foreground", children: _jsx(ArrowLeft, { className: "w-4 h-4" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h1", { className: "font-semibold text-base", children: channel.name }), channel.handle && _jsxs("span", { className: "text-xs text-muted-foreground font-mono bg-secondary px-1.5 py-0.5 rounded", children: ["@", channel.handle] })] }), _jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [bot.name, " \u00B7 \u6E20\u9053"] })] }), _jsx("button", { onClick: handleToggle, children: _jsx(Badge, { variant: channel.enabled ? "default" : "outline", children: channel.enabled ? "启用" : "停用" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: handleDelete, children: _jsx(Trash2, { className: "w-4 h-4 text-destructive" }) })] }), _jsx("div", { className: "flex border rounded-lg overflow-hidden w-fit mt-1", children: tabs.map((t) => (_jsx("button", { className: `px-3 py-1.5 text-xs cursor-pointer ${tab === t.key ? "bg-secondary font-medium" : "text-muted-foreground"}`, onClick: () => setTab(t.key), children: t.label }, t.key))) }), tab === "overview" && _jsx(OverviewTab, { channel: channel, botId: botId, onRefresh: load }), tab === "connect" && _jsx(ConnectTab, { channel: channel }), tab === "webhook" && _jsx(WebhookTab, { channel: channel, botId: botId, onRefresh: load }), tab === "ai" && _jsx(AITab, { channel: channel, botId: botId, onRefresh: load }), tab === "filter" && _jsx(FilterTab, { channel: channel, botId: botId, onRefresh: load }), tab === "logs" && _jsx(WebhookLogsTab, { channel: channel, botId: botId }), tab === "live" && _jsx(LiveTab, { channel: channel })] }));
}
// ==================== Overview ====================
function OverviewTab({ channel, botId, onRefresh }) {
    const [editingName, setEditingName] = useState(false);
    const [editingHandle, setEditingHandle] = useState(false);
    const [name, setName] = useState(channel.name);
    const [handle, setHandle] = useState(channel.handle || "");
    const [pluginInfo, setPluginInfo] = useState(null);
    useEffect(() => {
        if (channel.webhook_config?.plugin_id) {
            api.getPlugin(channel.webhook_config.plugin_id).then(setPluginInfo).catch(() => { });
        }
    }, [channel]);
    async function saveName() {
        await api.updateChannel(botId, channel.id, { name });
        setEditingName(false);
        onRefresh();
    }
    async function saveHandle() {
        await api.updateChannel(botId, channel.id, { handle });
        setEditingHandle(false);
        onRefresh();
    }
    const cards = [
        { label: "名称", value: editingName ? null : channel.name, action: () => setEditingName(true) },
        { label: "@提及", value: channel.handle || "（全部消息）", action: () => setEditingHandle(true) },
    ];
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3", children: [cards.map((c) => (_jsxs("div", { className: "p-3 rounded-lg border bg-card cursor-pointer hover:border-primary/50", onClick: c.action, children: [_jsx("p", { className: "text-[10px] text-muted-foreground", children: c.label }), _jsx("p", { className: "text-sm font-medium mt-0.5", children: c.value })] }, c.label))), _jsx(CopyCard, { label: "API Key", value: channel.api_key }), channel.ai_config?.enabled && (_jsxs("div", { className: "p-3 rounded-lg border bg-card", children: [_jsx("p", { className: "text-[10px] text-muted-foreground", children: "AI \u56DE\u590D" }), _jsxs("p", { className: "text-sm font-medium mt-0.5 flex items-center gap-1", children: [_jsx(Bot, { className: "w-3 h-3" }), " ", channel.ai_config.source === "builtin" ? "内置" : "自定义"] })] })), channel.webhook_config?.url && (_jsxs("div", { className: "p-3 rounded-lg border bg-card", children: [_jsx("p", { className: "text-[10px] text-muted-foreground", children: "Webhook" }), _jsx("p", { className: "text-sm font-mono mt-0.5 truncate", children: channel.webhook_config.url })] })), pluginInfo && (_jsxs("div", { className: "p-3 rounded-lg border bg-card", children: [_jsx("p", { className: "text-[10px] text-muted-foreground", children: "\u63D2\u4EF6" }), _jsxs("p", { className: "text-sm font-medium mt-0.5", children: [pluginInfo.icon, " ", pluginInfo.name, " v", pluginInfo.version] })] }))] }), editingName && (_jsxs("form", { onSubmit: (e) => { e.preventDefault(); saveName(); }, className: "flex gap-2 items-center", children: [_jsx(Input, { value: name, onChange: (e) => setName(e.target.value), className: "h-8 text-sm", autoFocus: true }), _jsx(Button, { size: "sm", type: "submit", children: "\u4FDD\u5B58" }), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => setEditingName(false), children: "\u53D6\u6D88" })] })), editingHandle && (_jsxs("form", { onSubmit: (e) => { e.preventDefault(); saveHandle(); }, className: "flex gap-2 items-center", children: [_jsx("span", { className: "text-sm", children: "@" }), _jsx(Input, { value: handle, onChange: (e) => setHandle(e.target.value), placeholder: "\u7559\u7A7A\u63A5\u6536\u5168\u90E8\u6D88\u606F", className: "h-8 text-sm w-40", autoFocus: true }), _jsx(Button, { size: "sm", type: "submit", children: "\u4FDD\u5B58" }), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => setEditingHandle(false), children: "\u53D6\u6D88" })] }))] }));
}
function CopyCard({ label, value }) {
    const [copied, setCopied] = useState(false);
    function copy() {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
    return (_jsxs("div", { className: "p-3 rounded-lg border bg-card cursor-pointer hover:border-primary/50", onClick: copy, children: [_jsxs("p", { className: "text-[10px] text-muted-foreground", children: [label, " ", copied && _jsx(Check, { className: "w-3 h-3 inline text-primary" })] }), _jsx("p", { className: "text-xs font-mono mt-0.5 truncate", children: value })] }));
}
// ==================== Connect ====================
function ConnectTab({ channel }) {
    const wsProto = location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProto}//${location.host}/api/v1/channels/connect?key=${channel.api_key}`;
    const httpBase = `${location.origin}/api/v1/channels`;
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(CopyField, { label: "WebSocket", value: wsUrl }), _jsx(CopyField, { label: "HTTP API", value: httpBase }), _jsx(CopyField, { label: "API Key", value: channel.api_key })] }), _jsxs("div", { className: "text-xs text-muted-foreground space-y-3 p-4 rounded-lg border bg-card", children: [_jsx("p", { className: "font-medium text-foreground", children: "\u63A5\u5165\u65B9\u5F0F" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-foreground mt-3 mb-1", children: "WebSocket \u8FDE\u63A5" }), _jsx("pre", { className: "bg-background p-2 rounded overflow-x-auto text-[10px]", children: `ws://${location.host}/api/v1/channels/connect?key=API_KEY` }), _jsx("p", { className: "mt-1", children: "\u8FDE\u63A5\u540E\u81EA\u52A8\u6536\u5230 init \u6D88\u606F\uFF0C\u6536\u5230\u65B0\u6D88\u606F\u65F6\u63A8\u9001 message \u4E8B\u4EF6\u3002" })] }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-foreground mt-3 mb-1", children: "HTTP API" }), _jsx("pre", { className: "bg-background p-2 rounded overflow-x-auto text-[10px]", children: `# 拉取消息
GET /api/v1/channels/messages?key=KEY&limit=50

# 发送消息
POST /api/v1/channels/send?key=KEY
{"text": "内容"}

# 渠道状态
GET /api/v1/channels/status?key=KEY` })] })] })] }));
}
function CopyField({ label, value }) {
    const [copied, setCopied] = useState(false);
    return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-xs text-muted-foreground w-16 shrink-0", children: label }), _jsx("code", { className: "flex-1 text-[10px] font-mono bg-card border rounded px-2 py-1 truncate select-all", children: value }), _jsx("button", { onClick: () => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); }, className: "cursor-pointer text-muted-foreground hover:text-foreground shrink-0", children: copied ? _jsx(Check, { className: "w-3 h-3 text-primary" }) : _jsx(Copy, { className: "w-3 h-3" }) })] }));
}
// ==================== Webhook ====================
function WebhookTab({ channel, botId, onRefresh }) {
    const cfg = channel.webhook_config || {};
    const [url, setUrl] = useState(cfg.url || "");
    const [authType, setAuthType] = useState(cfg.auth?.type || "");
    const [authToken, setAuthToken] = useState(cfg.auth?.token || "");
    const [authName, setAuthName] = useState(cfg.auth?.name || "");
    const [authValue, setAuthValue] = useState(cfg.auth?.value || cfg.auth?.secret || "");
    const [scriptMode, setScriptMode] = useState(cfg.plugin_id ? "plugin" : "manual");
    const [script, setScript] = useState(cfg.script || "");
    const [pluginId, setPluginId] = useState(cfg.plugin_id || "");
    const [pluginInfo, setPluginInfo] = useState(null);
    const [plugins, setPlugins] = useState([]);
    const [showPicker, setShowPicker] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    useEffect(() => {
        if (pluginId)
            api.getPlugin(pluginId).then(setPluginInfo).catch(() => setPluginInfo(null));
    }, [pluginId]);
    useEffect(() => {
        if (showPicker)
            api.listPlugins().then((l) => setPlugins(l || [])).catch(() => { });
    }, [showPicker]);
    async function handleSave() {
        setSaving(true);
        setError("");
        try {
            let auth = null;
            if (authType === "bearer" && authToken)
                auth = { type: "bearer", token: authToken };
            else if (authType === "header" && authName)
                auth = { type: "header", name: authName, value: authValue };
            else if (authType === "hmac" && authValue)
                auth = { type: "hmac", secret: authValue };
            await api.updateChannel(botId, channel.id, {
                webhook_config: {
                    url, auth,
                    plugin_id: scriptMode === "plugin" ? pluginId : undefined,
                    script: scriptMode === "manual" ? (script || undefined) : undefined,
                },
            });
            onRefresh();
        }
        catch (err) {
            setError(err.message);
        }
        setSaving(false);
    }
    async function installPlugin(id) {
        try {
            const r = await api.installPluginToChannel(id, botId, channel.id);
            setPluginId(r.plugin_id);
            setScriptMode("plugin");
            setScript("");
            setShowPicker(false);
            onRefresh();
        }
        catch (err) {
            setError(err.message);
        }
    }
    return (_jsxs("div", { className: "space-y-3", children: [_jsx(Input, { placeholder: "https://your-server.com/webhook", value: url, onChange: (e) => setUrl(e.target.value), className: "h-8 text-xs font-mono" }), _jsxs("div", { children: [_jsx("p", { className: "text-[10px] text-muted-foreground mb-1", children: "\u8BA4\u8BC1\u65B9\u5F0F" }), _jsx("div", { className: "flex gap-1", children: ["", "bearer", "header", "hmac"].map((t) => (_jsx("button", { onClick: () => setAuthType(t), className: `px-2 py-0.5 text-[10px] rounded cursor-pointer ${authType === t ? "bg-primary text-primary-foreground" : "bg-secondary"}`, children: t || "无" }, t))) })] }), authType === "bearer" && _jsx(Input, { placeholder: "Token", value: authToken, onChange: (e) => setAuthToken(e.target.value), className: "h-7 text-[11px] font-mono" }), authType === "header" && (_jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { placeholder: "Header \u540D", value: authName, onChange: (e) => setAuthName(e.target.value), className: "h-7 text-[11px] font-mono" }), _jsx(Input, { placeholder: "Header \u503C", value: authValue, onChange: (e) => setAuthValue(e.target.value), className: "h-7 text-[11px] font-mono" })] })), authType === "hmac" && _jsx(Input, { placeholder: "HMAC Secret", value: authValue, onChange: (e) => setAuthValue(e.target.value), className: "h-7 text-[11px] font-mono" }), _jsxs("div", { children: [_jsx("p", { className: "text-[10px] text-muted-foreground mb-1", children: "\u811A\u672C\u6765\u6E90" }), _jsxs("div", { className: "flex gap-1", children: [_jsx("button", { onClick: () => setScriptMode("plugin"), className: `px-2 py-0.5 text-[10px] rounded cursor-pointer ${scriptMode === "plugin" ? "bg-primary text-primary-foreground" : "bg-secondary"}`, children: "\u63D2\u4EF6\u5E02\u573A" }), _jsx("button", { onClick: () => setScriptMode("manual"), className: `px-2 py-0.5 text-[10px] rounded cursor-pointer ${scriptMode === "manual" ? "bg-primary text-primary-foreground" : "bg-secondary"}`, children: "\u624B\u52A8\u811A\u672C" })] })] }), scriptMode === "plugin" && (_jsxs("div", { className: "space-y-2", children: [pluginInfo ? (_jsxs("div", { className: "rounded-lg border bg-card overflow-hidden", children: [_jsxs("div", { className: "p-3 space-y-1.5", children: [_jsx("div", { className: "flex items-start justify-between", children: _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [pluginInfo.icon && _jsx("span", { className: "text-base", children: pluginInfo.icon }), _jsx("span", { className: "text-xs font-medium", children: pluginInfo.name }), _jsxs("span", { className: "text-[10px] text-muted-foreground", children: ["v", pluginInfo.version] }), pluginInfo.license && _jsx("span", { className: "text-[10px] text-muted-foreground", children: pluginInfo.license })] }), _jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5", children: pluginInfo.description }), _jsxs("div", { className: "flex items-center gap-2 mt-1 text-[10px] text-muted-foreground", children: [_jsxs("span", { children: ["by ", pluginInfo.author || "anonymous"] }), _jsxs("span", { children: [pluginInfo.install_count, " \u5B89\u88C5"] }), pluginInfo.namespace && _jsx("span", { className: "font-mono", children: pluginInfo.namespace })] })] }) }), _jsxs("div", { className: "flex items-center gap-2 text-[10px] text-muted-foreground", children: [_jsxs("span", { children: ["@grant: ", pluginInfo.grant_perms || "none"] }), _jsxs("span", { children: ["@match: ", pluginInfo.match_types || "*"] }), pluginInfo.connect_domains && pluginInfo.connect_domains !== "*" && _jsxs("span", { children: ["@connect: ", pluginInfo.connect_domains] })] }), pluginInfo.changelog && _jsxs("p", { className: "text-[10px] text-muted-foreground", children: ["\u66F4\u65B0: ", pluginInfo.changelog] })] }), _jsxs("div", { className: "border-t px-3 py-1.5 flex items-center gap-2", children: [_jsx("a", { href: `/dashboard/webhook-plugins/debug?plugin=${pluginId}`, className: "text-[10px] text-primary hover:underline", children: "\u8C03\u8BD5" }), pluginInfo.github_url && _jsx("a", { href: pluginInfo.github_url, target: "_blank", rel: "noopener", className: "text-[10px] text-primary hover:underline", children: "GitHub" }), _jsxs("div", { className: "ml-auto flex gap-1", children: [_jsx(Button, { variant: "ghost", size: "sm", className: "h-6 text-[10px]", onClick: () => setShowPicker(true), children: "\u66F4\u6362" }), _jsx(Button, { variant: "ghost", size: "sm", className: "h-6 text-[10px] text-destructive", onClick: () => { setPluginId(""); setPluginInfo(null); setScriptMode("manual"); }, children: "\u5378\u8F7D" })] })] })] })) : (_jsxs(Button, { variant: "outline", size: "sm", className: "w-full text-xs h-7", onClick: () => setShowPicker(true), children: [_jsx(Puzzle, { className: "w-3 h-3 mr-1" }), " \u9009\u62E9\u63D2\u4EF6"] })), showPicker && (_jsxs("div", { className: "border rounded p-2 space-y-1 max-h-48 overflow-y-auto bg-card", children: [plugins.length === 0 && _jsx("p", { className: "text-[10px] text-muted-foreground text-center py-2", children: "\u6682\u65E0\u53EF\u7528\u63D2\u4EF6" }), plugins.map((p) => (_jsxs("button", { onClick: () => installPlugin(p.id), className: "w-full text-left p-1.5 rounded hover:bg-secondary cursor-pointer text-xs flex items-center justify-between", children: [_jsxs("span", { children: [p.icon, " ", p.name, " ", _jsxs("span", { className: "text-muted-foreground", children: ["v", p.version] })] }), _jsxs("span", { className: "text-[10px] text-muted-foreground", children: [p.install_count, " \u5B89\u88C5"] })] }, p.id))), _jsx("button", { onClick: () => setShowPicker(false), className: "w-full text-center text-[10px] text-muted-foreground hover:text-primary cursor-pointer py-1", children: "\u53D6\u6D88" })] }))] })), scriptMode === "manual" && (_jsx("textarea", { placeholder: `JS 中间件（可选）\nfunction onRequest(ctx) { ... }`, value: script, onChange: (e) => setScript(e.target.value), rows: 6, className: "w-full rounded-md border border-input bg-transparent px-3 py-2 text-[11px] font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring resize-none" })), _jsxs("div", { className: "flex items-center justify-between", children: [error && _jsx("span", { className: "text-[10px] text-destructive", children: error }), _jsx("div", { className: "ml-auto", children: _jsx(Button, { size: "sm", onClick: handleSave, disabled: saving, children: saving ? "..." : "保存" }) })] })] }));
}
// ==================== AI ====================
function AITab({ channel, botId, onRefresh }) {
    const cfg = channel.ai_config || {};
    const [enabled, setEnabled] = useState(cfg.enabled || false);
    const [source, setSource] = useState(cfg.source || "builtin");
    const [baseUrl, setBaseUrl] = useState(cfg.base_url || "");
    const [apiKey, setApiKey] = useState("");
    const [model, setModel] = useState(cfg.model || "");
    const [systemPrompt, setSystemPrompt] = useState(cfg.system_prompt || "");
    const [maxHistory, setMaxHistory] = useState(cfg.max_history || 20);
    const [saving, setSaving] = useState(false);
    async function handleSave() {
        setSaving(true);
        try {
            await api.updateChannel(botId, channel.id, {
                ai_config: { enabled, source, base_url: baseUrl, api_key: apiKey || undefined, model, system_prompt: systemPrompt, max_history: maxHistory },
            });
            onRefresh();
        }
        catch { }
        setSaving(false);
    }
    return (_jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: enabled, onChange: (e) => setEnabled(e.target.checked), className: "w-3.5 h-3.5 accent-primary" }), _jsx("span", { className: "text-sm", children: "\u542F\u7528 AI \u81EA\u52A8\u56DE\u590D" })] }), enabled && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex gap-1", children: [_jsx("button", { onClick: () => setSource("builtin"), className: `px-2 py-0.5 text-[10px] rounded cursor-pointer ${source === "builtin" ? "bg-primary text-primary-foreground" : "bg-secondary"}`, children: "\u5185\u7F6E\uFF08\u5168\u5C40\u914D\u7F6E\uFF09" }), _jsx("button", { onClick: () => setSource("custom"), className: `px-2 py-0.5 text-[10px] rounded cursor-pointer ${source === "custom" ? "bg-primary text-primary-foreground" : "bg-secondary"}`, children: "\u81EA\u5B9A\u4E49" })] }), source === "custom" && (_jsxs("div", { className: "space-y-2", children: [_jsx(Input, { placeholder: "https://api.openai.com/v1", value: baseUrl, onChange: (e) => setBaseUrl(e.target.value), className: "h-7 text-[11px] font-mono" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { type: "password", placeholder: "API Key", value: apiKey, onChange: (e) => setApiKey(e.target.value), className: "h-7 text-[11px] font-mono" }), _jsx(Input, { placeholder: "\u6A21\u578B\u540D\u79F0", value: model, onChange: (e) => setModel(e.target.value), className: "h-7 text-[11px] font-mono w-40" })] })] })), _jsx("textarea", { placeholder: "\u7CFB\u7EDF\u63D0\u793A\u8BCD\uFF08System Prompt\uFF09", value: systemPrompt, onChange: (e) => setSystemPrompt(e.target.value), rows: 3, className: "w-full rounded-md border border-input bg-transparent px-3 py-2 text-[11px] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring resize-none" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("label", { className: "text-[10px] text-muted-foreground", children: "\u4E0A\u4E0B\u6587\u6D88\u606F\u6570" }), _jsx(Input, { type: "number", value: maxHistory, onChange: (e) => setMaxHistory(parseInt(e.target.value) || 20), className: "h-7 text-xs w-20", min: 1, max: 100 })] })] })), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { size: "sm", onClick: handleSave, disabled: saving, children: saving ? "..." : "保存" }) })] }));
}
// ==================== Filter ====================
function FilterTab({ channel, botId, onRefresh }) {
    const rule = channel.filter_rule || {};
    const [userIds, setUserIds] = useState((rule.user_ids || []).join(", "));
    const [keywords, setKeywords] = useState((rule.keywords || []).join(", "));
    const [msgTypes, setMsgTypes] = useState((rule.message_types || []).join(", "));
    const [saving, setSaving] = useState(false);
    async function handleSave() {
        setSaving(true);
        const parse = (s) => s.split(",").map((v) => v.trim()).filter(Boolean);
        try {
            await api.updateChannel(botId, channel.id, {
                filter_rule: {
                    user_ids: parse(userIds),
                    keywords: parse(keywords),
                    message_types: parse(msgTypes),
                },
            });
            onRefresh();
        }
        catch { }
        setSaving(false);
    }
    return (_jsxs("div", { className: "space-y-3", children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "\u7559\u7A7A\u8868\u793A\u4E0D\u8FC7\u6EE4\uFF08\u63A5\u6536\u6240\u6709\u6D88\u606F\uFF09\u3002\u591A\u4E2A\u503C\u7528\u9017\u53F7\u5206\u9694\u3002" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { children: [_jsx("label", { className: "text-[10px] text-muted-foreground", children: "\u7528\u6237 ID \u767D\u540D\u5355" }), _jsx(Input, { value: userIds, onChange: (e) => setUserIds(e.target.value), placeholder: "user1@wx, user2@wx", className: "h-7 text-[11px] font-mono" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-[10px] text-muted-foreground", children: "\u5173\u952E\u8BCD\u5339\u914D" }), _jsx(Input, { value: keywords, onChange: (e) => setKeywords(e.target.value), placeholder: "help, urgent", className: "h-7 text-[11px] font-mono" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-[10px] text-muted-foreground", children: "\u6D88\u606F\u7C7B\u578B" }), _jsx(Input, { value: msgTypes, onChange: (e) => setMsgTypes(e.target.value), placeholder: "text, image, voice, video, file", className: "h-7 text-[11px] font-mono" })] })] }), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { size: "sm", onClick: handleSave, disabled: saving, children: saving ? "..." : "保存" }) })] }));
}
// ==================== Live ====================
function LiveTab({ channel }) {
    const wsProto = location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProto}//${location.host}/api/v1/channels/connect?key=${channel.api_key}`;
    const [status, setStatus] = useState("connecting");
    const [logs, setLogs] = useState([]);
    useEffect(() => {
        const ws = new WebSocket(wsUrl);
        ws.onopen = () => setStatus("connected");
        ws.onclose = () => setStatus("disconnected");
        ws.onmessage = (e) => {
            const now = new Date().toLocaleTimeString();
            try {
                const msg = JSON.parse(e.data);
                setLogs((prev) => [...prev.slice(-99), { time: now, type: msg.type, data: JSON.stringify(msg.data, null, 2) }]);
            }
            catch {
                setLogs((prev) => [...prev.slice(-99), { time: now, type: "raw", data: e.data }]);
            }
        };
        return () => ws.close();
    }, [wsUrl]);
    return (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Radio, { className: `w-3 h-3 ${status === "connected" ? "text-primary" : "text-muted-foreground"}` }), _jsx("span", { className: "text-xs", children: status === "connected" ? "已连接" : status === "connecting" ? "连接中..." : "已断开" }), logs.length > 0 && (_jsx("button", { onClick: () => setLogs([]), className: "text-[10px] text-muted-foreground hover:text-primary cursor-pointer ml-auto", children: "\u6E05\u7A7A" }))] }), _jsxs("div", { className: "border rounded-lg bg-card p-2 max-h-96 overflow-y-auto space-y-1", children: [logs.length === 0 && _jsx("p", { className: "text-[10px] text-muted-foreground text-center py-4", children: "\u7B49\u5F85\u6D88\u606F..." }), logs.map((log, i) => (_jsxs("div", { className: "text-[10px] font-mono", children: [_jsx("span", { className: "text-muted-foreground", children: log.time }), " ", _jsx("span", { className: "text-primary", children: log.type }), _jsx("pre", { className: "text-muted-foreground whitespace-pre-wrap ml-4", children: log.data })] }, i)))] })] }));
}
// ==================== Webhook Logs ====================
function WebhookLogsTab({ channel, botId }) {
    const [logs, setLogs] = useState([]);
    const [expanded, setExpanded] = useState(null);
    async function load() {
        try {
            setLogs(await api.webhookLogs(botId, channel.id, 50) || []);
        }
        catch { }
    }
    useEffect(() => { load(); const t = setInterval(load, 5000); return () => clearInterval(t); }, [botId, channel.id]);
    const statusIcons = {
        pending: { icon: "⏳", color: "text-muted-foreground" },
        requesting: { icon: "→", color: "text-yellow-500" },
        success: { icon: "✓", color: "text-primary" },
        failed: { icon: "✕", color: "text-destructive" },
        skipped: { icon: "⚠", color: "text-yellow-500" },
        error: { icon: "✕", color: "text-destructive" },
    };
    return (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("p", { className: "text-xs text-muted-foreground", children: [logs.length, " \u6761\u65E5\u5FD7\uFF08\u81EA\u52A8\u5237\u65B0\uFF09"] }), _jsx("button", { onClick: load, className: "text-[10px] text-primary hover:underline cursor-pointer", children: "\u5237\u65B0" })] }), logs.length === 0 && _jsx("p", { className: "text-sm text-muted-foreground text-center py-8", children: "\u6682\u65E0 Webhook \u65E5\u5FD7" }), _jsx("div", { className: "space-y-1", children: logs.map((log) => {
                    const s = statusIcons[log.status] || statusIcons.pending;
                    const isOpen = expanded === log.id;
                    return (_jsxs("div", { className: "rounded-lg border bg-card overflow-hidden", children: [_jsxs("button", { onClick: () => setExpanded(isOpen ? null : log.id), className: "w-full flex items-center gap-3 px-3 py-2 text-left cursor-pointer hover:bg-secondary/30", children: [_jsx("span", { className: `text-sm ${s.color}`, children: s.icon }), _jsx("span", { className: `text-xs font-mono ${s.color}`, children: log.status === "success" || log.status === "failed" ? log.response_status : log.status }), _jsxs("span", { className: "text-xs text-muted-foreground truncate flex-1", children: [log.request_method, " ", log.request_url || "—"] }), log.duration_ms > 0 && _jsxs("span", { className: "text-[10px] text-muted-foreground", children: [log.duration_ms, "ms"] }), _jsx("span", { className: "text-[10px] text-muted-foreground", children: new Date(log.created_at * 1000).toLocaleTimeString() })] }), isOpen && (_jsxs("div", { className: "border-t px-3 py-2 space-y-2 text-[10px]", children: [log.plugin_id && _jsxs("p", { className: "text-muted-foreground", children: ["\u63D2\u4EF6: ", log.plugin_id] }), log.request_body && (_jsxs("div", { children: [_jsx("p", { className: "font-medium mb-0.5", children: "\u8BF7\u6C42" }), _jsx("pre", { className: "font-mono bg-background rounded p-2 overflow-x-auto max-h-32 overflow-y-auto whitespace-pre-wrap", children: tryFormat(log.request_body) })] })), log.response_body && (_jsxs("div", { children: [_jsxs("p", { className: "font-medium mb-0.5", children: ["\u54CD\u5E94 (", log.response_status, ")"] }), _jsx("pre", { className: "font-mono bg-background rounded p-2 overflow-x-auto max-h-32 overflow-y-auto whitespace-pre-wrap", children: tryFormat(log.response_body) })] })), log.script_error && (_jsxs("p", { className: "text-destructive", children: ["\u9519\u8BEF: ", log.script_error] })), log.replies && JSON.parse(log.replies || "[]").length > 0 && (_jsxs("div", { children: [_jsx("p", { className: "font-medium mb-0.5", children: "reply()" }), JSON.parse(log.replies).map((r, i) => (_jsx("p", { className: "font-mono text-primary", children: r }, i)))] }))] }))] }, log.id));
                }) })] }));
}
function tryFormat(s) {
    try {
        return JSON.stringify(JSON.parse(s), null, 2);
    }
    catch {
        return s;
    }
}
