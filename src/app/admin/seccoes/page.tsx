import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
    apagarSeccaoAction,
    criarSeccaoAction,
    editarSeccaoAction,
} from "./actions";

type Evento = {
    documentId: string;
    Nome: string;
};

type Seccao = {
    documentId: string;
    Nome: string;
    Descricao?: string | null;
    Capacidade?: number | null;
    evento?: Evento | null;
};

type RespostaSeccoes = {
    data: Seccao[];
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

async function obterSeccoes(): Promise<Seccao[]> {
    const token = await obterToken();

    const resposta = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/seccoes?populate=evento&sort=createdAt:desc`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        }
    );

    if (!resposta.ok) {
        throw new Error("Não foi possível carregar as secções.");
    }

    const resultado: RespostaSeccoes = await resposta.json();

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

export default async function AdminSeccoesPage({
                                                   searchParams,
                                               }: {
    searchParams: Promise<{ success?: string; error?: string }>;
}) {
    const [seccoes, eventos] = await Promise.all([
        obterSeccoes(),
        obterEventos(),
    ]);

    const { success, error } = await searchParams;

    return (
        <main className="py-5">
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="mb-1">Gerir Secções</h1>
                        <p className="text-muted mb-0">
                            Criar, editar e apagar secções associadas aos eventos.
                        </p>
                    </div>

                    <Link href="/admin" className="btn btn-outline-secondary">
                        Voltar ao painel
                    </Link>
                </div>

                {success === "create" && (
                    <div className="alert alert-success">Secção criada com sucesso.</div>
                )}

                {success === "edit" && (
                    <div className="alert alert-success">Secção editada com sucesso.</div>
                )}

                {success === "delete" && (
                    <div className="alert alert-success">Secção apagada com sucesso.</div>
                )}

                {error === "required" && (
                    <div className="alert alert-warning">
                        O nome da secção e o evento são obrigatórios.
                    </div>
                )}

                {error && error !== "required" && (
                    <div className="alert alert-danger">
                        Ocorreu um erro. Confirma as permissões no Strapi e tenta novamente.
                    </div>
                )}

                <div className="card shadow-sm mb-5">
                    <div className="card-body">
                        <h2 className="h4 mb-3">Criar nova secção</h2>

                        {eventos.length === 0 ? (
                            <div className="alert alert-warning">
                                Ainda não existem eventos. Cria primeiro um evento antes de
                                criares secções.
                            </div>
                        ) : (
                            <form action={criarSeccaoAction}>
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
                                            placeholder="Secção A1"
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label htmlFor="Capacidade" className="form-label">
                                            Capacidade
                                        </label>
                                        <input
                                            id="Capacidade"
                                            name="Capacidade"
                                            type="number"
                                            className="form-control"
                                            min="0"
                                            placeholder="200"
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label htmlFor="eventoDocumentId" className="form-label">
                                            Evento
                                        </label>
                                        <select
                                            id="eventoDocumentId"
                                            name="eventoDocumentId"
                                            className="form-select"
                                            required
                                            defaultValue=""
                                        >
                                            <option value="" disabled>
                                                Escolhe um evento
                                            </option>

                                            {eventos.map((evento) => (
                                                <option
                                                    value={evento.documentId}
                                                    key={evento.documentId}
                                                >
                                                    {evento.Nome}
                                                </option>
                                            ))}
                                        </select>
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
                                            placeholder="Descrição da secção"
                                        />
                                    </div>

                                    <div className="col-12">
                                        <button type="submit" className="btn btn-primary">
                                            Criar secção
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                <h2 className="h4 mb-3">Secções existentes</h2>

                {seccoes.length === 0 && (
                    <div className="alert alert-info">Ainda não existem secções.</div>
                )}

                <div className="row g-4">
                    {seccoes.map((seccao) => (
                        <div className="col-lg-6" key={seccao.documentId}>
                            <div className="card shadow-sm h-100">
                                <div className="card-body">
                                    <form action={editarSeccaoAction}>
                                        <input
                                            type="hidden"
                                            name="documentId"
                                            value={seccao.documentId}
                                        />

                                        <div className="mb-3">
                                            <label className="form-label">Nome</label>
                                            <input
                                                name="Nome"
                                                type="text"
                                                className="form-control"
                                                defaultValue={seccao.Nome}
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Capacidade</label>
                                            <input
                                                name="Capacidade"
                                                type="number"
                                                className="form-control"
                                                min="0"
                                                defaultValue={seccao.Capacidade ?? ""}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Evento</label>
                                            <select
                                                name="eventoDocumentId"
                                                className="form-select"
                                                required
                                                defaultValue={seccao.evento?.documentId ?? ""}
                                            >
                                                <option value="" disabled>
                                                    Escolhe um evento
                                                </option>

                                                {eventos.map((evento) => (
                                                    <option
                                                        value={evento.documentId}
                                                        key={evento.documentId}
                                                    >
                                                        {evento.Nome}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Descrição</label>
                                            <textarea
                                                name="Descricao"
                                                className="form-control"
                                                rows={3}
                                                defaultValue={seccao.Descricao || ""}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <strong>Evento atual:</strong>{" "}
                                            {seccao.evento ? (
                                                <span>{seccao.evento.Nome}</span>
                                            ) : (
                                                <span className="text-muted">Sem evento associado</span>
                                            )}
                                        </div>

                                        <div className="d-flex gap-2 flex-wrap">
                                            <button type="submit" className="btn btn-success">
                                                Guardar alterações
                                            </button>

                                            {seccao.evento && (
                                                <Link
                                                    href={`/eventos/${seccao.evento.documentId}`}
                                                    className="btn btn-outline-primary"
                                                >
                                                    Ver evento
                                                </Link>
                                            )}
                                        </div>
                                    </form>

                                    <form action={apagarSeccaoAction} className="mt-3">
                                        <input
                                            type="hidden"
                                            name="documentId"
                                            value={seccao.documentId}
                                        />

                                        <button type="submit" className="btn btn-outline-danger">
                                            Apagar secção
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