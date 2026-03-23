import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { api } from "../lib/api";
import { Link2, Unlink, KeyRound, Plus, Trash2, Puzzle } from "lucide-react";
import { Badge } from "../components/ui/badge";
const providerLabels = { github: "GitHub", linuxdo: "LinuxDo" };
export function SettingsPage() {
    const [user, setUser] = useState(null);
    const [oauthAccounts, setOauthAccounts] = useState([]);
    const [oauthProviders, setOauthProviders] = useState([]);
    async function load() {
        const [u, accounts, providers] = await Promise.all([api.me(), api.oauthAccounts(), api.oauthProviders()]);
        setUser(u);
        setOauthAccounts(accounts || []);
        setOauthProviders(providers.providers || []);
    }
    const [oauthMsg, setOauthMsg] = useState("");
    useEffect(() => { load(); }, []);
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const bound = params.get("oauth_bound");
        const error = params.get("oauth_error");
        if (bound) {
            setOauthMsg(`${providerLabels[bound] || bound} 绑定成功`);
        }
        else if (error === "already_linked") {
            setOauthMsg("绑定失败：该第三方账号已被其他用户绑定，请联系管理员处理");
        }
        else if (error === "bind_failed") {
            setOauthMsg("绑定失败，请重试");
        }
        else if (error) {
            setOauthMsg("OAuth 错误：" + error);
        }
        if (bound || error) {
            window.history.replaceState({}, "", "/dashboard/settings");
            load();
        }
    }, []);
    if (!user)
        return null;
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-lg font-semibold", children: "\u8D26\u53F7\u8BBE\u7F6E" }), _jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "\u4E2A\u4EBA\u4FE1\u606F\u3001\u5BC6\u7801\u3001Passkey\u3001\u7B2C\u4E09\u65B9\u7ED1\u5B9A" })] }), oauthMsg && (_jsxs("div", { className: `text-xs p-3 rounded-lg border ${oauthMsg.includes("失败") || oauthMsg.includes("错误") ? "border-destructive/30 bg-destructive/5 text-destructive" : "border-primary/30 bg-primary/5 text-primary"}`, children: [oauthMsg, _jsx("button", { onClick: () => setOauthMsg(""), className: "ml-2 underline cursor-pointer", children: "\u5173\u95ED" })] })), _jsxs(Card, { className: "space-y-3", children: [_jsx("h3", { className: "text-sm font-medium", children: "\u8D26\u53F7\u4FE1\u606F" }), _jsxs("div", { className: "text-sm space-y-1", children: [_jsxs("p", { children: [_jsx("span", { className: "text-muted-foreground", children: "\u7528\u6237\u540D\uFF1A" }), user.username] }), _jsxs("p", { children: [_jsx("span", { className: "text-muted-foreground", children: "\u663E\u793A\u540D\uFF1A" }), user.display_name] }), _jsxs("p", { children: [_jsx("span", { className: "text-muted-foreground", children: "\u89D2\u8272\uFF1A" }), user.role === "admin" ? "管理员" : "成员"] })] })] }), _jsx(MyPluginsSection, {}), _jsx(ChangePasswordSection, {}), _jsx(PasskeySection, {}), oauthProviders.length > 0 && (_jsxs(Card, { className: "space-y-3", children: [_jsx("h3", { className: "text-sm font-medium", children: "\u7B2C\u4E09\u65B9\u8D26\u53F7\u7ED1\u5B9A" }), _jsx("div", { className: "space-y-2", children: oauthProviders.map((provider) => {
                            const account = oauthAccounts.find((a) => a.provider === provider);
                            const linked = !!account;
                            return (_jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg border bg-background", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-secondary flex items-center justify-center", children: _jsx("span", { className: "text-xs font-medium", children: (providerLabels[provider] || provider).charAt(0).toUpperCase() }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: providerLabels[provider] || provider }), _jsx("p", { className: "text-xs text-muted-foreground", children: linked ? `已绑定：${account.username}` : "未绑定" })] })] }), linked ? (_jsxs(Button, { variant: "ghost", size: "sm", onClick: async () => {
                                            if (!confirm(`解绑 ${providerLabels[provider]}？`))
                                                return;
                                            try {
                                                await api.unlinkOAuth(provider);
                                                load();
                                            }
                                            catch (e) {
                                                alert(e.message);
                                            }
                                        }, children: [_jsx(Unlink, { className: "w-3.5 h-3.5 mr-1" }), " \u89E3\u7ED1"] })) : (_jsxs(Button, { variant: "outline", size: "sm", onClick: () => { window.location.href = `/api/me/linked-accounts/${provider}/bind`; }, children: [_jsx(Link2, { className: "w-3.5 h-3.5 mr-1" }), " \u7ED1\u5B9A"] }))] }, provider));
                        }) })] }))] }));
}
// ==================== My Plugins ====================
function MyPluginsSection() {
    const [plugins, setPlugins] = useState([]);
    useEffect(() => {
        api.myPlugins().then((p) => setPlugins(p || [])).catch(() => { });
    }, []);
    const statusMap = {
        approved: { label: "已通过", variant: "default" },
        pending: { label: "待审核", variant: "outline" },
        rejected: { label: "已拒绝", variant: "destructive" },
    };
    return (_jsxs(Card, { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-sm font-medium", children: "\u6211\u7684\u63D2\u4EF6" }), _jsx("a", { href: "/dashboard/webhook-plugins", className: "text-[10px] text-primary hover:underline", children: "\u53BB\u63D2\u4EF6\u5E02\u573A \u2192" })] }), plugins.length === 0 ? (_jsx("p", { className: "text-xs text-muted-foreground", children: "\u4F60\u8FD8\u6CA1\u6709\u63D0\u4EA4\u4EFB\u4F55\u63D2\u4EF6" })) : (_jsx("div", { className: "space-y-1", children: plugins.map((p) => {
                    const s = statusMap[p.status] || statusMap.pending;
                    return (_jsxs("div", { className: "flex items-center justify-between p-2 rounded-lg border bg-background", children: [_jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [p.icon && _jsx("span", { children: p.icon }), _jsx(Puzzle, { className: "w-3.5 h-3.5 text-muted-foreground shrink-0" }), _jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "text-xs font-medium", children: p.name }), _jsxs("span", { className: "text-[10px] text-muted-foreground", children: ["v", p.version] }), _jsx(Badge, { variant: s.variant, className: "text-[10px]", children: s.label })] }), _jsx("p", { className: "text-[10px] text-muted-foreground truncate", children: p.description })] })] }), _jsxs("div", { className: "text-[10px] text-muted-foreground shrink-0 ml-2 text-right", children: [_jsxs("p", { children: [p.install_count, " \u5B89\u88C5"] }), _jsx("p", { children: new Date(p.created_at * 1000).toLocaleDateString() })] })] }, p.id));
                }) }))] }));
}
// ==================== Change Password ====================
function ChangePasswordSection() {
    const [oldPwd, setOldPwd] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [confirmPwd, setConfirmPwd] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");
        if (newPwd.length < 8) {
            setError("新密码至少 8 位");
            return;
        }
        if (newPwd !== confirmPwd) {
            setError("两次输入不一致");
            return;
        }
        setSaving(true);
        try {
            await api.changePassword({ old_password: oldPwd, new_password: newPwd });
            setOldPwd("");
            setNewPwd("");
            setConfirmPwd("");
            setSuccess("密码已修改");
        }
        catch (err) {
            setError(err.message);
        }
        setSaving(false);
    }
    return (_jsxs(Card, { className: "space-y-3", children: [_jsx("h3", { className: "text-sm font-medium", children: "\u4FEE\u6539\u5BC6\u7801" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-2", children: [_jsx(Input, { type: "password", placeholder: "\u5F53\u524D\u5BC6\u7801", value: oldPwd, onChange: (e) => setOldPwd(e.target.value), className: "h-8 text-xs" }), _jsx(Input, { type: "password", placeholder: "\u65B0\u5BC6\u7801\uFF08\u81F3\u5C11 8 \u4F4D\uFF09", value: newPwd, onChange: (e) => setNewPwd(e.target.value), className: "h-8 text-xs" }), _jsx(Input, { type: "password", placeholder: "\u786E\u8BA4\u65B0\u5BC6\u7801", value: confirmPwd, onChange: (e) => setConfirmPwd(e.target.value), className: "h-8 text-xs" }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [error && _jsx("span", { className: "text-[10px] text-destructive", children: error }), success && _jsx("span", { className: "text-[10px] text-primary", children: success })] }), _jsx(Button, { type: "submit", size: "sm", disabled: saving, children: saving ? "..." : "修改密码" })] })] })] }));
}
// ==================== Passkey ====================
function PasskeySection() {
    const [passkeys, setPasskeys] = useState([]);
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState("");
    async function load() { try {
        setPasskeys(await api.listPasskeys() || []);
    }
    catch { } }
    useEffect(() => { load(); }, []);
    async function handleAdd() {
        setAdding(true);
        setError("");
        try {
            const options = await api.passkeyBindBegin();
            options.publicKey.challenge = base64urlToBuffer(options.publicKey.challenge);
            options.publicKey.user.id = base64urlToBuffer(options.publicKey.user.id);
            if (options.publicKey.excludeCredentials) {
                options.publicKey.excludeCredentials = options.publicKey.excludeCredentials.map((c) => ({ ...c, id: base64urlToBuffer(c.id) }));
            }
            const credential = await navigator.credentials.create(options);
            if (!credential)
                throw new Error("cancelled");
            const response = credential.response;
            await api.passkeyBindFinishRaw(JSON.stringify({
                id: credential.id, rawId: bufferToBase64url(credential.rawId), type: credential.type,
                response: { attestationObject: bufferToBase64url(response.attestationObject), clientDataJSON: bufferToBase64url(response.clientDataJSON) },
            }));
            load();
        }
        catch (err) {
            if (err.name !== "NotAllowedError")
                setError(err.message || "注册失败");
        }
        setAdding(false);
    }
    return (_jsxs(Card, { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-sm font-medium", children: "Passkey" }), _jsxs(Button, { variant: "outline", size: "sm", className: "text-xs h-7", onClick: handleAdd, disabled: adding, children: [_jsx(Plus, { className: "w-3 h-3 mr-1" }), " ", adding ? "注册中..." : "添加 Passkey"] })] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "\u4F7F\u7528\u6307\u7EB9\u3001Face ID \u6216\u5B89\u5168\u5BC6\u94A5\u767B\u5F55\uFF0C\u65E0\u9700\u5BC6\u7801\u3002" }), error && _jsx("p", { className: "text-[10px] text-destructive", children: error }), passkeys.length === 0 ? (_jsx("p", { className: "text-[10px] text-muted-foreground", children: "\u6682\u672A\u7ED1\u5B9A\u4EFB\u4F55 Passkey" })) : (_jsx("div", { className: "space-y-1", children: passkeys.map((pk) => (_jsxs("div", { className: "flex items-center justify-between p-2 rounded-lg border bg-background", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(KeyRound, { className: "w-4 h-4 text-muted-foreground" }), _jsxs("div", { children: [_jsxs("p", { className: "text-xs font-mono", children: [pk.id.slice(0, 16), "..."] }), _jsx("p", { className: "text-[10px] text-muted-foreground", children: new Date(pk.created_at * 1000).toLocaleDateString() })] })] }), _jsx(Button, { variant: "ghost", size: "sm", className: "h-6", onClick: async () => {
                                if (!confirm("删除此 Passkey？"))
                                    return;
                                try {
                                    await api.deletePasskey(pk.id);
                                    load();
                                }
                                catch { }
                            }, children: _jsx(Trash2, { className: "w-3 h-3 text-destructive" }) })] }, pk.id))) }))] }));
}
function base64urlToBuffer(b64) {
    const base64 = b64.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));
    const bin = atob(base64 + pad);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++)
        bytes[i] = bin.charCodeAt(i);
    return bytes.buffer;
}
function bufferToBase64url(buf) {
    const bytes = new Uint8Array(buf);
    let bin = "";
    for (let i = 0; i < bytes.length; i++)
        bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
