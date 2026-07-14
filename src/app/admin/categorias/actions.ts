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

function criarSlug(texto: string) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export async function criarCategoriaAction(formData: FormData) {
    const token = await obterToken();

    const name = String(formData.get("name") || "").trim();
    const slugManual = String(formData.get("slug") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const eventos = formData.getAll("eventos").map(String).filter(Boolean);

    if (!name) {
        redirect("/admin/categorias?error=required");
    }

    const slug = slugManual || criarSlug(name);

    const resposta = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/categories`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                data: {
                    name,
                    slug,
                    description,
                    eventos: {
                        connect: eventos,
                    },
                },
            }),
        }
    );

    if (!resposta.ok) {
        redirect("/admin/categorias?error=create");
    }

    revalidatePath("/admin/categorias");
    revalidatePath("/");
    redirect("/admin/categorias?success=create");
}

export async function editarCategoriaAction(formData: FormData) {
    const token = await obterToken();

    const documentId = String(formData.get("documentId") || "").trim();
    const name = String(formData.get("name") || "").trim();
    const slugManual = String(formData.get("slug") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const eventos = formData.getAll("eventos").map(String).filter(Boolean);

    if (!documentId || !name) {
        redirect("/admin/categorias?error=edit");
    }

    const slug = slugManual || criarSlug(name);

    const resposta = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/categories/${documentId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                data: {
                    name,
                    slug,
                    description,
                    eventos: {
                        set: eventos,
                    },
                },
            }),
        }
    );

    if (!resposta.ok) {
        redirect("/admin/categorias?error=edit");
    }

    revalidatePath("/admin/categorias");
    revalidatePath("/");
    redirect("/admin/categorias?success=edit");
}

export async function apagarCategoriaAction(formData: FormData) {
    const token = await obterToken();

    const documentId = String(formData.get("documentId") || "").trim();

    if (!documentId) {
        redirect("/admin/categorias?error=delete");
    }

    const resposta = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/categories/${documentId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!resposta.ok) {
        redirect("/admin/categorias?error=delete");
    }

    revalidatePath("/admin/categorias");
    revalidatePath("/");
    redirect("/admin/categorias?success=delete");
}