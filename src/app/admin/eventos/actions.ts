"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function obterToken() {
    const cookieStore = await cookies();
    const token = cookieStore.get("strapi_jwt")?.value;

    if (!token) {
        redirect("/login");
    }

    return token;
}

function prepararData(data: FormDataEntryValue | null) {
    const valor = String(data || "").trim();

    if (!valor) {
        return null;
    }

    return new Date(valor).toISOString();
}

export async function criarEventoAction(formData: FormData) {
    const token = await obterToken();

    const Nome = String(formData.get("Nome") || "").trim();
    const Descricao = String(formData.get("Descricao") || "").trim();
    const Localizacao = String(formData.get("Localizacao") || "").trim();
    const Data = prepararData(formData.get("Data"));

    if (!Nome) {
        redirect("/admin/eventos?error=nome");
    }

    const resposta = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/eventos`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                data: {
                    Nome,
                    Descricao,
                    Localizacao,
                    Data,
                },
            }),
        }
    );

    if (!resposta.ok) {
        redirect("/admin/eventos?error=create");
    }

    revalidatePath("/admin/eventos");
    revalidatePath("/");
    redirect("/admin/eventos?success=create");
}

export async function editarEventoAction(formData: FormData) {
    const token = await obterToken();

    const documentId = String(formData.get("documentId") || "").trim();
    const Nome = String(formData.get("Nome") || "").trim();
    const Descricao = String(formData.get("Descricao") || "").trim();
    const Localizacao = String(formData.get("Localizacao") || "").trim();
    const Data = prepararData(formData.get("Data"));

    if (!documentId || !Nome) {
        redirect("/admin/eventos?error=edit");
    }

    const resposta = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/eventos/${documentId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                data: {
                    Nome,
                    Descricao,
                    Localizacao,
                    Data,
                },
            }),
        }
    );

    if (!resposta.ok) {
        redirect("/admin/eventos?error=edit");
    }

    revalidatePath("/admin/eventos");
    revalidatePath("/");
    revalidatePath(`/eventos/${documentId}`);
    redirect("/admin/eventos?success=edit");
}

export async function apagarEventoAction(formData: FormData) {
    const token = await obterToken();

    const documentId = String(formData.get("documentId") || "").trim();

    if (!documentId) {
        redirect("/admin/eventos?error=delete");
    }

    const resposta = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/eventos/${documentId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!resposta.ok) {
        redirect("/admin/eventos?error=delete");
    }

    revalidatePath("/admin/eventos");
    revalidatePath("/");
    redirect("/admin/eventos?success=delete");
}