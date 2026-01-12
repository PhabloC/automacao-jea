export const MONTHS = [
  { id: "1", name: "Janeiro" },
  { id: "2", name: "Fevereiro" },
  { id: "3", name: "Março" },
  { id: "4", name: "Abril" },
  { id: "5", name: "Maio" },
  { id: "6", name: "Junho" },
  { id: "7", name: "Julho" },
  { id: "8", name: "Agosto" },
  { id: "9", name: "Setembro" },
  { id: "10", name: "Outubro" },
  { id: "11", name: "Novembro" },
  { id: "12", name: "Dezembro" },
] as const;

//VERIFICAR SE VAI SER USADO
export const YEARS = (() => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 0; i <= 5; i++) {
    years.push({
      id: String(currentYear + i),
      name: String(currentYear + i),
    });
  }
  return years;
})();
