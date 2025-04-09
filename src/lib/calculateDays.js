// Today
const dateNow = new Date()

// Next day
const dateNext = new Date(dateNow.valueOf() + (1) * 24 * 60 * 60 * 1000)

// Before day
const dateBefore = new Date(dateNow.valueOf() - (1) * 24 * 60 * 60 * 1000)

// day 45
const date45 = new Date(dateNow.valueOf() + (45 - 1) * 24 * 60 * 60 * 1000)

let nextDate = function (date) {
  return new Date(date.valueOf() + (1) * 24 * 60 * 60 * 1000)
}
let beforeDate = function (date) {
  return new Date(date.valueOf() - (1) * 24 * 60 * 60 * 1000)
}
/*
  Function to change the format of a date
  The date format must be dd/mm/yyyy
**/
const changeFormatDate = (date, format, fix = true) => {
  let newDate = ''
  let dateLatin = ''
  // format date is valid
  if (fix) {
    // Separate the values sent on the  date
    const day = date.slice(0, 2)
    const month = date.slice(3, 5)
    const year = date.slice(6)
    //
    dateLatin = new Date([month, day, year].join('/'))
  } else {
    dateLatin = new Date(date)
  }
  // The name of the days in spanish
  const nameDays = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLE', 'JUEVES', 'VIERNES', 'SÁBADO']
  // The name of months in spanish
  const nameMonth = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO',
    'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE']
  // Select format
  switch (format) {
    case('onlyDay'): {
      newDate = [nameDays[dateLatin.getDay()], dateLatin.getDate()].join(' ')
      break
    }
    case('dayMonthYear'): {
      newDate = [dateLatin.getDate(), nameMonth[dateLatin.getMonth()], dateLatin.getFullYear()].join(' ')
      break
    }
    case('dayMonth'): {
      newDate = [dateLatin.getDate(), nameMonth[dateLatin.getMonth()]].join(' ')
      break
    }
    default:
      newDate = ''
      break
  }
  return newDate
}


export {
  dateNow,
  dateNext,
  dateBefore,
  date45,
  nextDate,
  beforeDate,
  changeFormatDate
}
