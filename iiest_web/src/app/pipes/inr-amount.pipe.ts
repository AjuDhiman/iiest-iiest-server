import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'inrAmount'
})
export class InrAmountPipe implements PipeTransform {

  transform(amount: number): string {
    if (amount == null || isNaN(amount)) {
      return '';
    }

    // Convert the amount to string
    let amountStr: string = amount.toFixed(2);

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
    const firstDigits = rupees.toString().split('').slice(0, -3).join('');
    const lastDigits = rupees.toString().split('').slice(-3).join('');
    
    let regex = /\B(?=(\d{2})+(?!\d))/g;

    // Break rupees into units and format with commas
    let formattedRupees = '₹' + firstDigits.toString().replace(regex, ',') + ',' +  lastDigits;

    return formattedRupees;
  }
}