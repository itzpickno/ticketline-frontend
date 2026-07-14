import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
    apagarEventoAction,
    criarEventoAction,
    editarEventoAction,
} from "./actions";

type Categoria = {
    documentId: string;
    name: string;
};

type Evento = {
    documentId: string;
    Nome: string;
    Descricao?: string | null;
    Data?: string | null;
    Localizacao?: string | null;
    categories?: Categoria[];
};

type RespostaEventos = {
    data: Evento[];
};

function formatarDataParaInput(data?: string | null) {
    if (!data) {
        return "";
    }

    return data.slice(0, 16);
}

async function obterToken() {
    const cookieStore = await cookies();
    const token = cookieStore.get("strapi_jwt")?.value;

    if (!token) {
        redirect("/login");
    }

    return token;
}

async function obterEventos(): Promise<Evento[]> {
    const token = await obterToken();

    const resposta = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/eventos?populate=categories&sort=createdAt:desc`,
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

export default async function AdminEventosPage({
                                                   searchParams,
                                               }: {
    searchParams: Promise<{ success?: string; error?: string }>;
}) {
    const eventos = await obterEventos();
    const { success, error } = await searchParams;

    return (
        <main className="py-5">
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="mb-1">Gerir Eventos</h1>
                        <p className="text-muted mb-0">
                            Criar, editar e apagar eventos do TicketLine.
                        </p>
                    </div>

                    <Link href="/admin" className="btn btn-outline-secondary">
                        Voltar ao painel
                    </Link>
                </div>

                {success === "create" && (
                    <div className="alert alert-success">Evento criado com sucesso.</div>
                )}

                {success === "edit" && (
                    <div className="alert alert-success">Evento editado com sucesso.</div>
                )}

                {success === "delete" && (
                    <div className="alert alert-success">Evento apagado com sucesso.</div>
                )}

                {error && (
                    <div className="alert alert-danger">
                        Ocorreu um erro. Confirma as permissões no Strapi e tenta novamente.
                    </div>
                )}

                <div className="card shadow-sm mb-5">
                    <div className="card-body">
                        <h2 className="h4 mb-3">Criar novo evento</h2>

                        <form action={criarEventoAction}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label htmlFor="Nome" className="form-label">
                                        Nome
                                    </label>
                                    <input
                                        id="Nome"
                                        name="Nome"
                                        type="text"
                                        className="form-control"
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label htmlFor="Localizacao" className="form-label">
                                        Localização
                                    </label>
                                    <input
                                        id="Localizacao"
                                        name="Localizacao"
                                        type="text"
                                        className="form-control"
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label htmlFor="Data" className="form-label">
                                        Data
                                    </label>
                                    <input
                                        id="Data"
                                        name="Data"
                                        type="datetime-local"
                                        className="form-control"
                                    />
                                </div>

                                <div className="col-12">
                                    <label htmlFor="Descricao" className="form-label">
                                        Descrição
                                    </label>
                                    <textarea
                                        id="Descricao"
                                        name="Descricao"
                                        className="form-control"
                                        rows={3}
                                    />
                                </div>

                                <div className="col-12">
                                    <button type="submit" className="btn btn-primary">
                                        Criar evento
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <h2 className="h4 mb-3">Eventos existentes</h2>

                {eventos.length === 0 && (
                    <div className="alert alert-info">Ainda não existem eventos.</div>
                )}

                <div className="row g-4">
                    {eventos.map((evento) => (
                        <div className="col-lg-6" key={evento.documentId}>
                            <div className="card shadow-sm h-100">
                                <div className="card-body">
                                    <form action={editarEventoAction}>
                                        <input
                                            type="hidden"
                                            name="documentId"
                                            value={evento.documentId}
                                        />

                                        <div className="mb-3">
                                            <label className="form-label">Nome</label>
                                            <input
                                                name="Nome"
                                                type="text"
                                                className="form-control"
                                                defaultValue={evento.Nome}
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Localização</label>
                                            <input
                                                name="Localizacao"
                                                type="text"
                                                className="form-control"
                                                defaultValue={evento.Localizacao || ""}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Data</label>
                                            <input
                                                name="Data"
                                                type="datetime-local"
                                                className="form-control"
                                                defaultValue={formatarDataParaInput(evento.Data)}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Descrição</label>
                                            <textarea
                                                name="Descricao"
                                                className="form-control"
                                                rows={3}
                                                defaultValue={evento.Descricao || ""}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <strong>Categorias:</strong>{" "}
                                            {evento.categories && evento.categories.length > 0 ? (
                                                evento.categories.map((categoria) => (
                                                    <span
                                                        className="badge text-bg-secondary me-2"
                                                        key={categoria.documentId}
                                                    >
                            {categoria.name}
                          </span>
                                                ))
                                            ) : (
                                                <span className="text-muted">Sem categorias</span>
                                            )}
                                        </div>

                                        <div className="d-flex gap-2 flex-wrap">
                                            <button type="submit" className="btn btn-success">
                                                Guardar alterações
                                            </button>

                                            <Link
                                                href={`/eventos/${evento.documentId}`}
                                                className="btn btn-outline-primary"
                                            >
                                                Ver página
                                            </Link>
                                        </div>
                                    </form>

                                    <form action={apagarEventoAction} className="mt-3">
                                        <input
                                            type="hidden"
                                            name="documentId"
                                            value={evento.documentId}
                                        />

                                        <button type="submit" className="btn btn-outline-danger">
                                            Apagar evento
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