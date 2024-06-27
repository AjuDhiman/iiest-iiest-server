import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'inrAmount'
})
export class InrAmountPipe implements PipeTransform {

  transform(amount: string | number): string {
    let amountNum = Number(amount);
    if (amountNum == null || isNaN(Number(amountNum))) {
      return '';
    }

    // Convert the amount to string
    let amountStr: string = Number(amountNum).toFixed(2);

    // Split the amount into rupees and paise parts
    let [rupees, paise] = amountStr.split('.');

    // Format rupees part
    let formattedRupees: string = this.formatRupees(parseInt(rupees));

    // Concatenate rupees and paise parts
    let result: string = formattedRupees;
    if (paise) {
      result += '.' + paise;
    }

    return result;
  }

  private formatRupees(rupees: number): string {
    // Regular expression to add commas every three digits
    const digitArr = rupees.toString().split('');

    let formattedRupees: string;
    
    let regex = /\B(?=(\d{2})+(?!\d))/g;
    if(digitArr.length > 3){
      const firstDigits = digitArr.slice(0, -3).join('');
      const lastDigits = digitArr.slice(-3).join('');
  
      // Break rupees into units and format with commas
      formattedRupees = '₹' + firstDigits.toString().replace(regex, ',') + ',' +  lastDigits;
    } else {
      formattedRupees = '₹' + rupees.toString();
    }

    return formattedRupees;
  }
}