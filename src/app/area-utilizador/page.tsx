import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logoutAction } from "../logout/actions";
import Link from "next/link";

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

export default async function AreaUtilizadorPage({
                                                     searchParams,
                                                 }: {
    searchParams: Promise<{ error?: string }>;
}) {
    const { error } = await searchParams;
    const utilizador = await obterUtilizadorAtual();

    if (!utilizador) {
        redirect("/login");
    }

    return (
        <main className="py-5">
            <div className="container" style={{ maxWidth: "700px" }}>
                {error === "sem-permissao" && (
                    <div className="alert alert-danger">
                        Não tens permissões para aceder ao painel de administração.
                    </div>
                )}
                <div className="card shadow-sm">
                    <div className="card-body p-4">
                        <h1 className="mb-3">Área do Utilizador</h1>

                        <p className="mb-1">
                            <strong>Username:</strong> {utilizador.username}
                        </p>

                        <p className="mb-4">
                            <strong>Email:</strong> {utilizador.email}
                        </p>

                        <div className="d-flex gap-2 flex-wrap">
                            <Link href="/" className="btn btn-primary">
                                Voltar aos eventos
                            </Link>

                            <Link href="/admin" className="btn btn-outline-primary">
                                Painel admin
                            </Link>

                            <form action={logoutAction}>
                                <button type="submit" className="btn btn-outline-danger">
                                    Terminar sessão
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}