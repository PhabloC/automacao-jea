"use client";

import { useState, useCallback } from "react";
import type {
  FormularioEstrategicoData,
  NivelCurso,
  ModalidadeCurso,
  PfPj,
} from "./types";
import { INITIAL_FORM_DATA } from "./types";

const STEPS = [
  "Visão geral do curso",
  "Posicionamento e público-alvo",
  "Oferta e condições comerciais",
  "Meta financeira e orçamento",
] as const;

const NIVEL_OPCOES: NivelCurso[] = ["Iniciante", "Intermediário", "Avançado"];
const MODALIDADE_OPCOES: ModalidadeCurso[] = ["Ao vivo", "Gravado", "Híbrido"];
const PF_PJ_OPCOES: PfPj[] = ["PF", "PJ", "Ambos"];

type StepIndex = 0 | 1 | 2 | 3;

const REQUIRED_FIELDS_BY_STEP: (keyof FormularioEstrategicoData)[][] = [
  [
    "nomeOficialCurso",
    "subtituloPromessa",
    "problemaEspecifico",
    "transformacaoConcreta",
    "cargaHoraria",
  ],
  [
    "alunoIdeal",
    "cargo",
    "area",
    "nivelExperiencia",
    "faixaSalarial",
    "maiorDorEmocional",
    "maiorMedo",
  ],
  [
    "valorCheio",
    "valorPromocional",
    "parcelamento",
    "garantia",
    "dataAbertura",
    "dataFechamento",
    "dataInicioAulas",
  ],
  ["metaFaturamento", "metaAlunos", "ticketMedio"],
];

const isStepValid = (
  data: FormularioEstrategicoData,
  stepIndex: StepIndex
): boolean => {
  const fields = REQUIRED_FIELDS_BY_STEP[stepIndex];
  return fields.every((key) => {
    const value = data[key];
    return typeof value === "string" ? value.trim() !== "" : true;
  });
};

export default function FormularioEstrategico() {
  const [step, setStep] = useState<StepIndex>(0);
  const [formData, setFormData] =
    useState<FormularioEstrategicoData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const updateField = useCallback(
    <K extends keyof FormularioEstrategicoData>(
      field: K,
      value: FormularioEstrategicoData[K]
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleNext = useCallback(() => {
    if (step < 3) setStep((s) => (s + 1) as StepIndex);
  }, [step]);

  const handlePrev = useCallback(() => {
    if (step > 0) setStep((s) => (s - 1) as StepIndex);
  }, [step]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitMessage(null);
    try {
      const response = await fetch("/api/formulario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const msg =
          typeof data?.error === "string"
            ? data.error
            : data?.details ?? "Falha no envio";
        throw new Error(msg);
      }
      setSubmitMessage({
        type: "success",
        text: "Formulário enviado com sucesso!",
      });
      setFormData(INITIAL_FORM_DATA);
      setStep(0);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao enviar. Tente novamente.";
      setSubmitMessage({
        type: "error",
        text: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  const currentStepValid = isStepValid(formData, step);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-1">
          Formulário Estratégico de Lançamento de Curso
        </h1>
        <p className="text-gray-400 text-sm">
          Etapa {step + 1} de 4 — {STEPS[step]}
        </p>
        <div className="mt-4 flex gap-2 justify-center">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="h-1.5 flex-1 max-w-16 rounded-full bg-gray-800"
              aria-hidden
            >
              <div
                className="h-full rounded-full bg-red-600 transition-all duration-300"
                style={{ width: i <= step ? "100%" : "0%" }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-red-900/30 shadow-2xl p-6 sm:p-8">
        {step === 0 && (
          <Step1VisaoGeral formData={formData} updateField={updateField} />
        )}
        {step === 1 && (
          <Step2Posicionamento formData={formData} updateField={updateField} />
        )}
        {step === 2 && (
          <Step3Oferta formData={formData} updateField={updateField} />
        )}
        {step === 3 && (
          <Step4MetaFinanceira formData={formData} updateField={updateField} />
        )}

        {submitMessage && (
          <div
            className={`mb-6 px-4 py-3 rounded-xl border ${
              submitMessage.type === "success"
                ? "bg-green-950/30 border-green-800/50 text-green-400"
                : "bg-red-950/30 border-red-800/50 text-red-400"
            }`}
          >
            <p className="text-sm">{submitMessage.text}</p>
          </div>
        )}

        {!currentStepValid && (
          <p className="mt-4 text-sm text-amber-400/90">
            Preencha todos os campos obrigatórios desta etapa para continuar.
          </p>
        )}

        <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3 justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={step === 0}
            className="cursor-pointer px-5 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Voltar etapa"
          >
            Voltar
          </button>
          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!currentStepValid}
              className="cursor-pointer px-5 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Próxima etapa"
            >
              Próxima etapa
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !currentStepValid}
              className="cursor-pointer px-5 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Enviar formulário"
            >
              {isSubmitting ? "Enviando..." : "Enviar formulário"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FieldLabel({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={id}
      className="block text-sm font-medium text-gray-300 mb-1.5"
    >
      {children}
    </label>
  );
}

function FieldText({
  id,
  value,
  onChange,
  placeholder,
  required,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full px-4 py-2.5 rounded-xl bg-gray-800/80 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-600/50"
      aria-label={id}
    />
  );
}

function FieldTextarea({
  id,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-2.5 rounded-xl bg-gray-800/80 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-600/50 resize-y min-h-[80px]"
      aria-label={id}
    />
  );
}

function FieldSelect<T extends string>({
  id,
  value,
  onChange,
  options,
  ariaLabel,
}: {
  id: string;
  value: T;
  onChange: (v: T) => void;
  options: readonly T[];
  ariaLabel?: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="w-full px-4 py-2.5 rounded-xl bg-gray-800/80 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-600/50"
      aria-label={ariaLabel ?? id}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

function FieldDate({
  id,
  value,
  onChange,
  min,
  ariaLabel,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  min?: string;
  ariaLabel?: string;
}) {
  return (
    <input
      id={id}
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      min={min}
      className="w-full px-4 py-2.5 rounded-xl bg-gray-800/80 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-600/50 scheme-dark"
      aria-label={ariaLabel ?? id}
    />
  );
}

function Step1VisaoGeral({
  formData,
  updateField,
}: {
  formData: FormularioEstrategicoData;
  updateField: <K extends keyof FormularioEstrategicoData>(
    field: K,
    value: FormularioEstrategicoData[K]
  ) => void;
}) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
        1. Visão geral do curso
      </h2>
      <div>
        <FieldLabel id="nomeOficialCurso">Nome oficial do curso</FieldLabel>
        <FieldText
          id="nomeOficialCurso"
          value={formData.nomeOficialCurso}
          onChange={(v) => updateField("nomeOficialCurso", v)}
          placeholder="Ex: Método X"
        />
      </div>
      <div>
        <FieldLabel id="subtituloPromessa">
          Subtítulo ou promessa principal
        </FieldLabel>
        <FieldText
          id="subtituloPromessa"
          value={formData.subtituloPromessa}
          onChange={(v) => updateField("subtituloPromessa", v)}
          placeholder="Ex: Do zero ao primeiro resultado em 30 dias"
        />
      </div>
      <div>
        <FieldLabel id="problemaEspecifico">
          Esse curso resolve qual problema específico?
        </FieldLabel>
        <FieldTextarea
          id="problemaEspecifico"
          value={formData.problemaEspecifico}
          onChange={(v) => updateField("problemaEspecifico", v)}
          placeholder="Descreva o problema"
        />
      </div>
      <div>
        <FieldLabel id="transformacaoConcreta">
          Qual transformação concreta o aluno terá ao final?
        </FieldLabel>
        <FieldTextarea
          id="transformacaoConcreta"
          value={formData.transformacaoConcreta}
          onChange={(v) => updateField("transformacaoConcreta", v)}
          placeholder="Ex: Ser capaz de..."
        />
      </div>
      <div>
        <FieldLabel id="nivel">Nível</FieldLabel>
        <FieldSelect
          id="nivel"
          value={formData.nivel}
          onChange={(v) => updateField("nivel", v)}
          options={NIVEL_OPCOES}
          ariaLabel="Nível do curso"
        />
      </div>
      <div>
        <FieldLabel id="modalidade">Modalidade</FieldLabel>
        <FieldSelect
          id="modalidade"
          value={formData.modalidade}
          onChange={(v) => updateField("modalidade", v)}
          options={MODALIDADE_OPCOES}
          ariaLabel="Modalidade do curso"
        />
      </div>
      <div>
        <FieldLabel id="cargaHoraria">Carga horária</FieldLabel>
        <FieldText
          id="cargaHoraria"
          value={formData.cargaHoraria}
          onChange={(v) => updateField("cargaHoraria", v)}
          placeholder="Ex: 40h"
        />
      </div>
      <div>
        <FieldLabel id="certificacao">Certificação? Qual?</FieldLabel>
        <FieldText
          id="certificacao"
          value={formData.certificacao}
          onChange={(v) => updateField("certificacao", v)}
          placeholder="Ex: Certificado de conclusão"
        />
      </div>
      <div>
        <FieldLabel id="diferenciaisReais">
          Diferenciais reais vs concorrentes
        </FieldLabel>
        <FieldTextarea
          id="diferenciaisReais"
          value={formData.diferenciaisReais}
          onChange={(v) => updateField("diferenciaisReais", v)}
          placeholder="Liste os diferenciais"
        />
      </div>
      <div>
        <FieldLabel id="porQueMelhorQueYoutube">
          Por que esse curso é melhor que aprender gratuitamente no YouTube?
        </FieldLabel>
        <FieldTextarea
          id="porQueMelhorQueYoutube"
          value={formData.porQueMelhorQueYoutube}
          onChange={(v) => updateField("porQueMelhorQueYoutube", v)}
          placeholder="Justifique o valor agregado"
        />
      </div>
    </div>
  );
}

function Step2Posicionamento({
  formData,
  updateField,
}: {
  formData: FormularioEstrategicoData;
  updateField: <K extends keyof FormularioEstrategicoData>(
    field: K,
    value: FormularioEstrategicoData[K]
  ) => void;
}) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
        2. Posicionamento e público-alvo
      </h2>
      <div>
        <FieldLabel id="alunoIdeal">Quem é o aluno ideal?</FieldLabel>
        <FieldTextarea
          id="alunoIdeal"
          value={formData.alunoIdeal}
          onChange={(v) => updateField("alunoIdeal", v)}
          placeholder="Perfil do aluno ideal"
        />
      </div>
      <div>
        <FieldLabel id="cargo">Cargo</FieldLabel>
        <FieldText
          id="cargo"
          value={formData.cargo}
          onChange={(v) => updateField("cargo", v)}
          placeholder="Ex: Gerente, Analista"
        />
      </div>
      <div>
        <FieldLabel id="area">Área</FieldLabel>
        <FieldText
          id="area"
          value={formData.area}
          onChange={(v) => updateField("area", v)}
          placeholder="Ex: Marketing, TI"
        />
      </div>
      <div>
        <FieldLabel id="nivelExperiencia">Nível de experiência</FieldLabel>
        <FieldText
          id="nivelExperiencia"
          value={formData.nivelExperiencia}
          onChange={(v) => updateField("nivelExperiencia", v)}
          placeholder="Ex: 0–2 anos"
        />
      </div>
      <div>
        <FieldLabel id="faixaSalarial">Faixa salarial estimada</FieldLabel>
        <FieldText
          id="faixaSalarial"
          value={formData.faixaSalarial}
          onChange={(v) => updateField("faixaSalarial", v)}
          placeholder="Ex: R$ 3k–8k"
        />
      </div>
      <div>
        <FieldLabel id="jaTentouResolver">
          Ele já tentou resolver esse problema antes? Como?
        </FieldLabel>
        <FieldTextarea
          id="jaTentouResolver"
          value={formData.jaTentouResolver}
          onChange={(v) => updateField("jaTentouResolver", v)}
          placeholder="Descreva tentativas anteriores"
        />
      </div>
      <div>
        <FieldLabel id="maiorDorEmocional">Qual maior dor emocional?</FieldLabel>
        <FieldTextarea
          id="maiorDorEmocional"
          value={formData.maiorDorEmocional}
          onChange={(v) => updateField("maiorDorEmocional", v)}
        />
      </div>
      <div>
        <FieldLabel id="maiorMedo">Qual maior medo antes de comprar?</FieldLabel>
        <FieldTextarea
          id="maiorMedo"
          value={formData.maiorMedo}
          onChange={(v) => updateField("maiorMedo", v)}
        />
      </div>
      <div>
        <FieldLabel id="oQueFariaAdiar">
          O que faria ele adiar essa decisão?
        </FieldLabel>
        <FieldTextarea
          id="oQueFariaAdiar"
          value={formData.oQueFariaAdiar}
          onChange={(v) => updateField("oQueFariaAdiar", v)}
        />
      </div>
      <div>
        <FieldLabel id="pfPjOuAmbos">
          Esse curso é para PF, PJ ou ambos?
        </FieldLabel>
        <FieldSelect
          id="pfPjOuAmbos"
          value={formData.pfPjOuAmbos}
          onChange={(v) => updateField("pfPjOuAmbos", v)}
          options={PF_PJ_OPCOES}
          ariaLabel="Público PF, PJ ou ambos"
        />
      </div>
      <div>
        <FieldLabel id="focoDiversidadeBolsas">
          Existe foco em diversidade, bolsas ou recortes específicos?
        </FieldLabel>
        <FieldTextarea
          id="focoDiversidadeBolsas"
          value={formData.focoDiversidadeBolsas}
          onChange={(v) => updateField("focoDiversidadeBolsas", v)}
          placeholder="Ex: Bolsas para grupos sub-representados"
        />
      </div>
    </div>
  );
}

function Step3Oferta({
  formData,
  updateField,
}: {
  formData: FormularioEstrategicoData;
  updateField: <K extends keyof FormularioEstrategicoData>(
    field: K,
    value: FormularioEstrategicoData[K]
  ) => void;
}) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
        3. Oferta e condições comerciais
      </h2>
      <div>
        <FieldLabel id="valorCheio">Valor cheio</FieldLabel>
        <FieldText
          id="valorCheio"
          value={formData.valorCheio}
          onChange={(v) => updateField("valorCheio", v)}
          placeholder="Ex: R$ 997"
        />
      </div>
      <div>
        <FieldLabel id="valorPromocional">Valor promocional</FieldLabel>
        <FieldText
          id="valorPromocional"
          value={formData.valorPromocional}
          onChange={(v) => updateField("valorPromocional", v)}
          placeholder="Ex: R$ 497"
        />
      </div>
      <div>
        <FieldLabel id="parcelamento">Parcelamento</FieldLabel>
        <FieldText
          id="parcelamento"
          value={formData.parcelamento}
          onChange={(v) => updateField("parcelamento", v)}
          placeholder="Ex: 12x sem juros"
        />
      </div>
      <div>
        <FieldLabel id="politicaDesconto">Política de desconto</FieldLabel>
        <FieldTextarea
          id="politicaDesconto"
          value={formData.politicaDesconto}
          onChange={(v) => updateField("politicaDesconto", v)}
          placeholder="Regras de desconto"
        />
      </div>
      <div>
        <FieldLabel id="garantia">Garantia?</FieldLabel>
        <FieldText
          id="garantia"
          value={formData.garantia}
          onChange={(v) => updateField("garantia", v)}
          placeholder="Ex: 7 dias, 30 dias ou não"
        />
      </div>
      <div>
        <FieldLabel id="bonusIncluidos">Bônus incluídos?</FieldLabel>
        <FieldTextarea
          id="bonusIncluidos"
          value={formData.bonusIncluidos}
          onChange={(v) => updateField("bonusIncluidos", v)}
          placeholder="Liste os bônus"
        />
      </div>
      <div>
        <FieldLabel id="vagasLimitadas">Vagas limitadas?</FieldLabel>
        <FieldText
          id="vagasLimitadas"
          value={formData.vagasLimitadas}
          onChange={(v) => updateField("vagasLimitadas", v)}
          placeholder="Ex: Sim, 100 vagas"
        />
      </div>
      <div>
        <FieldLabel id="dataAbertura">Data de abertura</FieldLabel>
        <FieldDate
          id="dataAbertura"
          value={formData.dataAbertura}
          onChange={(v) => updateField("dataAbertura", v)}
          ariaLabel="Data de abertura"
        />
      </div>
      <div>
        <FieldLabel id="dataFechamento">Data de fechamento</FieldLabel>
        <FieldDate
          id="dataFechamento"
          value={formData.dataFechamento}
          onChange={(v) => updateField("dataFechamento", v)}
          min={formData.dataAbertura || undefined}
          ariaLabel="Data de fechamento"
        />
      </div>
      <div>
        <FieldLabel id="dataInicioAulas">Data de início das aulas</FieldLabel>
        <FieldDate
          id="dataInicioAulas"
          value={formData.dataInicioAulas}
          onChange={(v) => updateField("dataInicioAulas", v)}
          min={formData.dataFechamento || undefined}
          ariaLabel="Data de início das aulas"
        />
      </div>
    </div>
  );
}

function Step4MetaFinanceira({
  formData,
  updateField,
}: {
  formData: FormularioEstrategicoData;
  updateField: <K extends keyof FormularioEstrategicoData>(
    field: K,
    value: FormularioEstrategicoData[K]
  ) => void;
}) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
        4. Meta financeira e orçamento
      </h2>
      <div>
        <FieldLabel id="metaFaturamento">
          Meta de faturamento do lançamento
        </FieldLabel>
        <FieldText
          id="metaFaturamento"
          value={formData.metaFaturamento}
          onChange={(v) => updateField("metaFaturamento", v)}
          placeholder="Ex: R$ 150.000"
        />
      </div>
      <div>
        <FieldLabel id="metaAlunos">Meta de alunos</FieldLabel>
        <FieldText
          id="metaAlunos"
          value={formData.metaAlunos}
          onChange={(v) => updateField("metaAlunos", v)}
          placeholder="Ex: 100 alunos"
        />
      </div>
      <div>
        <FieldLabel id="ticketMedio">Ticket médio esperado</FieldLabel>
        <FieldText
          id="ticketMedio"
          value={formData.ticketMedio}
          onChange={(v) => updateField("ticketMedio", v)}
          placeholder="Ex: R$ 1.500"
        />
      </div>
      <div>
        <FieldLabel id="metaCPL">Existe Meta de CPL? Se sim, qual?</FieldLabel>
        <FieldText
          id="metaCPL"
          value={formData.metaCPL}
          onChange={(v) => updateField("metaCPL", v)}
          placeholder="Ex: R$ 50 ou Não"
        />
      </div>
      <div>
        <FieldLabel id="metaCPA">Existe Meta de CPA? Se sim, qual?</FieldLabel>
        <FieldText
          id="metaCPA"
          value={formData.metaCPA}
          onChange={(v) => updateField("metaCPA", v)}
          placeholder="Ex: R$ 200 ou Não"
        />
      </div>
      <div>
        <FieldLabel id="orcamentoMidia">
          Existe algum Orçamento total de mídia? Se sim, qual?
        </FieldLabel>
        <FieldText
          id="orcamentoMidia"
          value={formData.orcamentoMidia}
          onChange={(v) => updateField("orcamentoMidia", v)}
          placeholder="Ex: R$ 30.000 ou Não"
        />
      </div>
    </div>
  );
}
