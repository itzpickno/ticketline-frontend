import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
    apagarBilheteAction,
    criarBilheteAction,
    editarBilheteAction,
} from "./actions";

type Evento = {
    documentId: string;
    Nome: string;
};

type Seccao = {
    documentId: string;
    Nome: string;
    evento?: Evento | null;
};

type Bilhete = {
    documentId: string;
    codigo?: string | null;
    preco?: number | null;
    Estado?: string | null;
    seccao?: Seccao | null;
};

type RespostaBilhetes = {
    data: Bilhete[];
};

type RespostaSeccoes = {
    data: Seccao[];
};

async function obterToken() {
    const cookieStore = await cookies();
    const token = cookieStore.get("strapi_jwt")?.value;

    if (!token) {
        redirect("/login");
    }

    return token;
}

function formatarPreco(preco?: number | null) {
    if (preco === null || preco === undefined) {
        return "Preço não definido";
    }

    return new Intl.NumberFormat("pt-PT", {
        style: "currency",
        currency: "EUR",
    }).format(preco);
}

async function obterBilhetes(): Promise<Bilhete[]> {
    const token = await obterToken();

    const resposta = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/bilhetes?populate=seccao&sort=createdAt:desc`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        }
    );

    if (!resposta.ok) {
        throw new Error("Não foi possível carregar os bilhetes.");
    }

    const resultado: RespostaBilhetes = await resposta.json();

    return resultado.data;
}

async function obterSeccoes(): Promise<Seccao[]> {
    const token = await obterToken();

    const resposta = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/seccoes?populate=evento&sort=Nome:asc`,
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

export default async function AdminBilhetesPage({
                                                    searchParams,
                                                }: {
    searchParams: Promise<{ success?: string; error?: string }>;
}) {
    const [bilhetes, seccoes] = await Promise.all([
        obterBilhetes(),
        obterSeccoes(),
    ]);

    const { success, error } = await searchParams;

    return (
        <main className="py-5">
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="mb-1">Gerir Bilhetes</h1>
                        <p className="text-muted mb-0">
                            Criar, editar e apagar bilhetes associados às secções.
                        </p>
                    </div>

                    <Link href="/admin" className="btn btn-outline-secondary">
                        Voltar ao painel
                    </Link>
                </div>

                {success === "create" && (
                    <div className="alert alert-success">Bilhete criado com sucesso.</div>
                )}

                {success === "edit" && (
                    <div className="alert alert-success">Bilhete editado com sucesso.</div>
                )}

                {success === "delete" && (
                    <div className="alert alert-success">Bilhete apagado com sucesso.</div>
                )}

                {error === "required" && (
                    <div className="alert alert-warning">
                        Código, preço, estado e secção são obrigatórios.
                    </div>
                )}

                {error && error !== "required" && (
                    <div className="alert alert-danger">
                        Ocorreu um erro. Confirma as permissões no Strapi e tenta novamente.
                    </div>
                )}

                <div className="card shadow-sm mb-5">
                    <div className="card-body">
                        <h2 className="h4 mb-3">Criar novo bilhete</h2>

                        {seccoes.length === 0 ? (
                            <div className="alert alert-warning">
                                Ainda não existem secções. Cria primeiro uma secção antes de
                                criares bilhetes.
                            </div>
                        ) : (
                            <form action={criarBilheteAction}>
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <label htmlFor="codigo" className="form-label">
                                            Código
                                        </label>
                                        <input
                                            id="codigo"
                                            name="codigo"
                                            type="text"
                                            className="form-control"
                                            placeholder="BILHETE-001"
                                            required
                                        />
                                    </div>

                                    <div className="col-md-4">
                                        <label htmlFor="preco" className="form-label">
                                            Preço
                                        </label>
                                        <input
                                            id="preco"
                                            name="preco"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            className="form-control"
                                            placeholder="45"
                                            required
                                        />
                                    </div>

                                    <div className="col-md-4">
                                        <label htmlFor="Estado" className="form-label">
                                            Estado
                                        </label>
                                        <select
                                            id="Estado"
                                            name="Estado"
                                            className="form-select"
                                            defaultValue="Disponivel"
                                            required
                                        >
                                            <option value="Disponivel">Disponível</option>
                                            <option value="Reservado">Reservado</option>
                                            <option value="Vendido">Vendido</option>
                                        </select>
                                    </div>

                                    <div className="col-md-6">
                                        <label htmlFor="seccaoDocumentId" className="form-label">
                                            Secção
                                        </label>
                                        <select
                                            id="seccaoDocumentId"
                                            name="seccaoDocumentId"
                                            className="form-select"
                                            defaultValue=""
                                            required
                                        >
                                            <option value="" disabled>
                                                Escolhe uma secção
                                            </option>

                                            {seccoes.map((seccao) => (
                                                <option
                                                    value={seccao.documentId}
                                                    key={seccao.documentId}
                                                >
                                                    {seccao.Nome}
                                                    {seccao.evento ? ` — ${seccao.evento.Nome}` : ""}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-12">
                                        <button type="submit" className="btn btn-primary">
                                            Criar bilhete
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                <h2 className="h4 mb-3">Bilhetes existentes</h2>

                {bilhetes.length === 0 && (
                    <div className="alert alert-info">Ainda não existem bilhetes.</div>
                )}

                <div className="row g-4">
                    {bilhetes.map((bilhete) => (
                        <div className="col-lg-6" key={bilhete.documentId}>
                            <div className="card shadow-sm h-100">
                                <div className="card-body">
                                    <form action={editarBilheteAction}>
                                        <input
                                            type="hidden"
                                            name="documentId"
                                            value={bilhete.documentId}
                                        />

                                        <div className="mb-3">
                                            <label className="form-label">Código</label>
                                            <input
                                                name="codigo"
                                                type="text"
                                                className="form-control"
                                                defaultValue={bilhete.codigo || ""}
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Preço</label>
                                            <input
                                                name="preco"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                className="form-control"
                                                defaultValue={bilhete.preco ?? ""}
                                                required
                                            />
                                            <small className="text-muted">
                                                Atual: {formatarPreco(bilhete.preco)}
                                            </small>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Estado</label>
                                            <select
                                                name="Estado"
                                                className="form-select"
                                                defaultValue={bilhete.Estado || "Disponivel"}
                                                required
                                            >
                                                <option value="Disponivel">Disponível</option>
                                                <option value="Reservado">Reservado</option>
                                                <option value="Vendido">Vendido</option>
                                            </select>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Secção</label>
                                            <select
                                                name="seccaoDocumentId"
                                                className="form-select"
                                                defaultValue={bilhete.seccao?.documentId ?? ""}
                                                required
                                            >
                                                <option value="" disabled>
                                                    Escolhe uma secção
                                                </option>

                                                {seccoes.map((seccao) => (
                                                    <option
                                                        value={seccao.documentId}
                                                        key={seccao.documentId}
                                                    >
                                                        {seccao.Nome}
                                                        {seccao.evento ? ` — ${seccao.evento.Nome}` : ""}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="mb-3">
                                            <strong>Secção atual:</strong>{" "}
                                            {bilhete.seccao ? (
                                                <span>{bilhete.seccao.Nome}</span>
                                            ) : (
                                                <span className="text-muted">Sem secção associada</span>
                                            )}
                                        </div>

                                        <button type="submit" className="btn btn-success">
                                            Guardar alterações
                                        </button>
                                    </form>

                                    <form action={apagarBilheteAction} className="mt-3">
                                        <input
                                            type="hidden"
                                            name="documentId"
                                            value={bilhete.documentId}
                                        />

                                        <button type="submit" className="btn btn-outline-danger">
                                            Apagar bilhete
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