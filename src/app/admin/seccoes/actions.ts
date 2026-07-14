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

function obterCapacidade(valor: FormDataEntryValue | null) {
    const texto = String(valor || "").trim();

    if (!texto) {
        return null;
    }

    const numero = Number(texto);

    if (Number.isNaN(numero)) {
        return null;
    }

    return numero;
}

export async function criarSeccaoAction(formData: FormData) {
    const token = await obterToken();

    const Nome = String(formData.get("Nome") || "").trim();
    const Descricao = String(formData.get("Descricao") || "").trim();
    const Capacidade = obterCapacidade(formData.get("Capacidade"));
    const eventoDocumentId = String(formData.get("eventoDocumentId") || "").trim();

    if (!Nome || !eventoDocumentId) {
        redirect("/admin/seccoes?error=required");
    }

    const resposta = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/seccoes`,
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
                    Capacidade,
                    evento: eventoDocumentId,
                },
            }),
        }
    );

    if (!resposta.ok) {
        redirect("/admin/seccoes?error=create");
    }

    revalidatePath("/admin/seccoes");
    revalidatePath("/");
    redirect("/admin/seccoes?success=create");
}

export async function editarSeccaoAction(formData: FormData) {
    const token = await obterToken();

    const documentId = String(formData.get("documentId") || "").trim();
    const Nome = String(formData.get("Nome") || "").trim();
    const Descricao = String(formData.get("Descricao") || "").trim();
    const Capacidade = obterCapacidade(formData.get("Capacidade"));
    const eventoDocumentId = String(formData.get("eventoDocumentId") || "").trim();

    if (!documentId || !Nome || !eventoDocumentId) {
        redirect("/admin/seccoes?error=edit");
    }

    const resposta = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/seccoes/${documentId}`,
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
                    Capacidade,
                    evento: eventoDocumentId,
                },
            }),
        }
    );

    if (!resposta.ok) {
        redirect("/admin/seccoes?error=edit");
    }

    revalidatePath("/admin/seccoes");
    revalidatePath("/");
    redirect("/admin/seccoes?success=edit");
}

export async function apagarSeccaoAction(formData: FormData) {
    const token = await obterToken();

    const documentId = String(formData.get("documentId") || "").trim();

    if (!documentId) {
        redirect("/admin/seccoes?error=delete");
    }

    const resposta = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/seccoes/${documentId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!resposta.ok) {
        redirect("/admin/seccoes?error=delete");
    }

    revalidatePath("/admin/seccoes");
    revalidatePath("/");
    redirect("/admin/seccoes?success=delete");
}