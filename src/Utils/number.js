import 'intl'

import 'intl/locale-data/jsonp/en'

export const currencyFormatIntl = (num, currency = true, min, max) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: currency ? 'currency' : undefined,
    currency: 'USD',
    minimumFractionDigits: min ?? 2,
    maximumFractionDigits: max ?? 2
  })
  return formatter.format(num)
}
