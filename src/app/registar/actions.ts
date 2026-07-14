"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type StrapiRegisterResponse = {
    jwt: string;
    user: {
        id: number;
        username: string;
        email: string;
    };
};

export async function registarAction(formData: FormData) {
    const username = String(formData.get("username") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();
    const confirmarPassword = String(
        formData.get("confirmarPassword") || ""
    ).trim();

    if (!username || !email || !password || !confirmarPassword) {
        redirect("/registar?error=missing");
    }

    if (password.length < 6) {
        redirect("/registar?error=password-length");
    }

    if (password !== confirmarPassword) {
        redirect("/registar?error=password-match");
    }

    const resposta = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/local/register`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username,
                email,
                password,
            }),
            cache: "no-store",
        }
    );

    if (!resposta.ok) {
        redirect("/registar?error=register");
    }

    const resultado: StrapiRegisterResponse = await resposta.json();

    const cookieStore = await cookies();

    cookieStore.set("strapi_jwt", resultado.jwt, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    });

    redirect("/area-utilizador");
}