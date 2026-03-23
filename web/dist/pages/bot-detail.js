import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Cable, Copy, Check, Plus, Trash2, RotateCw, Radio, X, Bot, Webhook, Paperclip, QrCode, Puzzle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { api } from "../lib/api";
function getMediaUrl(m, index) {
    const key = m.media_keys?.[String(index)];
    if (key)
        return `/api/v1/media/${key}`;
    return null;
}
function getSilkUrl(m, index) {
    const key = m.media_keys?.[`${index}_silk`];
    if (key)
        return `/api/v1/media/${key}`;
    return null;
}
function getItemMediaType(item) {
    return item.type || "text";
}
function ItemContent({ item, m, index }) {
    const mediaType = getItemMediaType(item);
    const url = getMediaUrl(m, index);
    if (mediaType === "image" && url) {
        return _jsx("img", { src: url, alt: "image", className: "max-w-full rounded-lg max-h-48 cursor-pointer", onClick: () => window.open(url) });
    }
    if (mediaType === "video" && url) {
        return _jsx("video", { src: url, controls: true, className: "max-w-full rounded-lg max-h-48" });
    }
    if (mediaType === "voice" && url) {
        const silkUrl = getSilkUrl(m, index);
        return (_jsxs("div", { className: "space-y-1", children: [_jsx("audio", { src: url, controls: true, className: "h-8" }), item.text && item.text !== "[voice]" && _jsx("p", { className: "text-xs opacity-70", children: item.text }), _jsxs("div", { className: "flex gap-2 text-[10px]", children: [_jsx("a", { href: url, download: true, className: "text-muted-foreground hover:text-primary", children: "WAV" }), silkUrl && _jsx("a", { href: silkUrl, download: true, className: "text-muted-foreground hover:text-primary", children: "SILK" })] })] }));
    }
    if (mediaType === "file" && url) {
        return (_jsxs("a", { href: url, target: "_blank", rel: "noopener", className: "flex items-center gap-2 underline text-xs", children: ["\uD83D\uDCCE ", item.file_name || item.text || "下载文件"] }));
    }
    if (item.text)
        return _jsx(_Fragment, { children: item.text });
    if (mediaType !== "text")
        return _jsxs("span", { className: "text-muted-foreground", children: ["[", mediaType, "]"] });
    return null;
}
function MessageContent({ m }) {
    // Media downloading/failed status (applies to entire message)
    if (m.media_status === "downloading") {
        const firstMedia = (m.item_list || []).find((i) => i.type !== "text");
        const t = firstMedia?.type || "file";
        return (_jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [_jsx("span", { className: "animate-pulse", children: "\u23F3" }), t === "image" ? "图片下载中..." : t === "video" ? "视频下载中..." : t === "voice" ? "语音下载中..." : "文件下载中..."] }));
    }
    if (m.media_status === "failed") {
        return (_jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex items-center gap-2 text-xs", children: [_jsx("span", { className: "text-destructive", children: "\u4E0B\u8F7D\u5931\u8D25" }), _jsx("button", { className: "text-primary hover:underline cursor-pointer", onClick: async (e) => {
                                e.stopPropagation();
                                try {
                                    await fetch(`/api/bots/${m.bot_id}/messages/${m.id}/retry_media`, {
                                        method: "POST", credentials: "same-origin",
                                    });
                                }
                                catch { }
                            }, children: "\u91CD\u8BD5" })] }), _jsx("p", { className: "text-[10px] text-muted-foreground", children: "CDN \u94FE\u63A5\u53EF\u80FD\u5DF2\u8FC7\u671F\uFF0C\u9700\u8981\u5BF9\u65B9\u91CD\u65B0\u53D1\u9001" })] }));
    }
    // Optimistic preview for sending media
    if (m._preview_url && m._sending) {
        const t = (m.item_list || [])[0]?.type || "file";
        if (t === "image")
            return _jsx("img", { src: m._preview_url, alt: "preview", className: "max-w-full rounded-lg max-h-48 opacity-60" });
        if (t === "video")
            return _jsx("video", { src: m._preview_url, className: "max-w-full rounded-lg max-h-48 opacity-60" });
    }
    const items = m.item_list || [];
    if (items.length === 0)
        return _jsx("span", { className: "text-muted-foreground", children: "[\u7A7A\u6D88\u606F]" });
    return (_jsx("div", { className: "space-y-1", children: items.map((item, i) => (_jsx(ItemContent, { item: item, m: m, index: i }, i))) }));
}
export function BotDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bot, setBot] = useState(null);
    const [channels, setChannels] = useState([]);
    const [tab, setTab] = useState("chat");
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState("");
    const [pendingFile, setPendingFile] = useState(null);
    const [pendingPreview, setPendingPreview] = useState(null);
    const [showRebind, setShowRebind] = useState(false);
    const [nextCursor, setNextCursor] = useState("");
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const bottomRef = useRef(null);
    const scrollRef = useRef(null);
    async function loadBot() {
        const bots = await api.listBots();
        setBot((bots || []).find((b) => b.id === id) || null);
    }
    async function loadChannels() {
        if (!id)
            return;
        const all = await api.listChannels(id);
        setChannels(all || []);
    }
    async function loadMessages() {
        if (!id)
            return;
        const res = await api.messages(id, 30);
        setMessages((res.messages || []).reverse());
        setNextCursor(res.next_cursor || "");
        setHasMore(res.has_more);
    }
    async function loadOlder() {
        if (!id || !nextCursor || loadingMore)
            return;
        setLoadingMore(true);
        const scrollEl = scrollRef.current;
        const prevHeight = scrollEl?.scrollHeight || 0;
        try {
            const res = await api.messages(id, 30, nextCursor);
            const older = (res.messages || []).reverse();
            setMessages((prev) => [...older, ...prev]);
            setNextCursor(res.next_cursor || "");
            setHasMore(res.has_more);
            // Restore scroll position after prepending
            requestAnimationFrame(() => {
                if (scrollEl)
                    scrollEl.scrollTop = scrollEl.scrollHeight - prevHeight;
            });
        }
        finally {
            setLoadingMore(false);
        }
    }
    useEffect(() => { loadBot(); loadChannels(); loadMessages(); }, [id]);
    useEffect(() => {
        requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }));
    }, [messages.length]);
    useEffect(() => {
        // Poll for new messages only (don't reload all)
        const t = setInterval(async () => {
            if (!id)
                return;
            const res = await api.messages(id, 30);
            const fresh = (res.messages || []).reverse();
            setMessages((prev) => {
                // Merge: keep optimistic (negative ids, still sending), replace rest with fresh
                const optimistic = prev.filter((m) => m.id < 0);
                return [...fresh, ...optimistic];
            });
        }, 5000);
        return () => clearInterval(t);
    }, [id]);
    async function handleSend(e) {
        e.preventDefault();
        if (pendingFile) {
            await confirmFileSend();
            return;
        }
        if (!input.trim() || !id)
            return;
        const optId = -Date.now();
        setMessages((prev) => [...prev, {
                id: optId, direction: "outbound", from_user_id: "", to_user_id: "",
                message_type: 2, item_list: [{ type: "text", text: input }],
                created_at: Date.now() / 1000, _sending: true,
            }]);
        const text = input;
        setInput("");
        const err = await doSend({ text });
        setMessages((prev) => prev.map((m) => m.id === optId
            ? { ...m, _sending: false, _error: err || undefined }
            : m));
    }
    function handleFileSelect(e) {
        const file = e.target.files?.[0];
        if (!file)
            return;
        e.target.value = "";
        setPendingFile(file);
        if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
            setPendingPreview(URL.createObjectURL(file));
        }
        else {
            setPendingPreview(null);
        }
    }
    function cancelFile() {
        if (pendingPreview)
            URL.revokeObjectURL(pendingPreview);
        setPendingFile(null);
        setPendingPreview(null);
    }
    async function confirmFileSend() {
        if (!pendingFile || !id)
            return;
        const file = pendingFile;
        const preview = pendingPreview;
        const caption = input.trim();
        const optId = -Date.now();
        const mediaType = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "file";
        setMessages((prev) => [...prev, {
                id: optId, direction: "outbound", from_user_id: "", to_user_id: "",
                message_type: 2,
                item_list: [{ type: mediaType, text: caption || file.name, file_name: file.name }],
                created_at: Date.now() / 1000,
                _sending: true, _preview_url: preview || undefined,
            }]);
        const form = new FormData();
        form.append("file", file);
        if (caption)
            form.append("text", caption);
        setInput("");
        setPendingFile(null);
        setPendingPreview(null);
        const err = await doSend(form);
        setMessages((prev) => prev.map((m) => m.id === optId
            ? { ...m, _sending: false, _error: err || undefined }
            : m));
    }
    async function retrySend(m) {
        const optId = m.id;
        setMessages((prev) => prev.map((msg) => msg.id === optId
            ? { ...msg, _sending: true, _error: undefined }
            : msg));
        const textItem = (m.item_list || []).find((i) => i.text);
        const err = await doSend({ text: textItem?.text || "" });
        setMessages((prev) => prev.map((msg) => msg.id === optId
            ? { ...msg, _sending: false, _error: err || undefined }
            : msg));
    }
    async function doSend(body) {
        setSending(true);
        setSendError("");
        try {
            const isForm = body instanceof FormData;
            const res = await fetch("/api/bots/" + id + "/send", {
                method: "POST",
                credentials: "same-origin",
                ...(isForm ? { body } : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
            });
            const data = await res.json();
            if (!res.ok) {
                const msg = data.error || "";
                if (msg.includes("context token"))
                    return "请先从微信给 Bot 发一条消息";
                if (msg.includes("session expired")) {
                    setShowRebind(true);
                    return "会话已过期";
                }
                if (msg.includes("not connected"))
                    return "Bot 未连接，请尝试重连";
                return msg || "发送失败";
            }
            setTimeout(loadMessages, 500);
            return null;
        }
        catch (e) {
            return "网络错误: " + (e?.message || "请求失败");
        }
        finally {
            setSending(false);
        }
    }
    if (!bot)
        return _jsx("p", { className: "text-sm text-muted-foreground p-8", children: "\u52A0\u8F7D\u4E2D..." });
    return (_jsxs("div", { className: "flex flex-col h-[calc(100vh-64px)]", children: [_jsxs("div", { className: "flex items-center gap-3 pb-4 border-b shrink-0", children: [_jsx(Link, { to: "/dashboard", className: "text-muted-foreground hover:text-foreground", children: _jsx(ArrowLeft, { className: "w-4 h-4" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h1", { className: "font-semibold text-base", children: bot.name }), _jsx("p", { className: "text-xs text-muted-foreground font-mono truncate", children: bot.extra?.bot_id })] }), _jsx(Badge, { variant: bot.status === "connected" ? "default" : bot.status === "session_expired" ? "destructive" : "outline", children: bot.status === "session_expired" ? "已过期" : bot.status }), bot.status === "session_expired" && (_jsxs(Button, { variant: "outline", size: "sm", className: "text-xs h-7", onClick: () => navigate("/dashboard"), children: [_jsx(QrCode, { className: "w-3.5 h-3.5 mr-1" }), " \u91CD\u65B0\u7ED1\u5B9A"] }))] }), _jsxs("div", { className: "flex border rounded-lg overflow-hidden w-fit mt-3", children: [_jsx("button", { className: `px-3 py-1.5 text-xs cursor-pointer ${tab === "chat" ? "bg-secondary font-medium" : "text-muted-foreground"}`, onClick: () => setTab("chat"), children: "\u6D88\u606F" }), _jsx("button", { className: `px-3 py-1.5 text-xs cursor-pointer ${tab === "channels" ? "bg-secondary font-medium" : "text-muted-foreground"}`, onClick: () => setTab("channels"), children: "\u901A\u9053" }), _jsx("button", { className: `px-3 py-1.5 text-xs cursor-pointer ${tab === "settings" ? "bg-secondary font-medium" : "text-muted-foreground"}`, onClick: () => setTab("settings"), children: "\u8BBE\u7F6E" })] }), showRebind && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50", onClick: () => setShowRebind(false), children: _jsxs("div", { className: "bg-background border rounded-xl p-6 max-w-sm mx-4 space-y-4", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center gap-2 text-destructive", children: [_jsx(QrCode, { className: "w-5 h-5" }), _jsx("h3", { className: "font-semibold text-sm", children: "\u4F1A\u8BDD\u5DF2\u8FC7\u671F" })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Bot \u7684\u5FAE\u4FE1\u767B\u5F55\u4F1A\u8BDD\u5DF2\u8FC7\u671F\uFF0C\u9700\u8981\u91CD\u65B0\u626B\u7801\u7ED1\u5B9A\u3002\u91CD\u65B0\u7ED1\u5B9A\u540E\uFF0C\u73B0\u6709\u901A\u9053\u548C\u914D\u7F6E\u5C06\u81EA\u52A8\u4FDD\u7559\u3002" }), _jsxs("div", { className: "flex gap-2 justify-end", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => setShowRebind(false), children: "\u7A0D\u540E" }), _jsx(Button, { size: "sm", onClick: () => navigate("/dashboard"), children: "\u53BB\u91CD\u65B0\u7ED1\u5B9A" })] })] }) })), tab === "chat" ? (_jsxs("div", { className: "flex-1 flex flex-col overflow-hidden mt-3 rounded-xl border", children: [_jsxs("div", { ref: scrollRef, className: "flex-1 overflow-y-auto px-4 py-3 space-y-2", children: [hasMore && (_jsx("div", { className: "text-center py-2", children: _jsx("button", { onClick: loadOlder, disabled: loadingMore, className: "text-xs text-muted-foreground hover:text-primary cursor-pointer", children: loadingMore ? "加载中..." : "加载更早消息" }) })), messages.map((m) => {
                                const isIn = m.direction === "inbound";
                                return (_jsx("div", { className: `flex ${isIn ? "justify-start" : "justify-end"}`, children: _jsxs("div", { className: `max-w-[75%] px-3 py-2 rounded-xl text-sm ${isIn ? "bg-secondary rounded-bl-sm" : "bg-primary text-primary-foreground rounded-br-sm"} ${m._sending ? "opacity-60" : ""}`, children: [_jsx(MessageContent, { m: m }), _jsx("div", { className: `text-[10px] mt-1 ${isIn ? "text-muted-foreground" : "opacity-50"}`, children: m._sending ? "发送中..." : m._error ? (_jsxs("span", { className: "text-destructive", children: [m._error, _jsx("button", { className: "ml-2 underline cursor-pointer", onClick: (e) => { e.stopPropagation(); retrySend(m); }, children: "\u91CD\u8BD5" })] })) : new Date(m.created_at * 1000).toLocaleTimeString() })] }) }, m.id));
                            }), messages.length === 0 && (_jsx("p", { className: "text-center text-xs text-muted-foreground py-12", children: "\u6682\u65E0\u6D88\u606F" })), _jsx("div", { ref: bottomRef })] }), pendingFile && (_jsxs("div", { className: "px-4 py-2 border-t bg-secondary/50 flex items-center gap-3", children: [pendingPreview && pendingFile?.type.startsWith("image/") ? (_jsx("img", { src: pendingPreview, alt: "preview", className: "h-16 rounded" })) : pendingPreview && pendingFile?.type.startsWith("video/") ? (_jsx("video", { src: pendingPreview, className: "h-16 rounded" })) : (_jsx("div", { className: "h-16 w-16 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground", children: pendingFile.name.split('.').pop()?.toUpperCase() })), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-xs truncate", children: pendingFile.name }), _jsxs("p", { className: "text-[10px] text-muted-foreground", children: [(pendingFile.size / 1024).toFixed(1), " KB"] })] }), _jsx(Button, { size: "sm", className: "h-7", onClick: confirmFileSend, disabled: sending, children: "\u53D1\u9001" }), _jsx(Button, { size: "sm", variant: "ghost", className: "h-7", onClick: cancelFile, children: "\u53D6\u6D88" })] })), _jsxs("form", { onSubmit: handleSend, className: "flex gap-2 p-3 border-t shrink-0", children: [_jsxs("label", { className: "cursor-pointer text-muted-foreground hover:text-foreground flex items-center", children: [_jsx(Paperclip, { className: "w-4 h-4" }), _jsx("input", { type: "file", className: "hidden", onChange: handleFileSelect, disabled: sending })] }), _jsx(Input, { value: input, onChange: (e) => { setInput(e.target.value); setSendError(""); }, placeholder: pendingFile ? "添加说明（可选）..." : "输入消息...", className: "h-9 text-sm flex-1" }), _jsx(Button, { type: "submit", size: "sm", disabled: sending || (!input.trim() && !pendingFile), children: _jsx(Send, { className: "w-4 h-4" }) })] })] })) : tab === "channels" ? (_jsx(ChannelsTab, { botId: id, channels: channels, onRefresh: loadChannels })) : (_jsx(BotSettingsTab, { bot: bot, onUpdate: loadBot }))] }));
}
function ChannelsTab({ botId, channels, onRefresh }) {
    const [creating, setCreating] = useState(false);
    const [name, setName] = useState("");
    const [handle, setHandle] = useState("");
    const [showDocs, setShowDocs] = useState(false);
    async function handleCreate(e) {
        e.preventDefault();
        if (!name)
            return;
        await api.createChannel(botId, name, handle);
        setName("");
        setHandle("");
        setCreating(false);
        onRefresh();
    }
    return (_jsxs("div", { className: "space-y-3 mt-4", children: [channels.map((ch) => _jsx(ChannelCard, { botId: botId, channel: ch, onRefresh: onRefresh }, ch.id)), creating ? (_jsxs("form", { onSubmit: handleCreate, className: "space-y-2", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { value: name, onChange: (e) => setName(e.target.value), placeholder: "\u901A\u9053\u540D\u79F0", className: "h-8 text-sm", autoFocus: true }), _jsx(Input, { value: handle, onChange: (e) => setHandle(e.target.value), placeholder: "@\u63D0\u53CA\u6807\u8BC6\uFF08\u53EF\u9009\uFF09", className: "h-8 text-sm w-40" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { type: "submit", size: "sm", children: "\u521B\u5EFA" }), _jsx(Button, { type: "button", variant: "ghost", size: "sm", onClick: () => setCreating(false), children: "\u53D6\u6D88" })] }), _jsx("p", { className: "text-[10px] text-muted-foreground", children: "\u8BBE\u7F6E\u63D0\u53CA\u6807\u8BC6\u540E\uFF0C\u7528\u6237\u53D1\u9001 @\u6807\u8BC6 \u7684\u6D88\u606F\u5C06\u5B9A\u5411\u8DEF\u7531\u5230\u6B64\u901A\u9053" })] })) : (_jsxs(Button, { variant: "outline", size: "sm", onClick: () => setCreating(true), className: "w-full", children: [_jsx(Plus, { className: "w-4 h-4 mr-1" }), " \u6DFB\u52A0\u901A\u9053"] })), _jsxs("button", { onClick: () => setShowDocs(!showDocs), className: "text-xs text-muted-foreground hover:text-primary cursor-pointer", children: [showDocs ? "收起" : "查看", " WebSocket \u534F\u8BAE\u8BF4\u660E"] }), showDocs && _jsx(WsProtocolDocs, {})] }));
}
function WsProtocolDocs() {
    return (_jsxs("div", { className: "text-xs text-muted-foreground space-y-3 p-4 rounded-lg border bg-background", children: [_jsx("p", { className: "font-medium text-foreground", children: "WebSocket \u534F\u8BAE\u8BF4\u660E" }), _jsxs("p", { children: ["\u6240\u6709\u6D88\u606F\u5747\u4E3A JSON \u683C\u5F0F\uFF0C\u5305\u542B ", _jsx("code", { className: "text-primary", children: "type" }), " \u5B57\u6BB5\u6807\u8BC6\u6D88\u606F\u7C7B\u578B\u3002"] }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-foreground mt-3 mb-1", children: "\u8FDE\u63A5\u540E\u81EA\u52A8\u6536\u5230\uFF1Ainit" }), _jsx("pre", { className: "bg-card p-2 rounded overflow-x-auto", children: `{
  "type": "init",
  "data": {
    "channel_id": "uuid",
    "channel_name": "通道名",
    "bot_id": "uuid",
    "bot_status": "connected"
  }
}` })] }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-foreground mt-3 mb-1", children: "\u6536\u5230\u6D88\u606F\uFF1Amessage" }), _jsx("pre", { className: "bg-card p-2 rounded overflow-x-auto", children: `{
  "type": "message",
  "data": {
    "seq_id": 123,
    "sender": "xxx@im.wechat",
    "timestamp": 1711100000000,
    "items": [
      { "type": "text", "text": "你好" },
      { "type": "image" },
      { "type": "voice", "text": "语音转文字" },
      { "type": "file", "file_name": "doc.pdf" },
      { "type": "video" }
    ]
  }
}` })] }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-foreground mt-3 mb-1", children: "Bot \u72B6\u6001\u53D8\u5316\uFF1Abot_status" }), _jsx("pre", { className: "bg-card p-2 rounded overflow-x-auto", children: `{
  "type": "bot_status",
  "data": { "bot_id": "uuid", "status": "disconnected" }
}` }), _jsx("p", { className: "mt-1", children: "status: connected / disconnected / error / session_expired" })] }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-foreground mt-3 mb-1", children: "\u53D1\u9001\u6D88\u606F\uFF08\u5BA2\u6237\u7AEF \u2192 \u670D\u52A1\u7AEF\uFF09" }), _jsx("pre", { className: "bg-card p-2 rounded overflow-x-auto", children: `{
  "type": "send_text",
  "req_id": "自定义请求ID",
  "data": {
    "recipient": "xxx@im.wechat",
    "text": "回复内容"
  }
}` })] }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-foreground mt-3 mb-1", children: "\u53D1\u9001\u786E\u8BA4\uFF1Asend_ack" }), _jsx("pre", { className: "bg-card p-2 rounded overflow-x-auto", children: `{
  "type": "send_ack",
  "data": {
    "req_id": "自定义请求ID",
    "success": true,
    "client_id": "sdk-xxx",
    "error": ""
  }
}` })] }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-foreground mt-3 mb-1", children: "\u5FC3\u8DF3" }), _jsxs("p", { children: ["\u53D1\u9001 ", _jsx("code", { className: "text-primary", children: `{"type":"ping"}` }), "\uFF0C\u6536\u5230 ", _jsx("code", { className: "text-primary", children: `{"type":"pong"}` })] })] }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-foreground mt-3 mb-1", children: "HTTP API" }), _jsxs("p", { children: ["\u6240\u6709\u8BF7\u6C42\u901A\u8FC7 ", _jsx("code", { className: "text-primary", children: "?key=API_KEY" }), " \u6216 ", _jsx("code", { className: "text-primary", children: "X-API-Key" }), " \u5934\u8BA4\u8BC1\u3002"] }), _jsx("pre", { className: "bg-card p-2 rounded overflow-x-auto mt-1", children: `# 拉取消息（cursor 分页）
GET /api/v1/channels/messages?key=KEY&cursor=&limit=50

# 发送消息
POST /api/v1/channels/send?key=KEY
{"text": "内容"}

# 输入状态
POST /api/v1/channels/typing?key=KEY
{"ticket": "xxx", "status": "typing"}

# 获取配置（typing ticket）
POST /api/v1/channels/config?key=KEY
{"context_token": "xxx"}

# 渠道状态
GET /api/v1/channels/status?key=KEY` })] }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-foreground mt-3 mb-1", children: "\u6D4B\u8BD5\u547D\u4EE4" }), _jsx("pre", { className: "bg-card p-2 rounded overflow-x-auto", children: "node example/ws-test.mjs \"ws://host:port/api/v1/channels/connect?key=API_KEY\"" })] })] }));
}
function ChannelCard({ botId, channel, onRefresh }) {
    const nav = useNavigate();
    const aiEnabled = channel.ai_config?.enabled;
    const hasWebhook = !!channel.webhook_config?.url;
    const hasPlugin = !!channel.webhook_config?.plugin_id;
    const filterCount = (channel.filter_rule?.user_ids?.length || 0) + (channel.filter_rule?.keywords?.length || 0) + (channel.filter_rule?.message_types?.length || 0);
    return (_jsxs("div", { className: "p-3 rounded-lg border bg-card cursor-pointer hover:border-primary/50 transition-colors", onClick: () => nav(`/dashboard/bot/${botId}/channel/${channel.id}`), children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Cable, { className: "w-3.5 h-3.5 text-muted-foreground" }), _jsx("span", { className: "text-sm font-medium", children: channel.name }), channel.handle ? (_jsxs("span", { className: "text-[10px] font-mono text-muted-foreground", children: ["@", channel.handle] })) : (_jsx("span", { className: "text-[10px] text-muted-foreground", children: "\u5168\u90E8\u6D88\u606F" })), !channel.enabled && _jsx(Badge, { variant: "outline", className: "text-[10px]", children: "\u505C\u7528" })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: (e) => {
                            e.stopPropagation();
                            if (confirm("删除此渠道？")) {
                                api.deleteChannel(botId, channel.id).then(onRefresh);
                            }
                        }, children: _jsx(Trash2, { className: "w-3.5 h-3.5 text-destructive" }) })] }), _jsxs("div", { className: "flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground", children: [hasWebhook && _jsxs("span", { className: "bg-primary/10 text-primary px-1.5 py-0.5 rounded flex items-center gap-0.5", children: [_jsx(Webhook, { className: "w-2.5 h-2.5" }), " Webhook"] }), hasPlugin && _jsxs("span", { className: "bg-primary/10 text-primary px-1.5 py-0.5 rounded flex items-center gap-0.5", children: [_jsx(Puzzle, { className: "w-2.5 h-2.5" }), " \u63D2\u4EF6"] }), aiEnabled && _jsxs("span", { className: "bg-primary/10 text-primary px-1.5 py-0.5 rounded flex items-center gap-0.5", children: [_jsx(Bot, { className: "w-2.5 h-2.5" }), " AI"] }), filterCount > 0 && _jsxs("span", { children: [filterCount, " \u6761\u8FC7\u6EE4\u89C4\u5219"] })] })] }));
}
// Legacy: kept for backward compat but no longer used in channel list
function ChannelRow({ botId, channel, onRefresh }) {
    const [copiedKey, setCopiedKey] = useState(false);
    const [copiedWs, setCopiedWs] = useState(false);
    const [copiedHttp, setCopiedHttp] = useState(false);
    const [showLive, setShowLive] = useState(false);
    const [showAI, setShowAI] = useState(false);
    const [showWebhook, setShowWebhook] = useState(false);
    const [editingHandle, setEditingHandle] = useState(false);
    const [handleVal, setHandleVal] = useState(channel.handle || "");
    const wsProto = location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProto}//${location.host}/api/v1/channels/connect?key=${channel.api_key}`;
    const httpBase = `${location.origin}/api/v1/channels`;
    const aiEnabled = channel.ai_config?.enabled;
    async function saveHandle() {
        await api.updateChannel(botId, channel.id, { handle: handleVal });
        setEditingHandle(false);
        onRefresh();
    }
    function copyKey() {
        navigator.clipboard.writeText(channel.api_key);
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2000);
    }
    function copyWs() {
        navigator.clipboard.writeText(wsUrl);
        setCopiedWs(true);
        setTimeout(() => setCopiedWs(false), 2000);
    }
    function copyHttp() {
        navigator.clipboard.writeText(httpBase);
        setCopiedHttp(true);
        setTimeout(() => setCopiedHttp(false), 2000);
    }
    return (_jsxs("div", { className: "p-3 rounded-lg border bg-card space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Cable, { className: "w-3.5 h-3.5 text-muted-foreground" }), _jsx("span", { className: "text-sm font-medium", children: channel.name }), editingHandle ? (_jsx("form", { onSubmit: (e) => { e.preventDefault(); saveHandle(); }, className: "flex items-center gap-1", children: _jsx(Input, { value: handleVal, onChange: (e) => setHandleVal(e.target.value), placeholder: "handle", className: "h-5 text-[10px] w-24 px-1.5 font-mono", autoFocus: true, onBlur: saveHandle }) })) : (_jsx("button", { onClick: () => setEditingHandle(true), className: "text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded cursor-pointer hover:bg-secondary/80", children: channel.handle ? `@${channel.handle}` : "+ handle" })), aiEnabled && (_jsxs("span", { className: "text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded flex items-center gap-0.5", children: [_jsx(Bot, { className: "w-2.5 h-2.5" }), " AI"] })), channel.webhook_config?.url && (_jsxs("span", { className: "text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded flex items-center gap-0.5", children: [_jsx(Webhook, { className: "w-2.5 h-2.5" }), " Webhook"] })), channel.webhook_config?.plugin_id && (_jsxs("span", { className: "text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded flex items-center gap-0.5", children: [_jsx(Puzzle, { className: "w-2.5 h-2.5" }), " \u63D2\u4EF6"] }))] }), _jsxs("div", { className: "flex gap-1 shrink-0", children: [_jsx(Button, { variant: showAI ? "default" : "ghost", size: "sm", onClick: () => setShowAI(!showAI), title: "AI \u914D\u7F6E", children: _jsx(Bot, { className: "w-3.5 h-3.5" }) }), _jsx(Button, { variant: showWebhook ? "default" : "ghost", size: "sm", onClick: () => setShowWebhook(!showWebhook), title: "Webhook", children: _jsx(Webhook, { className: "w-3.5 h-3.5" }) }), _jsx(Button, { variant: showLive ? "default" : "ghost", size: "sm", onClick: () => setShowLive(!showLive), title: "\u5B9E\u65F6\u76D1\u542C", children: _jsx(Radio, { className: "w-3.5 h-3.5" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: async () => { if (confirm("重新生成 Key？")) {
                                    await api.rotateKey(botId, channel.id);
                                    onRefresh();
                                } }, children: _jsx(RotateCw, { className: "w-3.5 h-3.5" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: async () => { if (confirm("删除？")) {
                                    await api.deleteChannel(botId, channel.id);
                                    onRefresh();
                                } }, children: _jsx(Trash2, { className: "w-3.5 h-3.5 text-destructive" }) })] })] }), _jsx(CopyRow, { label: "API Key", value: channel.api_key, copied: copiedKey, onCopy: copyKey }), _jsx(CopyRow, { label: "WebSocket", value: wsUrl, copied: copiedWs, onCopy: copyWs }), _jsx(CopyRow, { label: "HTTP API", value: httpBase, copied: copiedHttp, onCopy: copyHttp }), showAI && _jsx(AIConfigPanel, { botId: botId, channelId: channel.id, config: channel.ai_config, onSaved: onRefresh }), showWebhook && _jsx(WebhookPanel, { botId: botId, channelId: channel.id, config: channel.webhook_config, onSaved: onRefresh }), showLive && _jsx(LivePanel, { wsUrl: wsUrl, onClose: () => setShowLive(false) })] }));
}
function AIConfigPanel({ botId, channelId, config, onSaved }) {
    const [enabled, setEnabled] = useState(config?.enabled || false);
    const [source, setSource] = useState(config?.source || "builtin");
    const [baseUrl, setBaseUrl] = useState(config?.base_url || "");
    const [apiKey, setApiKey] = useState(config?.api_key || "");
    const [model, setModel] = useState(config?.model || "");
    const [systemPrompt, setSystemPrompt] = useState(config?.system_prompt || "");
    const [maxHistory, setMaxHistory] = useState(config?.max_history || 20);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    function normalizeBaseUrl(url) {
        if (!url)
            return "";
        let u = url.replace(/\/+$/, "");
        if (u && !u.endsWith("/v1"))
            u += "/v1";
        return u;
    }
    async function handleSave() {
        setSaving(true);
        setError("");
        try {
            const cfg = {
                enabled,
                source,
                system_prompt: systemPrompt,
                max_history: maxHistory || 20,
            };
            if (source === "custom") {
                cfg.base_url = normalizeBaseUrl(baseUrl);
                cfg.api_key = apiKey;
                cfg.model = model || "gpt-4o-mini";
                setBaseUrl(cfg.base_url);
            }
            await api.updateChannel(botId, channelId, { ai_config: cfg });
            onSaved();
        }
        catch (err) {
            setError(err.message);
        }
        setSaving(false);
    }
    const canSave = source === "builtin" || apiKey;
    return (_jsxs("div", { className: "border rounded-lg bg-background p-3 space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "text-xs font-medium flex items-center gap-1.5", children: [_jsx(Bot, { className: "w-3.5 h-3.5" }), " AI \u81EA\u52A8\u56DE\u590D"] }), _jsxs("label", { className: "flex items-center gap-1.5 cursor-pointer", children: [_jsx("span", { className: "text-[10px] text-muted-foreground", children: enabled ? "已开启" : "已关闭" }), _jsx("input", { type: "checkbox", checked: enabled, onChange: (e) => setEnabled(e.target.checked), className: "w-3.5 h-3.5 accent-primary" })] })] }), enabled && (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex gap-1", children: [_jsx("button", { onClick: () => setSource("builtin"), className: `px-2.5 py-1 text-[11px] rounded cursor-pointer transition-colors ${source === "builtin" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`, children: "\u5185\u7F6E" }), _jsx("button", { onClick: () => setSource("custom"), className: `px-2.5 py-1 text-[11px] rounded cursor-pointer transition-colors ${source === "custom" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`, children: "\u81EA\u5B9A\u4E49" })] }), source === "builtin" && (_jsx("p", { className: "text-[10px] text-muted-foreground", children: "\u4F7F\u7528\u7BA1\u7406\u5458\u5728\u8BBE\u7F6E\u4E2D\u914D\u7F6E\u7684\u5168\u5C40 AI \u670D\u52A1" })), source === "custom" && (_jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx(Input, { placeholder: "https://api.openai.com/v1", value: baseUrl, onChange: (e) => setBaseUrl(e.target.value), onBlur: () => setBaseUrl(normalizeBaseUrl(baseUrl)), className: "h-7 text-[11px] font-mono col-span-2" }), _jsx(Input, { type: "password", placeholder: "API Key", value: apiKey, onChange: (e) => setApiKey(e.target.value), className: "h-7 text-[11px] font-mono" }), _jsx(Input, { placeholder: "\u6A21\u578B\uFF08\u9ED8\u8BA4 gpt-4o-mini\uFF09", value: model, onChange: (e) => setModel(e.target.value), className: "h-7 text-[11px] font-mono" })] })), _jsx("textarea", { placeholder: "\u7CFB\u7EDF\u63D0\u793A\u8BCD\uFF08System Prompt\uFF09", value: systemPrompt, onChange: (e) => setSystemPrompt(e.target.value), rows: 3, className: "w-full rounded-md border border-input bg-transparent px-3 py-2 text-[11px] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring resize-none" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("label", { className: "text-[10px] text-muted-foreground shrink-0", children: "\u4E0A\u4E0B\u6587\u6D88\u606F\u6570" }), _jsx(Input, { type: "number", value: maxHistory, onChange: (e) => setMaxHistory(parseInt(e.target.value) || 20), className: "h-7 text-[11px] w-20", min: 1, max: 100 }), _jsx("div", { className: "flex-1" }), error && _jsx("span", { className: "text-[10px] text-destructive", children: error }), _jsx(Button, { size: "sm", className: "h-7", onClick: handleSave, disabled: saving || !canSave, children: saving ? "..." : "保存" })] })] }))] }));
}
function WebhookPanel({ botId, channelId, config, onSaved }) {
    const [url, setUrl] = useState(config?.url || "");
    const [authType, setAuthType] = useState(config?.auth?.type || "");
    const [authToken, setAuthToken] = useState(config?.auth?.token || "");
    const [authName, setAuthName] = useState(config?.auth?.name || "");
    const [authValue, setAuthValue] = useState(config?.auth?.value || config?.auth?.secret || "");
    const [scriptMode, setScriptMode] = useState(config?.plugin_id ? "plugin" : "manual");
    const [script, setScript] = useState(config?.script || "");
    const [pluginId, setPluginId] = useState(config?.plugin_id || "");
    const [pluginInfo, setPluginInfo] = useState(null);
    const [plugins, setPlugins] = useState([]);
    const [showPluginPicker, setShowPluginPicker] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    useEffect(() => {
        if (pluginId) {
            api.getPlugin(pluginId).then(setPluginInfo).catch(() => setPluginInfo(null));
        }
    }, [pluginId]);
    useEffect(() => {
        if (showPluginPicker) {
            api.listPlugins().then((list) => setPlugins(list || [])).catch(() => { });
        }
    }, [showPluginPicker]);
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
            await api.updateChannel(botId, channelId, {
                webhook_config: {
                    url,
                    auth,
                    plugin_id: scriptMode === "plugin" ? pluginId : undefined,
                    script: scriptMode === "manual" ? (script || undefined) : undefined,
                },
            });
            onSaved();
        }
        catch (err) {
            setError(err.message);
        }
        setSaving(false);
    }
    async function handleInstallPlugin(id) {
        try {
            const result = await api.installPluginToChannel(id, botId, channelId);
            setPluginId(result.plugin_id);
            setScriptMode("plugin");
            setScript("");
            setShowPluginPicker(false);
            onSaved();
        }
        catch (err) {
            setError(err.message);
        }
    }
    function handleUninstallPlugin() {
        setPluginId("");
        setPluginInfo(null);
        setScriptMode("manual");
    }
    return (_jsxs("div", { className: "border rounded-lg bg-background p-3 space-y-3", children: [_jsxs("span", { className: "text-xs font-medium flex items-center gap-1.5", children: [_jsx(Webhook, { className: "w-3.5 h-3.5" }), " Webhook \u63A8\u9001"] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Input, { placeholder: "https://your-server.com/webhook", value: url, onChange: (e) => setUrl(e.target.value), className: "h-7 text-[11px] font-mono" }), _jsx("div", { className: "flex gap-1", children: ["", "bearer", "header", "hmac"].map((t) => (_jsx("button", { onClick: () => setAuthType(t), className: `px-2 py-0.5 text-[10px] rounded cursor-pointer transition-colors ${authType === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`, children: t || "无认证" }, t))) }), authType === "bearer" && _jsx(Input, { placeholder: "Token", value: authToken, onChange: (e) => setAuthToken(e.target.value), className: "h-7 text-[11px] font-mono" }), authType === "header" && (_jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { placeholder: "Header \u540D", value: authName, onChange: (e) => setAuthName(e.target.value), className: "h-7 text-[11px] font-mono" }), _jsx(Input, { placeholder: "Header \u503C", value: authValue, onChange: (e) => setAuthValue(e.target.value), className: "h-7 text-[11px] font-mono" })] })), authType === "hmac" && _jsx(Input, { placeholder: "HMAC Secret", value: authValue, onChange: (e) => setAuthValue(e.target.value), className: "h-7 text-[11px] font-mono" }), _jsxs("div", { className: "flex gap-1", children: [_jsx("button", { onClick: () => setScriptMode("plugin"), className: `px-2 py-0.5 text-[10px] rounded cursor-pointer transition-colors ${scriptMode === "plugin" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`, children: "\u63D2\u4EF6\u5E02\u573A" }), _jsx("button", { onClick: () => setScriptMode("manual"), className: `px-2 py-0.5 text-[10px] rounded cursor-pointer transition-colors ${scriptMode === "manual" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`, children: "\u624B\u52A8\u811A\u672C" })] }), scriptMode === "plugin" && (_jsxs("div", { className: "space-y-2", children: [pluginInfo ? (_jsxs("div", { className: "flex items-center justify-between p-2 rounded border bg-card", children: [_jsxs("div", { className: "text-xs", children: [_jsxs("span", { children: [pluginInfo.icon, " "] }), _jsx("span", { className: "font-medium", children: pluginInfo.name }), _jsxs("span", { className: "text-muted-foreground ml-1", children: ["v", pluginInfo.version] }), _jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5", children: pluginInfo.description })] }), _jsxs("div", { className: "flex gap-1", children: [_jsx(Button, { variant: "ghost", size: "sm", className: "h-6 text-[10px]", onClick: () => setShowPluginPicker(true), children: "\u66F4\u6362" }), _jsx(Button, { variant: "ghost", size: "sm", className: "h-6 text-[10px] text-destructive", onClick: handleUninstallPlugin, children: "\u5378\u8F7D" })] })] })) : (_jsxs(Button, { variant: "outline", size: "sm", className: "w-full text-xs h-7", onClick: () => setShowPluginPicker(true), children: [_jsx(Puzzle, { className: "w-3 h-3 mr-1" }), " \u9009\u62E9\u63D2\u4EF6"] })), showPluginPicker && (_jsxs("div", { className: "border rounded p-2 space-y-1 max-h-40 overflow-y-auto bg-card", children: [plugins.length === 0 && _jsx("p", { className: "text-[10px] text-muted-foreground text-center py-2", children: "\u6682\u65E0\u53EF\u7528\u63D2\u4EF6" }), plugins.map((p) => (_jsxs("button", { onClick: () => handleInstallPlugin(p.id), className: "w-full text-left p-1.5 rounded hover:bg-secondary cursor-pointer text-xs flex items-center justify-between", children: [_jsxs("span", { children: [p.icon, " ", p.name, " ", _jsxs("span", { className: "text-muted-foreground", children: ["v", p.version] })] }), _jsxs("span", { className: "text-[10px] text-muted-foreground", children: [p.install_count, " \u5B89\u88C5"] })] }, p.id))), _jsx("button", { onClick: () => setShowPluginPicker(false), className: "w-full text-center text-[10px] text-muted-foreground hover:text-primary cursor-pointer py-1", children: "\u53D6\u6D88" })] }))] })), scriptMode === "manual" && (_jsx("textarea", { placeholder: `JS 中间件（可选）\n\nfunction onRequest(ctx) {\n  ctx.req.body = JSON.stringify({text: ctx.msg.content});\n}`, value: script, onChange: (e) => setScript(e.target.value), rows: 5, className: "w-full rounded-md border border-input bg-transparent px-3 py-2 text-[11px] font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring resize-none" }))] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-[10px] text-muted-foreground", children: "\u6536\u5230\u6D88\u606F\u65F6 POST \u5230\u6B64 URL\u3002" }), _jsxs("div", { className: "flex items-center gap-2", children: [error && _jsx("span", { className: "text-[10px] text-destructive", children: error }), _jsx(Button, { size: "sm", className: "h-7", onClick: handleSave, disabled: saving, children: saving ? "..." : "保存" })] })] })] }));
}
function LivePanel({ wsUrl, onClose }) {
    const [status, setStatus] = useState("connecting");
    const [logs, setLogs] = useState([]);
    const [input, setInput] = useState("");
    const wsRef = useRef(null);
    const logEndRef = useRef(null);
    const seqRef = useRef(0);
    const addLog = useCallback((dir, type, data) => {
        setLogs((prev) => {
            const entry = {
                id: ++seqRef.current,
                dir,
                type,
                data,
                time: new Date().toLocaleTimeString(),
            };
            const next = [...prev, entry];
            return next.length > 200 ? next.slice(-200) : next;
        });
    }, []);
    useEffect(() => {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;
        ws.onopen = () => {
            setStatus("connected");
            addLog("sys", "connected", null);
        };
        ws.onmessage = (e) => {
            try {
                const msg = JSON.parse(e.data);
                addLog("in", msg.type, msg.data);
            }
            catch {
                addLog("in", "raw", e.data);
            }
        };
        ws.onclose = () => {
            setStatus("disconnected");
            addLog("sys", "disconnected", null);
        };
        ws.onerror = () => {
            addLog("sys", "error", null);
        };
        // Ping keepalive
        const pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: "ping" }));
            }
        }, 30000);
        return () => {
            clearInterval(pingInterval);
            ws.close();
        };
    }, [wsUrl, addLog]);
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);
    function handleSend(e) {
        e.preventDefault();
        if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN)
            return;
        const reqId = `req-${Date.now()}`;
        const msg = {
            type: "send_text",
            req_id: reqId,
            data: { text: input },
        };
        wsRef.current.send(JSON.stringify(msg));
        addLog("out", "send_text", msg.data);
        setInput("");
    }
    const statusColor = {
        connecting: "text-yellow-500",
        connected: "text-green-500",
        disconnected: "text-destructive",
    }[status];
    return (_jsxs("div", { className: "border rounded-lg bg-background overflow-hidden", children: [_jsxs("div", { className: "flex items-center justify-between px-3 py-1.5 border-b bg-secondary/30", children: [_jsx("div", { className: "flex items-center gap-2", children: _jsx("span", { className: `text-[10px] font-medium ${statusColor}`, children: status === "connected" ? "LIVE" : status === "connecting" ? "CONNECTING" : "DISCONNECTED" }) }), _jsx("button", { onClick: onClose, className: "text-muted-foreground hover:text-foreground cursor-pointer", children: _jsx(X, { className: "w-3.5 h-3.5" }) })] }), _jsxs("div", { className: "h-64 overflow-y-auto text-[11px] p-2 space-y-1", children: [logs.map((log) => _jsx(LogEntry, { log: log }, log.id)), logs.length === 0 && (_jsx("p", { className: "text-muted-foreground text-center py-8", children: "\u7B49\u5F85\u6D88\u606F..." })), _jsx("div", { ref: logEndRef })] }), _jsxs("form", { onSubmit: handleSend, className: "flex gap-1.5 p-2 border-t", children: [_jsx(Input, { value: input, onChange: (e) => setInput(e.target.value), placeholder: "\u53D1\u9001\u5185\u5BB9...", className: "h-7 text-[11px] flex-1" }), _jsx(Button, { type: "submit", size: "sm", className: "h-7 px-2", disabled: status !== "connected" || !input.trim(), children: _jsx(Send, { className: "w-3 h-3" }) })] })] }));
}
function LogEntry({ log }) {
    const [expanded, setExpanded] = useState(false);
    if (log.dir === "sys") {
        return (_jsxs("div", { className: "text-muted-foreground text-center text-[10px] py-0.5", children: ["\u2014 ", log.type, " ", log.time, " \u2014"] }));
    }
    const isIn = log.dir === "in";
    const dirColor = isIn ? "text-green-500" : "text-blue-500";
    const dirIcon = isIn ? "◀" : "▶";
    // Format summary based on message type
    let summary = "";
    const d = log.data;
    if (d) {
        switch (log.type) {
            case "message": {
                const sender = d.sender || "";
                const items = d.items || [];
                const texts = items.map((it) => {
                    if (it.type === "text")
                        return it.text;
                    if (it.type === "voice" && it.text)
                        return `[语音] ${it.text}`;
                    if (it.type === "file")
                        return `[文件] ${it.file_name || ""}`;
                    return `[${it.type}]`;
                }).join(" ");
                summary = sender ? `${sender}: ${texts}` : texts;
                break;
            }
            case "init":
                summary = `channel=${d.channel_name || d.channel_id} bot_status=${d.bot_status}`;
                break;
            case "bot_status":
                summary = d.status || "";
                break;
            case "send_ack":
                summary = d.success ? "ok" : `err: ${d.error}`;
                break;
            case "send_text":
                summary = d.text || "";
                break;
            case "pong":
                summary = "";
                break;
            default:
                summary = typeof d === "string" ? d : JSON.stringify(d);
        }
    }
    const hasDetail = d != null && log.type !== "pong";
    return (_jsxs("div", { className: "group", children: [_jsxs("div", { className: `flex items-start gap-1.5 ${hasDetail ? "cursor-pointer" : ""} hover:bg-secondary/30 rounded px-1 -mx-1`, onClick: () => hasDetail && setExpanded(!expanded), children: [_jsx("span", { className: "text-muted-foreground shrink-0 w-14 text-[10px] pt-px", children: log.time }), _jsx("span", { className: `shrink-0 ${dirColor}`, children: dirIcon }), _jsx("span", { className: "text-primary shrink-0 font-medium", children: log.type }), _jsx("span", { className: "text-foreground truncate", children: summary })] }), expanded && d != null && (_jsx("pre", { className: "ml-[70px] text-[10px] text-muted-foreground bg-secondary/30 rounded p-2 mt-0.5 mb-1 overflow-x-auto whitespace-pre-wrap break-all", children: JSON.stringify(d, null, 2) }))] }));
}
function CopyRow({ label, value, copied, onCopy }) {
    return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-[10px] text-muted-foreground w-16 shrink-0", children: label }), _jsx("code", { className: "flex-1 text-[10px] text-muted-foreground font-mono bg-background border rounded px-2 py-1 truncate select-all", children: value }), _jsx("button", { onClick: onCopy, className: "cursor-pointer text-muted-foreground hover:text-foreground shrink-0", children: copied ? _jsx(Check, { className: "w-3 h-3" }) : _jsx(Copy, { className: "w-3 h-3" }) })] }));
}
function BotSettingsTab({ bot, onUpdate }) {
    const [reminderEnabled, setReminderEnabled] = useState(bot.reminder_hours > 0);
    const [reminderHours, setReminderHours] = useState(bot.reminder_hours || 23);
    const [saving, setSaving] = useState(false);
    async function handleSave() {
        setSaving(true);
        try {
            await api.updateBot(bot.id, { reminder_hours: reminderEnabled ? reminderHours : 0 });
            onUpdate();
        }
        catch { }
        setSaving(false);
    }
    return (_jsx("div", { className: "space-y-4 mt-4", children: _jsxs("div", { className: "p-4 rounded-lg border space-y-3", children: [_jsx("h3", { className: "text-sm font-medium", children: "\u4F1A\u8BDD\u4FDD\u6D3B\u63D0\u9192" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "\u5FAE\u4FE1\u4F1A\u8BDD 24 \u5C0F\u65F6\u672A\u6D3B\u52A8\u5C06\u8FC7\u671F\u3002\u5F00\u542F\u540E\uFF0C\u5F53 Bot \u5728\u8BBE\u5B9A\u65F6\u95F4\u5185\u6CA1\u6709\u6536\u53D1\u4EFB\u4F55\u6D88\u606F\u65F6\uFF0C\u7CFB\u7EDF\u4F1A\u81EA\u52A8\u901A\u8FC7 Bot \u53D1\u9001\u4E00\u6761\u63D0\u9192\u6D88\u606F\u7ED9\u4F60\u7684\u5FAE\u4FE1\uFF0C\u540C\u65F6\u8D77\u5230\u4FDD\u6D3B\u4F1A\u8BDD\u7684\u4F5C\u7528\u3002" }), _jsx("div", { className: "flex items-center gap-3", children: _jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: reminderEnabled, onChange: (e) => setReminderEnabled(e.target.checked), className: "w-3.5 h-3.5 accent-primary" }), _jsx("span", { className: "text-sm", children: "\u542F\u7528\u63D0\u9192" })] }) }), reminderEnabled && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-xs text-muted-foreground", children: "\u65E0\u6D88\u606F\u8D85\u8FC7" }), _jsx("input", { type: "number", value: reminderHours, onChange: (e) => setReminderHours(Math.max(1, Math.min(23, parseInt(e.target.value) || 23))), className: "w-16 h-7 rounded border px-2 text-xs text-center", min: 1, max: 23 }), _jsx("span", { className: "text-xs text-muted-foreground", children: "\u5C0F\u65F6\u540E\u63D0\u9192" })] }), _jsxs("p", { className: "text-[10px] text-muted-foreground", children: ["\u8BBE\u4E3A ", reminderHours, " \u5C0F\u65F6\uFF1ABot \u9759\u9ED8 ", reminderHours, " \u5C0F\u65F6\u540E\u53D1\u9001\u63D0\u9192\uFF0C\u8DDD 24 \u5C0F\u65F6\u8FC7\u671F\u8FD8\u5269\u7EA6 ", Math.max(1, 24 - reminderHours), " \u5C0F\u65F6\u3002\u5EFA\u8BAE\u8BBE\u4E3A 23 \u5C0F\u65F6\uFF08\u63D0\u524D 1 \u5C0F\u65F6\u63D0\u9192\uFF09\u3002"] })] })), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { size: "sm", onClick: handleSave, disabled: saving, children: saving ? "保存中..." : "保存" }) })] }) }));
}
