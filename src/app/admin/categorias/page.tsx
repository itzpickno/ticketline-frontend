import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
    apagarCategoriaAction,
    criarCategoriaAction,
    editarCategoriaAction,
} from "./actions";

type Evento = {
    documentId: string;
    Nome: string;
};

type Categoria = {
    documentId: string;
    name: string;
    slug?: string | null;
    description?: string | null;
    eventos?: Evento[];
};

type RespostaCategorias = {
    data: Categoria[];
};

type RespostaEventos = {
    data: Evento[];
};

async function obterToken() {
    const cookieStore = await cookies();
    const token = cookieStore.get("strapi_jwt")?.value;

    if (!token) {
        redirect("/login");
    }

    return token;
}

async function obterCategorias(): Promise<Categoria[]> {
    const token = await obterToken();

    const resposta = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/categories?populate=eventos&sort=name:asc`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        }
    );

    if (!resposta.ok) {
        throw new Error("Não foi possível carregar as categorias.");
    }

    const resultado: RespostaCategorias = await resposta.json();

    return resultado.data;
}

async function obterEventos(): Promise<Evento[]> {
    const token = await obterToken();

    const resposta = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/eventos?sort=Nome:asc`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        }
    );

    if (!resposta.ok) {
        throw new Error("Não foi possível carregar os eventos.");
    }

    const resultado: RespostaEventos = await resposta.json();

    return resultado.data;
}

function categoriaTemEvento(categoria: Categoria, eventoDocumentId: string) {
    return Boolean(
        categoria.eventos?.some((evento) => evento.documentId === eventoDocumentId)
    );
}

export default async function AdminCategoriasPage({
                                                      searchParams,
                                                  }: {
    searchParams: Promise<{ success?: string; error?: string }>;
}) {
    const [categorias, eventos] = await Promise.all([
        obterCategorias(),
        obterEventos(),
    ]);

    const { success, error } = await searchParams;

    return (
        <main className="py-5">
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="mb-1">Gerir Categorias</h1>
                        <p className="text-muted mb-0">
                            Criar, editar e apagar categorias dos eventos.
                        </p>
                    </div>

                    <Link href="/admin" className="btn btn-outline-secondary">
                        Voltar ao painel
                    </Link>
                </div>

                {success === "create" && (
                    <div className="alert alert-success">
                        Categoria criada com sucesso.
                    </div>
                )}

                {success === "edit" && (
                    <div className="alert alert-success">
                        Categoria editada com sucesso.
                    </div>
                )}

                {success === "delete" && (
                    <div className="alert alert-success">
                        Categoria apagada com sucesso.
                    </div>
                )}

                {error === "required" && (
                    <div className="alert alert-warning">
                        O nome da categoria é obrigatório.
                    </div>
                )}

                {error && error !== "required" && (
                    <div className="alert alert-danger">
                        Ocorreu um erro. Confirma as permissões no Strapi e tenta novamente.
                    </div>
                )}

                <div className="card shadow-sm mb-5">
                    <div className="card-body">
                        <h2 className="h4 mb-3">Criar nova categoria</h2>

                        <form action={criarCategoriaAction}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label htmlFor="name" className="form-label">
                                        Nome
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        className="form-control"
                                        placeholder="Concerto"
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label htmlFor="slug" className="form-label">
                                        Slug
                                    </label>
                                    <input
                                        id="slug"
                                        name="slug"
                                        type="text"
                                        className="form-control"
                                        placeholder="concerto"
                                    />
                                    <small className="text-muted">
                                        Se deixares vazio, é gerado automaticamente.
                                    </small>
                                </div>

                                <div className="col-12">
                                    <label htmlFor="description" className="form-label">
                                        Descrição
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        className="form-control"
                                        rows={3}
                                        placeholder="Descrição da categoria"
                                    />
                                </div>

                                <div className="col-12">
                                    <label className="form-label">Eventos associados</label>

                                    {eventos.length === 0 ? (
                                        <p className="text-muted">
                                            Ainda não existem eventos para associar.
                                        </p>
                                    ) : (
                                        <div className="row">
                                            {eventos.map((evento) => (
                                                <div className="col-md-4" key={evento.documentId}>
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id={`novo-${evento.documentId}`}
                                                            name="eventos"
                                                            value={evento.documentId}
                                                        />
                                                        <label
                                                            className="form-check-label"
                                                            htmlFor={`novo-${evento.documentId}`}
                                                        >
                                                            {evento.Nome}
                                                        </label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="col-12">
                                    <button type="submit" className="btn btn-primary">
                                        Criar categoria
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <h2 className="h4 mb-3">Categorias existentes</h2>

                {categorias.length === 0 && (
                    <div className="alert alert-info">Ainda não existem categorias.</div>
                )}

                <div className="row g-4">
                    {categorias.map((categoria) => (
                        <div className="col-lg-6" key={categoria.documentId}>
                            <div className="card shadow-sm h-100">
                                <div className="card-body">
                                    <form action={editarCategoriaAction}>
                                        <input
                                            type="hidden"
                                            name="documentId"
                                            value={categoria.documentId}
                                        />

                                        <div className="mb-3">
                                            <label className="form-label">Nome</label>
                                            <input
                                                name="name"
                                                type="text"
                                                className="form-control"
                                                defaultValue={categoria.name}
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Slug</label>
                                            <input
                                                name="slug"
                                                type="text"
                                                className="form-control"
                                                defaultValue={categoria.slug || ""}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Descrição</label>
                                            <textarea
                                                name="description"
                                                className="form-control"
                                                rows={3}
                                                defaultValue={categoria.description || ""}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Eventos associados</label>

                                            {eventos.length === 0 ? (
                                                <p className="text-muted">
                                                    Ainda não existem eventos.
                                                </p>
                                            ) : (
                                                <div className="row">
                                                    {eventos.map((evento) => (
                                                        <div
                                                            className="col-md-6"
                                                            key={evento.documentId}
                                                        >
                                                            <div className="form-check">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    id={`${categoria.documentId}-${evento.documentId}`}
                                                                    name="eventos"
                                                                    value={evento.documentId}
                                                                    defaultChecked={categoriaTemEvento(
                                                                        categoria,
                                                                        evento.documentId
                                                                    )}
                                                                />
                                                                <label
                                                                    className="form-check-label"
                                                                    htmlFor={`${categoria.documentId}-${evento.documentId}`}
                                                                >
                                                                    {evento.Nome}
                                                                </label>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="mb-3">
                                            <strong>Eventos atuais:</strong>{" "}
                                            {categoria.eventos && categoria.eventos.length > 0 ? (
                                                categoria.eventos.map((evento) => (
                                                    <span
                                                        className="badge text-bg-secondary me-2"
                                                        key={evento.documentId}
                                                    >
                            {evento.Nome}
                          </span>
                                                ))
                                            ) : (
                                                <span className="text-muted">
                          Sem eventos associados
                        </span>
                                            )}
                                        </div>

                                        <button type="submit" className="btn btn-success">
                                            Guardar alterações
                                        </button>
                                    </form>

                                    <form action={apagarCategoriaAction} className="mt-3">
                                        <input
                                            type="hidden"
                                            name="documentId"
                                            value={categoria.documentId}
                                        />

                                        <button type="submit" className="btn btn-outline-danger">
                                            Apagar categoria
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}