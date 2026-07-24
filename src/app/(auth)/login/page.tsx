"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotContact, setForgotContact] = useState("");
  const [forgotQr, setForgotQr] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/app_config?id=eq.1&select=*`, {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      },
    })
      .then((r) => r.json())
      .then((rows) => {
        if (rows?.[0]) {
          setForgotContact(rows[0].forgot_password_contact || "");
          setForgotQr(rows[0].forgot_password_qr_url);
        }
      })
      .catch(() => {
        setForgotContact("请联系作者微信重置密码");
      });
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-6 text-center text-2xl font-bold text-primary">登录</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <Label htmlFor="email">邮箱 (Email)</Label>
          <Input
            id="email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="请输入邮箱地址，如 xxx@qq.com"
            required
          />
        </div>
        <div>
          <Label htmlFor="password">密码</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "登录中…" : "登录"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-secondary">
        还没有账号？{" "}
        <Link href="/register" className="text-primary underline">
          注册
        </Link>
      </p>
      <button
        type="button"
        className="mt-3 w-full text-center text-sm text-muted underline"
        onClick={() => setShowForgot(true)}
      >
        忘记密码
      </button>

      {showForgot && (
        <div className="mt-4 rounded-card border border-border bg-card p-4">
          <p className="mb-2 text-sm text-primary">{forgotContact}</p>
          {forgotQr && (
            <div className="relative mx-auto h-40 w-40">
              <Image src={forgotQr} alt="联系二维码" fill unoptimized />
            </div>
          )}
          <Button variant="ghost" className="mt-2 w-full" onClick={() => setShowForgot(false)}>
            关闭
          </Button>
        </div>
      )}
    </div>
  );
}
