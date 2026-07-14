import { loginAction } from "./actions";

export default async function LoginPage({
                                            searchParams,
                                        }: {
    searchParams: Promise<{ error?: string }>;
}) {
    const { error } = await searchParams;

    return (
        <main className="py-5">
            <div className="container" style={{ maxWidth: "500px" }}>
                <h1 className="mb-4">Login</h1>

                {error === "missing" && (
                    <div className="alert alert-warning">
                        Preenche o utilizador e a password.
                    </div>
                )}

                {error === "invalid" && (
                    <div className="alert alert-danger">
                        Utilizador ou password inválidos.
                    </div>
                )}

                <form action={loginAction} className="card shadow-sm">
                    <div className="card-body">
                        <div className="mb-3">
                            <label htmlFor="identifier" className="form-label">
                                Utilizador ou email
                            </label>
                            <input
                                id="identifier"
                                name="identifier"
                                type="text"
                                className="form-control"
                                placeholder="jotal96"
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
                                placeholder="Password"
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary w-100">
                            Entrar
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}