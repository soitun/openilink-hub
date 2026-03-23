import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "../components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator, } from "../components/ui/field";
import { Input } from "../components/ui/input";
import { api } from "../lib/api";
const providerLabels = {
    github: "GitHub",
    linuxdo: "LinuxDo",
};
function base64urlToBuffer(b64) {
    const base64 = b64.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));
    const bin = atob(base64 + pad);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
        bytes[i] = bin.charCodeAt(i);
    }
    return bytes.buffer;
}
function bufferToBase64url(buf) {
    const bytes = new Uint8Array(buf);
    let bin = "";
    for (let i = 0; i < bytes.length; i++) {
        bin += String.fromCharCode(bytes[i]);
    }
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
export function LoginPage() {
    const navigate = useNavigate();
    const [mode, setMode] = useState("login");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [oauthProviders, setOauthProviders] = useState([]);
    useEffect(() => {
        api
            .oauthProviders()
            .then((data) => setOauthProviders(data.providers || []))
            .catch(() => { });
    }, []);
    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            if (mode === "register") {
                await api.register(username, password);
            }
            else {
                await api.login(username, password);
            }
            navigate("/dashboard");
        }
        catch (err) {
            setError(err.message);
        }
        setLoading(false);
    }
    async function handlePasskeyLogin() {
        setError("");
        setLoading(true);
        try {
            const options = await fetch("/api/auth/passkey/login/begin", {
                method: "POST",
                credentials: "same-origin",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            }).then((r) => r.json());
            options.publicKey.challenge = base64urlToBuffer(options.publicKey.challenge);
            if (options.publicKey.allowCredentials) {
                options.publicKey.allowCredentials = options.publicKey.allowCredentials.map((credential) => ({
                    ...credential,
                    id: base64urlToBuffer(credential.id),
                }));
            }
            const credential = (await navigator.credentials.get(options));
            if (!credential) {
                throw new Error("cancelled");
            }
            const response = credential.response;
            const body = JSON.stringify({
                id: credential.id,
                rawId: bufferToBase64url(credential.rawId),
                type: credential.type,
                response: {
                    authenticatorData: bufferToBase64url(response.authenticatorData),
                    clientDataJSON: bufferToBase64url(response.clientDataJSON),
                    signature: bufferToBase64url(response.signature),
                    userHandle: response.userHandle ? bufferToBase64url(response.userHandle) : "",
                },
            });
            const res = await fetch("/api/auth/passkey/login/finish", {
                method: "POST",
                credentials: "same-origin",
                headers: { "Content-Type": "application/json" },
                body,
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "login failed");
            }
            navigate("/dashboard");
        }
        catch (err) {
            if (err.name !== "NotAllowedError") {
                setError(err.message || "Passkey 登录失败");
            }
        }
        setLoading(false);
    }
    async function handlePasskeyRegister() {
        if (!username.trim()) {
            setError("请先输入用户名");
            return;
        }
        setError("");
        setLoading(true);
        try {
            const options = await fetch("/api/auth/passkey/register/begin", {
                method: "POST",
                credentials: "same-origin",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: username.trim() }),
            }).then(async (r) => {
                if (!r.ok) {
                    throw new Error((await r.json()).error);
                }
                return r.json();
            });
            options.publicKey.challenge = base64urlToBuffer(options.publicKey.challenge);
            options.publicKey.user.id = base64urlToBuffer(options.publicKey.user.id);
            if (options.publicKey.excludeCredentials) {
                options.publicKey.excludeCredentials = options.publicKey.excludeCredentials.map((credential) => ({
                    ...credential,
                    id: base64urlToBuffer(credential.id),
                }));
            }
            const credential = (await navigator.credentials.create(options));
            if (!credential) {
                throw new Error("cancelled");
            }
            const response = credential.response;
            const body = JSON.stringify({
                id: credential.id,
                rawId: bufferToBase64url(credential.rawId),
                type: credential.type,
                response: {
                    attestationObject: bufferToBase64url(response.attestationObject),
                    clientDataJSON: bufferToBase64url(response.clientDataJSON),
                },
            });
            const res = await fetch(`/api/auth/passkey/register/finish?username=${encodeURIComponent(username.trim())}`, {
                method: "POST",
                credentials: "same-origin",
                headers: { "Content-Type": "application/json" },
                body,
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "register failed");
            }
            navigate("/dashboard");
        }
        catch (err) {
            if (err.name !== "NotAllowedError") {
                setError(err.message || "Passkey 注册失败");
            }
        }
        setLoading(false);
    }
    function handleOAuth(provider) {
        window.location.href = `/api/auth/oauth/${provider}`;
    }
    function toggleMode() {
        setMode(mode === "login" ? "register" : "login");
        setError("");
    }
    const supportsPasskey = typeof window !== "undefined" && "PublicKeyCredential" in window;
    return (_jsx("div", { className: "flex min-h-screen items-center justify-center p-4", children: _jsx("div", { className: "w-full max-w-sm", children: _jsxs("div", { className: "flex flex-col gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "text-center", children: [_jsx(CardTitle, { className: "text-xl", children: "OpenILink Hub" }), _jsx(CardDescription, { children: mode === "login" ? "登录你的账号" : "创建新账号" })] }), _jsx(CardContent, { children: _jsx("form", { onSubmit: handleSubmit, children: _jsxs(FieldGroup, { children: [oauthProviders.length > 0 && (_jsxs(_Fragment, { children: [_jsx(Field, { children: oauthProviders.map((provider) => (_jsxs(Button, { type: "button", variant: "outline", className: "w-full", onClick: () => handleOAuth(provider), disabled: loading, children: ["\u4F7F\u7528 ", providerLabels[provider] || provider, " \u767B\u5F55"] }, provider))) }), _jsx(FieldSeparator, { className: "*:data-[slot=field-separator-content]:bg-card", children: "\u6216\u7EE7\u7EED\u4F7F\u7528\u8D26\u53F7" })] })), _jsxs(Field, { children: [_jsx(FieldLabel, { htmlFor: "username", children: "\u7528\u6237\u540D" }), _jsx(Input, { id: "username", placeholder: "\u8BF7\u8F93\u5165\u7528\u6237\u540D", value: username, onChange: (e) => setUsername(e.target.value), autoFocus: true, disabled: loading, required: true })] }), _jsxs(Field, { children: [_jsxs("div", { className: "flex items-center", children: [_jsx(FieldLabel, { htmlFor: "password", children: "\u5BC6\u7801" }), mode === "register" && (_jsx("span", { className: "ml-auto text-sm text-muted-foreground", children: "\u81F3\u5C11 8 \u4F4D" }))] }), _jsx(Input, { id: "password", type: "password", placeholder: mode === "login" ? "请输入密码" : "设置登录密码", value: password, onChange: (e) => setPassword(e.target.value), disabled: loading, required: true })] }), _jsx(FieldError, { children: error }), supportsPasskey && (_jsxs(_Fragment, { children: [_jsx(FieldSeparator, { className: "*:data-[slot=field-separator-content]:bg-card", children: mode === "login" ? "或使用 Passkey" : "或直接创建 Passkey" }), _jsxs(Field, { children: [_jsxs(Button, { type: "button", variant: "outline", className: "w-full", onClick: mode === "login"
                                                                    ? handlePasskeyLogin
                                                                    : handlePasskeyRegister, disabled: loading || (mode === "register" && !username.trim()), children: [_jsx(KeyRound, { className: "mr-2 h-4 w-4" }), mode === "login"
                                                                        ? "使用 Passkey 登录"
                                                                        : "使用 Passkey 注册（无需密码）"] }), mode === "register" && (_jsx(FieldDescription, { className: "text-center", children: "Passkey \u6CE8\u518C\u4F1A\u4F7F\u7528\u4E0A\u65B9\u586B\u5199\u7684\u7528\u6237\u540D\u521B\u5EFA\u8D26\u53F7\u3002" }))] })] })), _jsxs(Field, { children: [_jsx(Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? "..." : mode === "login" ? "登录" : "注册" }), _jsxs(FieldDescription, { className: "text-center", children: [mode === "login" ? "没有账号？" : "已有账号？", " ", _jsx("button", { type: "button", className: "font-medium text-foreground underline underline-offset-4", onClick: toggleMode, children: mode === "login" ? "注册" : "登录" })] })] })] }) }) })] }), _jsx(FieldDescription, { className: "px-6 text-center", children: "\u652F\u6301\u5BC6\u7801\u3001Passkey \u548C OAuth \u767B\u5F55\u65B9\u5F0F\u3002" })] }) }) }));
}
