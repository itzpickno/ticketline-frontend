import Link from "next/link";
import { cookies } from "next/headers";
import { requireGestor } from "@/lib/auth";

type UserMe = {
    id: number;
    username: string;
    email: string;
};

async function obterUtilizadorAtual(): Promise<UserMe | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get("strapi_jwt")?.value;

    if (!token) {
        return null;
    }

    const resposta = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        }
    );

    if (!resposta.ok) {
        return null;
    }

    return resposta.json();
}

export default async function AdminPage() {
    const utilizador = await requireGestor();

    return (
        <main className="py-5">
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="mb-1">Painel de Administração</h1>
                        <p className="text-muted mb-0">
                            Sessão iniciada como <strong>{utilizador.username}</strong>
                        </p>
                    </div>

                    <Link href="/" className="btn btn-outline-secondary">
                        Voltar aos eventos
                    </Link>
                </div>

                <div className="row g-4">
                    <div className="col-md-6 col-lg-3">
                        <div className="card shadow-sm h-100">
                            <div className="card-body">
                                <h2 className="h5">Eventos</h2>
                                <p className="text-muted">
                                    Criar, editar e apagar eventos.
                                </p>
                                <Link href="/admin/eventos" className="btn btn-primary">
                                    Gerir eventos
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6 col-lg-3">
                        <div className="card shadow-sm h-100">
                            <div className="card-body">
                                <h2 className="h5">Secções</h2>
                                <p className="text-muted">
                                    Gerir secções associadas aos eventos.
                                </p>
                                <Link href="/admin/seccoes" className="btn btn-primary">
                                    Gerir secções
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6 col-lg-3">
                        <div className="card shadow-sm h-100">
                            <div className="card-body">
                                <h2 className="h5">Bilhetes</h2>
                                <p className="text-muted">
                                    Gerir preços, estados e secções.
                                </p>
                                <Link href="/admin/bilhetes" className="btn btn-primary">
                                    Gerir bilhetes
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6 col-lg-3">
                        <div className="card shadow-sm h-100">
                            <div className="card-body">
                                <h2 className="h5">Categorias</h2>
                                <p className="text-muted">
                                    Gerir categorias dos eventos.
                                </p>
                                <Link href="/admin/categorias" className="btn btn-primary">
                                    Gerir categorias
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="alert alert-warning mt-4">
                    Esta área ainda está protegida apenas por login. Mais tarde vamos
                    limitar o acesso apenas a administradores.
                </div>
            </div>
        </main>
    );
}