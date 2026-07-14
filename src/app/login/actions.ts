"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type StrapiLoginResponse = {
    jwt: string;
    user: {
        id: number;
        documentId?: string;
        username: string;
        email: string;
    };
};

export async function loginAction(formData: FormData) {
    const identifier = String(formData.get("identifier") || "").trim();
    const password = String(formData.get("password") || "").trim();

    if (!identifier || !password) {
        redirect("/login?error=missing");
    }

    const resposta = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/local`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                identifier,
                password,
            }),
            cache: "no-store",
        }
    );

    if (!resposta.ok) {
        redirect("/login?error=invalid");
    }

    const resultado: StrapiLoginResponse = await resposta.json();

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