import Link from "next/link";
import { notFound } from "next/navigation";

type Categoria = {
    documentId: string;
    name: string;
};

type Bilhete = {
    documentId: string;
    codigo?: string | null;
    preco?: number | null;
    Estado?: string | null;
};

type Seccao = {
    documentId: string;
    Nome: string;
    Descricao?: string | null;
    Capacidade?: number | null;
    bilhetes?: Bilhete[];
};

type Evento = {
    documentId: string;
    Nome: string;
    Descricao?: string | null;
    Data?: string | null;
    Localizacao?: string | null;
    categories?: Categoria[];
};

type RespostaEvento = {
    data: Evento | null;
};

type RespostaSeccoes = {
    data: Seccao[];
};

function formatarData(data?: string | null) {
    if (!data) {
        return "Data ainda não definida";
    }

    return new Intl.DateTimeFormat("pt-PT", {
        dateStyle: "full",
        timeStyle: "short",
    }).format(new Date(data));
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

async function obterEvento(documentId: string): Promise<Evento | null> {
    const resposta = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/eventos/${documentId}?populate=categories`,
        {
            cache: "no-store",
        }
    );

    if (resposta.status === 404) {
        return null;
    }

    if (!resposta.ok) {
        throw new Error("Não foi possível carregar o evento.");
    }

    const resultado: RespostaEvento = await resposta.json();

    return resultado.data;
}

async function obterSeccoesDoEvento(documentId: string): Promise<Seccao[]> {
    const resposta = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/seccoes?filters[evento][documentId][$eq]=${documentId}&populate=bilhetes`,
        {
            cache: "no-store",
        }
    );

    if (!resposta.ok) {
        throw new Error("Não foi possível carregar as secções do evento.");
    }

    const resultado: RespostaSeccoes = await resposta.json();

    return resultado.data;
}

export default async function PaginaEvento({
                                               params,
                                           }: {
    params: Promise<{ documentId: string }>;
}) {
    const { documentId } = await params;

    const evento = await obterEvento(documentId);

    if (!evento) {
        notFound();
    }

    const seccoes = await obterSeccoesDoEvento(documentId);

    return (
        <main className="py-5">
            <div className="container" style={{ maxWidth: "950px" }}>
                <Link href="/" className="btn btn-outline-secondary mb-4">
                    ← Voltar aos eventos
                </Link>

                <div className="card shadow-sm mb-4">
                    <div className="card-body p-4 p-md-5">
                        <h1 className="display-6 mb-4">{evento.Nome}</h1>

                        <p className="fs-5">
                            {evento.Descricao || "Este evento ainda não tem descrição."}
                        </p>

                        <hr className="my-4" />

                        <p className="mb-2">
                            <strong>Data:</strong> {formatarData(evento.Data)}
                        </p>

                        <p className="mb-4">
                            <strong>Localização:</strong>{" "}
                            {evento.Localizacao || "Local ainda não definido"}
                        </p>

                        <div>
                            <strong className="me-2">Categorias:</strong>

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
                                <span>Sem categorias associadas</span>
                            )}
                        </div>
                    </div>
                </div>

                <h2 className="mb-3">Secções e bilhetes</h2>

                {seccoes.length === 0 && (
                    <div className="alert alert-info">
                        Este evento ainda não tem secções associadas.
                    </div>
                )}

                {seccoes.map((seccao) => (
                    <div className="card shadow-sm mb-3" key={seccao.documentId}>
                        <div className="card-body">
                            <h3 className="h5">{seccao.Nome}</h3>

                            {seccao.Descricao && <p>{seccao.Descricao}</p>}

                            <p className="mb-3">
                                <strong>Capacidade:</strong>{" "}
                                {seccao.Capacidade ?? "Não definida"}
                            </p>

                            <h4 className="h6">Bilhetes</h4>

                            {!seccao.bilhetes || seccao.bilhetes.length === 0 ? (
                                <p className="text-muted">
                                    Ainda não existem bilhetes nesta secção.
                                </p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-striped table-bordered align-middle">
                                        <thead>
                                        <tr>
                                            <th>Código</th>
                                            <th>Preço</th>
                                            <th>Estado</th>
                                        </tr>
                                        </thead>

                                        <tbody>
                                        {seccao.bilhetes.map((bilhete) => (
                                            <tr key={bilhete.documentId}>
                                                <td>{bilhete.codigo || "Sem código"}</td>
                                                <td>{formatarPreco(bilhete.preco)}</td>
                                                <td>{bilhete.Estado || "Estado não definido"}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}