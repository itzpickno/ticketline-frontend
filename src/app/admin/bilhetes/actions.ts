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

function obterPreco(valor: FormDataEntryValue | null) {
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

export async function criarBilheteAction(formData: FormData) {
    const token = await obterToken();

    const codigo = String(formData.get("codigo") || "").trim();
    const preco = obterPreco(formData.get("preco"));
    const Estado = String(formData.get("Estado") || "").trim();
    const seccaoDocumentId = String(formData.get("seccaoDocumentId") || "").trim();

    if (!codigo || preco === null || !Estado || !seccaoDocumentId) {
        redirect("/admin/bilhetes?error=required");
    }

    const resposta = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/bilhetes`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                data: {
                    codigo,
                    preco,
                    Estado,
                    seccao: {
                        connect: [seccaoDocumentId],
                    },
                },
            }),
        }
    );

    if (!resposta.ok) {
        redirect("/admin/bilhetes?error=create");
    }

    revalidatePath("/admin/bilhetes");
    revalidatePath("/");
    redirect("/admin/bilhetes?success=create");
}

export async function editarBilheteAction(formData: FormData) {
    const token = await obterToken();

    const documentId = String(formData.get("documentId") || "").trim();
    const codigo = String(formData.get("codigo") || "").trim();
    const preco = obterPreco(formData.get("preco"));
    const Estado = String(formData.get("Estado") || "").trim();
    const seccaoDocumentId = String(formData.get("seccaoDocumentId") || "").trim();

    if (!documentId || !codigo || preco === null || !Estado || !seccaoDocumentId) {
        redirect("/admin/bilhetes?error=edit");
    }

    const resposta = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/bilhetes/${documentId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                data: {
                    codigo,
                    preco,
                    Estado,
                    seccao: {
                        set: [seccaoDocumentId],
                    },
                },
            }),
        }
    );

    if (!resposta.ok) {
        redirect("/admin/bilhetes?error=edit");
    }

    revalidatePath("/admin/bilhetes");
    revalidatePath("/");
    redirect("/admin/bilhetes?success=edit");
}

export async function apagarBilheteAction(formData: FormData) {
    const token = await obterToken();

    const documentId = String(formData.get("documentId") || "").trim();

    if (!documentId) {
        redirect("/admin/bilhetes?error=delete");
    }

    const resposta = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/bilhetes/${documentId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!resposta.ok) {
        redirect("/admin/bilhetes?error=delete");
    }

    revalidatePath("/admin/bilhetes");
    revalidatePath("/");
    redirect("/admin/bilhetes?success=delete");
}