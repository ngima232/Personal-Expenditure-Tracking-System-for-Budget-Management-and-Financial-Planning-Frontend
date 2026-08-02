import currencyCodes from "currency-codes";

const currencies = currencyCodes.data
  .filter((currency) => currency.code && currency.currency)
  .sort((a, b) => a.code.localeCompare(b.code))
  .map((currency) => ({
    value: currency.code,
    label: `${currency.code} - ${currency.currency}`,
  }));

export default currencies;