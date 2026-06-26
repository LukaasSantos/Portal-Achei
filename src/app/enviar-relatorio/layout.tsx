import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal.Achei - Formulário Semanal",
  description: "Envio de Relatório Comercial & Tráfego",
};

export default function EnviarRelatorioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
