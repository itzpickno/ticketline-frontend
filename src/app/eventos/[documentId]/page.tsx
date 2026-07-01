import Link from "next/link";
import { notFound } from "next/navigation";

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

type RespostaStrapi = {
    data: Evento | null;
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

    const resultado: RespostaStrapi = await resposta.json();

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

    return (
        <main className="py-5">
            <div className="container" style={{ maxWidth: "850px" }}>
                <Link href="/" className="btn btn-outline-secondary mb-4">
                    ← Voltar aos eventos
                </Link>

                <div className="card shadow-sm">
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
            </div>
        </main>
    )
}