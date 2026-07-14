import Link from "next/link";
import { registarAction } from "./actions";

export default async function RegistarPage({
                                               searchParams,
                                           }: {
    searchParams: Promise<{ error?: string }>;
}) {
    const { error } = await searchParams;

    return (
        <main className="py-5">
            <div className="container" style={{ maxWidth: "550px" }}>
                <h1 className="mb-4">Criar conta</h1>

                {error === "missing" && (
                    <div className="alert alert-warning">
                        Preenche todos os campos.
                    </div>
                )}

                {error === "password-length" && (
                    <div className="alert alert-warning">
                        A password deve ter pelo menos 6 caracteres.
                    </div>
                )}

                {error === "password-match" && (
                    <div className="alert alert-warning">
                        As passwords não coincidem.
                    </div>
                )}

                {error === "register" && (
                    <div className="alert alert-danger">
                        Não foi possível criar a conta. O username ou email podem já estar
                        em uso.
                    </div>
                )}

                <form action={registarAction} className="card shadow-sm">
                    <div className="card-body">
                        <div className="mb-3">
                            <label htmlFor="username" className="form-label">
                                Nome de utilizador
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                className="form-control"
                                placeholder="ex: henrique"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className="form-control"
                                placeholder="exemplo@email.com"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                className="form-control"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="confirmarPassword" className="form-label">
                                Confirmar password
                            </label>
                            <input
                                id="confirmarPassword"
                                name="confirmarPassword"
                                type="password"
                                className="form-control"
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary w-100">
                            Criar conta
                        </button>
                    </div>
                </form>

                <div className="mt-3">
                    <Link href="/login">Já tenho conta</Link>
                </div>

                <div className="mt-2">
                    <Link href="/">Voltar aos eventos</Link>
                </div>
            </div>
        </main>
    );
}