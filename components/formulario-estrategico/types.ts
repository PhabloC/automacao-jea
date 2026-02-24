export type NivelCurso = "Iniciante" | "Intermediário" | "Avançado";
export type ModalidadeCurso = "Ao vivo" | "Gravado" | "Híbrido";
export type PfPj = "PF" | "PJ" | "Ambos";

export interface FormularioEstrategicoData {
  // Etapa 1 - Visão geral
  nomeOficialCurso: string;
  subtituloPromessa: string;
  problemaEspecifico: string;
  transformacaoConcreta: string;
  nivel: NivelCurso;
  modalidade: ModalidadeCurso;
  cargaHoraria: string;
  certificacao: string;
  diferenciaisReais: string;
  porQueMelhorQueYoutube: string;
  // Etapa 2 - Posicionamento
  alunoIdeal: string;
  cargo: string;
  area: string;
  nivelExperiencia: string;
  faixaSalarial: string;
  jaTentouResolver: string;
  maiorDorEmocional: string;
  maiorMedo: string;
  oQueFariaAdiar: string;
  pfPjOuAmbos: PfPj;
  focoDiversidadeBolsas: string;
  // Etapa 3 - Oferta
  valorCheio: string;
  valorPromocional: string;
  parcelamento: string;
  politicaDesconto: string;
  garantia: string;
  bonusIncluidos: string;
  vagasLimitadas: string;
  dataAbertura: string;
  dataFechamento: string;
  dataInicioAulas: string;
  // Etapa 4 - Meta financeira
  metaFaturamento: string;
  metaAlunos: string;
  ticketMedio: string;
  metaCPL: string;
  metaCPA: string;
  orcamentoMidia: string;
}

export const INITIAL_FORM_DATA: FormularioEstrategicoData = {
  nomeOficialCurso: "",
  subtituloPromessa: "",
  problemaEspecifico: "",
  transformacaoConcreta: "",
  nivel: "Iniciante",
  modalidade: "Gravado",
  cargaHoraria: "",
  certificacao: "",
  diferenciaisReais: "",
  porQueMelhorQueYoutube: "",
  alunoIdeal: "",
  cargo: "",
  area: "",
  nivelExperiencia: "",
  faixaSalarial: "",
  jaTentouResolver: "",
  maiorDorEmocional: "",
  maiorMedo: "",
  oQueFariaAdiar: "",
  pfPjOuAmbos: "Ambos",
  focoDiversidadeBolsas: "",
  valorCheio: "",
  valorPromocional: "",
  parcelamento: "",
  politicaDesconto: "",
  garantia: "",
  bonusIncluidos: "",
  vagasLimitadas: "",
  dataAbertura: "",
  dataFechamento: "",
  dataInicioAulas: "",
  metaFaturamento: "",
  metaAlunos: "",
  ticketMedio: "",
  metaCPL: "",
  metaCPA: "",
  orcamentoMidia: "",
};
