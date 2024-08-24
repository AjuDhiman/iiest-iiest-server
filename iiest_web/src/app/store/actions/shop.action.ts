
export class AddShop {
    static readonly type = '[Shop] Add';
    constructor(public payload:any){}
}

export class UpdateShop {
    static readonly type = '[Shop] Update';
    constructor(public objId: string, public payload: any){}
}

export class DeleteShop {
    static readonly type = '[Shop] Delete';
    constructor(public objId:string){}
}

export class GetShops {
    static readonly type = '[Shop] Get';
}

export class GeneralData {
    static readonly type = '[Shop] General Data';
}
