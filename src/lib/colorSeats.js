//let activeButton = ''

let changeColor = function (name) {
  let elementList = document.getElementById('list-' + name) //  List
  let elementHour = document.getElementById('hour-' + name) //  Hour
  let elementPrice = document.getElementById('price-' + name) // Price

  // Activate
  if (elementList.classList.contains('bg-light')) {
    elementHour.classList.remove('text-info')
    elementPrice.classList.remove('text-info')
    elementList.classList.replace('bg-light', 'bg-info')
    elementList.classList.replace('text-dark', 'text-white')
    //this.activeButton = name
  } else { // deactivate
    elementHour.classList.add('text-info')
    elementPrice.classList.add('text-info')
    elementList.classList.replace('bg-info', 'bg-light')
    elementList.classList.replace('text-white', 'text-dark')
    //this.activeButton = ''
  }
}

//let  changeColorTT = function (name) {
//  alert(name)
//  if ('' !== this.activeButton && this.activeButton !== name) {
//    this.changeColor(this.activeButton)
//  }
//  this.changeColor(name)
//}

export {
  activeButton,
  changeColor,
  changeColorTT
}
