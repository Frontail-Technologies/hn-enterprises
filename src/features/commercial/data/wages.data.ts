function wageRow(
  id: string,
  name: string,
  category: string,
  wageRate: number,
  daysWorked: number,
  pf: number,
  esic: number,
  status: string,
) {
  const basic = Math.round(wageRate * daysWorked);
  const total = basic;
  const totalDeduction = pf + esic;
  const netPayment = total - totalDeduction;

  return {
    id,
    name,
    category,
    wageRate,
    daysWorked,
    basic,
    total,
    pf,
    esic,
    totalDeduction,
    netPayment,
    status,
  };
}

export const wageRegisterRows = [
  wageRow(
    "wg-1",
    "ASHIS GAUR",
    "High Skilled",
    2307.69,
    26,
    1800,
    0,
    "Approved",
  ),
  wageRow("wg-2", "BIPLAB SARKAR", "Skilled", 1153.85, 26, 1800, 0, "Approved"),
  wageRow(
    "wg-3",
    "HARICHARAN BORO",
    "Skilled",
    1153.85,
    26,
    1800,
    0,
    "Pending",
  ),
  wageRow(
    "wg-4",
    "MANIK CARKAR SARKAR",
    "Unskilled",
    692.31,
    26,
    1800,
    135,
    "Approved",
  ),
  wageRow(
    "wg-5",
    "SK HASIBUR",
    "High Skilled",
    2307.69,
    26,
    1800,
    0,
    "Approved",
  ),
  wageRow(
    "wg-6",
    "SAHNAWYAZ R MALLICK",
    "High Skilled",
    1923.08,
    26,
    1800,
    0,
    "Pending",
  ),
];
