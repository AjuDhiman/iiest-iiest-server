
export class AddSales {
    static readonly type = '[Sales] Add';
    constructor(public payload:any){}
}

export class UpdateSales {
    static readonly type = '[Sales] Update';
    constructor(public objId: string, public payload: any){}
}

export class DeleteSales {
    static readonly type = '[Sales] Delete';
    constructor(public objId:string){}
}

export class GetSales {
    static readonly type = '[Sales] Get';
}

export class SetSalesLoadedFalse {
    static readonly type = '[Sales] Get';
}

export class GeneralData {
    static readonly type = '[Sales] General Data';
}

// export class PincodesData {
//     static readonly type = '[pincodes] General Data';
// }