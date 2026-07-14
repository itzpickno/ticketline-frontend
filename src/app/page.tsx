"use client";

import { useEffect, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Badge from "react-bootstrap/Badge";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Spinner from "react-bootstrap/Spinner";
import Link from "next/link";

type Categoria = {
  documentId: string;
  name: string;
};

type Evento = {
  documentId: string;
  Nome: string;
  Descricao?: string;
  Data?: string | null;
  Localizacao?: string;
  categories?: Categoria[];
};

function formatarData(data?: string | null) {
  if (!data) return null;

  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(data));
}

export default function Home() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [aCarregar, setACarregar] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarEventos() {
      try {
        const resposta = await fetch(
            `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/eventos?populate=categories`
        );

        if (!resposta.ok) {
          throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        const resultado = await resposta.json();
        setEventos(resultado.data);
      } catch {
        setErro(
            "Não foi possível obter os eventos. Confirma se o Strapi está a correr e se as permissões públicas estão ativas."
        );
      } finally {
        setACarregar(false);
      }
    }

    carregarEventos();
  }, []);

  return (
      <main className="py-5">
        <Container>
          <header className="mb-5">
            <h1 className="display-5 fw-bold">TicketLine</h1>
            <p className="lead text-muted">
              Encontra eventos e compra os teus bilhetes.
            </p>
          </header>

          <div className="d-flex gap-2 mt-3">
            <Link href="/login" className="btn btn-outline-primary">
              Login
            </Link>

            <Link href="/area-utilizador" className="btn btn-primary">
              Área do utilizador
            </Link>
          </div>

          <h2 className="mb-4">Eventos disponíveis</h2>

          {aCarregar && (
              <div className="text-center py-5">
                <Spinner animation="border" role="status" />
                <p className="mt-3">A carregar eventos...</p>
              </div>
          )}

          {erro && <Alert variant="danger">{erro}</Alert>}

          {!aCarregar && !erro && eventos.length === 0 && (
              <Alert variant="info">
                Ainda não existem eventos publicados no Strapi.
              </Alert>
          )}

          <Row className="g-4">
            {eventos.map((evento) => (
                <Col key={evento.documentId} md={6} lg={4}>
                  <Card className="h-100 shadow-sm">
                    <Card.Body>
                      <Card.Title>{evento.Nome}</Card.Title>

                      {evento.Descricao && (
                          <Card.Text>{evento.Descricao}</Card.Text>
                      )}

                      {evento.Data && (
                          <Card.Text className="text-muted mb-1">
                            <strong>Data:</strong> {formatarData(evento.Data)}
                          </Card.Text>
                      )}

                      {evento.Localizacao && (
                          <Card.Text className="text-muted">
                            <strong>Local:</strong> {evento.Localizacao}
                          </Card.Text>
                      )}

                      {evento.categories?.map((categoria) => (
                          <Badge
                              bg="secondary"
                              className="me-2"
                              key={categoria.documentId}
                          >
                            {categoria.name}
                          </Badge>
                      ))}
                      <Link
                          href={`/eventos/${evento.documentId}`}
                          className="btn btn-primary mt-3"
                      >
                        Ver detalhes
                      </Link>
                    </Card.Body>
                  </Card>
                </Col>
            ))}
          </Row>
        </Container>
      </main>
  );
}