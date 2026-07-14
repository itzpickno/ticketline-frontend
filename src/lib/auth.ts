import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type UtilizadorAtual = {
    id: number;
    username: string;
    email: string;
    role?: {
        id: number;
        name: string;
        type?: string;
    };
};

export async function obterTokenAtual() {
    const cookieStore = await cookies();
    return cookieStore.get("strapi_jwt")?.value ?? null;
}

export async function obterUtilizadorAtual(): Promise<UtilizadorAtual | null> {
    const token = await obterTokenAtual();

    if (!token) {
        return null;
    }

    const resposta = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me?populate=role`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        }
    );

    if (!resposta.ok) {
        return null;
    }

    return resposta.json();
}

export async function requireLogin() {
    const utilizador = await obterUtilizadorAtual();

    if (!utilizador) {
        redirect("/login");
    }

    return utilizador;
}

export async function requireGestor() {
    const utilizador = await requireLogin();

    const roleName = utilizador.role?.name?.toLowerCase();
    const roleType = utilizador.role?.type?.toLowerCase();

    const podeGerir =
        roleName === "gestor" ||
        roleName === "admin" ||
        roleName === "administrador" ||
        roleType === "gestor";

    if (!podeGerir) {
        redirect("/area-utilizador?error=sem-permissao");
    }

    return utilizador;
}